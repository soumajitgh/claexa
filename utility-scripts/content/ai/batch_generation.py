import time
import json
import csv
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from google import genai
from google.genai import types


def _load_prompt(path: str) -> str:
    """
    Load prompt content from a file.
    
    Args:
        path: The file path to load the prompt from
        
    Returns:
        The prompt content as a string, or empty string if file doesn't exist
    """
    prompt_file = Path(path)
    if prompt_file.exists():
        return prompt_file.read_text(encoding="utf-8").strip()
    return ""


def _save_summaries_to_csv(
    summaries_dict: Dict[str, str],
    batch_id: str,
    output_dir: str
) -> Optional[str]:
    """
    Save summaries to a CSV file.
    
    Args:
        summaries_dict: Dictionary mapping document keys to summaries
        batch_id: The batch job ID to use as filename
        output_dir: Directory to save the CSV file
        
    Returns:
        Path to the saved CSV file, or None if save failed
    """
    try:
        # Create output directory if it doesn't exist
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Clean batch ID for filename (remove any path separators)
        clean_batch_id = batch_id.replace('/', '_').replace('\\', '_')
        csv_filename = f"{clean_batch_id}.csv"
        csv_filepath = output_path / csv_filename
        
        # Write summaries to CSV
        with open(csv_filepath, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            # Write header
            writer.writerow(['document_key', 'summary'])
            # Write data
            for key, summary in summaries_dict.items():
                writer.writerow([key, summary])
        
        print(f"Summaries saved to: {csv_filepath}")
        return str(csv_filepath)
        
    except Exception as e:
        print(f"Warning: Failed to save summaries to CSV: {e}")
        return None


def generate_summaries_batch(
    client: genai.Client,
    documents: List[Tuple[str, types.File]],
    poll_interval: int = 30,
    max_wait_time: int = 3600,
    output_dir: Optional[str] = None
) -> Dict[str, str]:
    """
    Generate summaries for multiple documents using Google Gemini Batch API.
    This is more cost-effective (50% of standard cost) for bulk processing.
    
    Args:
        client: An instance of the Google Gemini client
        documents: List of tuples (key, uploaded_file) where key is a unique identifier
        poll_interval: How often to check job status in seconds (default: 30)
        max_wait_time: Maximum time to wait for job completion in seconds (default: 3600 = 1 hour)
        
    Returns:
        Dictionary mapping keys to generated summaries
        
    Raises:
        ValueError: If no summaries are generated or job fails
        TimeoutError: If job doesn't complete within max_wait_time
    """
    if not documents:
        return {}
    
    print(f"Creating batch summary generation job for {len(documents)} documents...")
    
    # Load the system prompt
    prompt_path = Path(__file__).parent / "system_prompt.md"
    system_prompt = _load_prompt(str(prompt_path))
    
    # Prepare inline requests for batch generation
    inline_requests = []
    for key, uploaded_file in documents:
        # Prepare contents with system prompt (if available) and document
        contents = []
        if system_prompt:
            contents.append({'parts': [{'text': system_prompt}]})

        # Add the file reference
        contents.append({
            'parts': [{
                'fileData': {
                    'fileUri': uploaded_file.uri,
                    'mimeType': uploaded_file.mime_type
                }
            }]
        })
        
        inline_requests.append({
            'contents': contents,
        })
        
    
    # Create batch job for content generation
    batch_job = client.batches.create(
        model="models/gemini-2.5-flash-lite",
        src=inline_requests,
        config={
            'display_name': f"summaries-batch-{int(time.time())}"
        }
    )
    
    job_name = batch_job.name
    print(f"Batch job created: {job_name}")
    print(f"Initial state: {batch_job.state.name}")
    
    # Poll for job completion
    completed_states = {
        'JOB_STATE_SUCCEEDED',
        'JOB_STATE_FAILED',
        'JOB_STATE_CANCELLED',
        'JOB_STATE_EXPIRED'
    }
    
    start_time = time.time()
    elapsed = 0
    
    while batch_job.state.name not in completed_states: # type: ignore
        if elapsed >= max_wait_time:
            # Try to cancel the job
            try:
                client.batches.cancel(name=job_name) # type: ignore
            except Exception:
                pass
            raise TimeoutError(
                f"Batch job did not complete within {max_wait_time} seconds. "
                f"Last state: {batch_job.state.name}" # type: ignore
            )
        
        print(f"Job state: {batch_job.state.name} (elapsed: {elapsed}s)") # type: ignore
        time.sleep(poll_interval)
        batch_job = client.batches.get(name=job_name) # type: ignore
        elapsed = int(time.time() - start_time)
    
    # Check final state
    print(f"Job finished with state: {batch_job.state.name}") # type: ignore
    
    if batch_job.state.name == 'JOB_STATE_FAILED':
        error_msg = batch_job.error if hasattr(batch_job, 'error') else "Unknown error"
        raise ValueError(f"Batch job failed: {error_msg}")
    
    if batch_job.state.name == 'JOB_STATE_CANCELLED':
        raise ValueError("Batch job was cancelled")
    
    if batch_job.state.name == 'JOB_STATE_EXPIRED':
        raise ValueError("Batch job expired")
    
    # Extract summaries from results
    summaries_dict = {}
    
    if not batch_job.dest or not batch_job.dest.inlined_responses:
        raise ValueError("No responses found in batch job result")
    
    # Match responses with original keys by index
    for idx, response in enumerate(batch_job.dest.inlined_responses):
        if idx >= len(documents):
            break
            
        key = documents[idx][0]  # Get the key from the original documents list
        
        if response.response:
            # Extract the text from the response
            if hasattr(response.response, 'text') and response.response.text:
                summaries_dict[key] = response.response.text
            else:
                print(f"Warning: No text found for document at index {idx}")
        elif hasattr(response, 'error') and response.error:
            print(f"Error for document at index {idx}: {response.error}")
    
    print(f"Successfully generated {len(summaries_dict)} summaries")
    
    # Save summaries to CSV if output directory is provided
    if output_dir and summaries_dict and job_name:
        _save_summaries_to_csv(summaries_dict, job_name, output_dir)
    
    # Clean up the batch job
    try:
        client.batches.delete(name=job_name)  # type: ignore
        print(f"Cleaned up batch job: {job_name}")
    except Exception as e:
        print(f"Warning: Could not delete batch job: {e}")
    
    return summaries_dict


def generate_summaries_batch_chunked(
    client: genai.Client,
    documents: List[Tuple[str, types.File]],
    chunk_size: int = 50,
    poll_interval: int = 30,
    max_wait_time: int = 3600,
    output_dir: Optional[str] = None
) -> Dict[str, str]:
    """
    Generate summaries in chunks to avoid timeouts and manage large batches better.
    
    Args:
        client: An instance of the Google Gemini client
        documents: List of tuples (key, uploaded_file) where key is a unique identifier
        chunk_size: Number of items to process in each batch (default: 50)
        poll_interval: How often to check job status in seconds (default: 30)
        max_wait_time: Maximum time to wait for each job completion in seconds
        
    Returns:
        Dictionary mapping keys to summaries
    """
    all_summaries = {}
    
    # Process in chunks
    for i in range(0, len(documents), chunk_size):
        chunk = documents[i:i + chunk_size]
        chunk_num = (i // chunk_size) + 1
        total_chunks = (len(documents) + chunk_size - 1) // chunk_size
        
        print(f"\n--- Processing chunk {chunk_num}/{total_chunks} ({len(chunk)} documents) ---")
        
        try:
            chunk_summaries = generate_summaries_batch(
                client=client,
                documents=chunk,
                poll_interval=poll_interval,
                max_wait_time=max_wait_time,
                output_dir=output_dir
            )
            all_summaries.update(chunk_summaries)
        except Exception as e:
            print(f"Error processing chunk {chunk_num}: {e}")
            # Continue with next chunk instead of failing completely
            continue
    
    return all_summaries
