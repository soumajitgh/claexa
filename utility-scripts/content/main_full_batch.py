from pathlib import Path
from typing import Dict, List, Tuple, Optional
from google import genai
from google.genai import types
import boto3
from pinecone import Pinecone
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
from config import Settings, get_settings
from document import load_all_documents, clear_processed_document
from ai.document import upload_local_document_to_ai
from ai.batch_generation import generate_summaries_batch_chunked
from ai.vector_generation import generate_embeddings
from hashing import get_pdf_hash
from pinecone_vector_store import store_vector, check_vector_exists
from vector_models import CreateVectorDTO
from s3_object_storage import upload_document_to_bucket, UploadDocumentDTO

# Thread-safe locks for shared data structures
uploaded_docs_lock = Lock()
metadata_lock = Lock()


def generate_embedding_worker(
    key: str,
    content: str,
    client: genai.Client,
    worker_id: int
) -> Tuple[str, Optional[List[float]], Optional[str]]:
    """
    Worker function to generate embedding for a single content.
    
    Returns:
        Tuple of (key, embedding_values, error_message)
    """
    try:
        print(f"[Embedding Worker {worker_id}] Generating embedding for: {key[:50]}...")
        embeddings = generate_embeddings(client, content)
        
        if embeddings and len(embeddings) > 0:
            embedding_values = embeddings[0].values
            if embedding_values:
                print(f"[Embedding Worker {worker_id}] ✓ Generated {len(embedding_values)} dims")
                return (key, embedding_values, None)
            else:
                error = "No embedding values"
                print(f"[Embedding Worker {worker_id}] ✗ {error}")
                return (key, None, error)
        else:
            error = "No embeddings returned"
            print(f"[Embedding Worker {worker_id}] ✗ {error}")
            return (key, None, error)
            
    except Exception as e:
        error = str(e)
        print(f"[Embedding Worker {worker_id}] ✗ Error: {error}")
        return (key, None, error)


def generate_embeddings_parallel(
    client: genai.Client,
    contents: List[Tuple[str, str]],
    max_workers: int = 3
) -> Dict[str, List[float]]:
    """
    Generate embeddings for multiple contents in parallel.
    
    Args:
        client: Google Gemini client
        contents: List of (key, content) tuples
        max_workers: Number of parallel workers
        
    Returns:
        Dictionary mapping keys to embedding vectors
    """
    embeddings_dict = {}
    failed_count = 0
    
    print(f"\nGenerating embeddings in parallel with {max_workers} workers...")
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all embedding tasks
        future_to_key = {
            executor.submit(
                generate_embedding_worker,
                key,
                content,
                client,
                i + 1
            ): key
            for i, (key, content) in enumerate(contents)
        }
        
        # Collect results as they complete
        for future in as_completed(future_to_key):
            key, embedding_values, error = future.result()
            
            if embedding_values:
                embeddings_dict[key] = embedding_values
            else:
                failed_count += 1
                print(f"Failed to generate embedding for {key}: {error}")
    
    print(f"Embeddings complete: {len(embeddings_dict)} succeeded, {failed_count} failed")
    return embeddings_dict


def process_single_document_upload(
    doc_path: Path,
    client: genai.Client,
    pinecone_index,
    settings: Settings,
    worker_id: int
) -> Tuple[bool, str, Path, Optional[types.File], Optional[str]]:
    """
    Process a single document: hash, check existence, and upload to AI service.
    
    Returns:
        Tuple of (success, status_message, doc_path, uploaded_file, file_hash)
    """
    try:
        print(f"[Worker {worker_id}] Processing: {doc_path.name}")
        
        # Generate hash
        file_hash = get_pdf_hash(doc_path)
        print(f"[Worker {worker_id}] Hash: {file_hash}")
        
        # Check if already exists
        if check_vector_exists(pinecone_index, file_hash):
            print(f"[Worker {worker_id}] Already exists in Pinecone, skipping")
            clear_processed_document(doc_path, settings.processed_directory)
            return (False, "skipped", doc_path, None, file_hash)
        
        # Upload to AI service
        uploaded_file = upload_local_document_to_ai(client, doc_path)
        print(f"[Worker {worker_id}] Uploaded to AI service")
        
        return (True, "uploaded", doc_path, uploaded_file, file_hash)
        
    except Exception as e:
        error_msg = f"Error: {str(e)}"
        print(f"[Worker {worker_id}] {error_msg}")
        return (False, error_msg, doc_path, None, None)


def prepare_documents_full_batch(
    documents: List[Path],
    settings: Settings,
    client: genai.Client,
    pinecone_index,
) -> Tuple[List[Tuple[str, types.File]], Dict[str, Dict]]:
    """
    Prepare documents for full batch processing: upload to AI service in parallel, check existence.
    Does NOT generate summaries yet - that will be done in batch.
    
    Returns:
        Tuple of (uploaded_documents, document_metadata)
        - uploaded_documents: List of (key, uploaded_file) tuples ready for batch summary generation
        - document_metadata: Dictionary mapping keys to document metadata
    """
    uploaded_documents: List[Tuple[str, types.File]] = []
    document_metadata: Dict[str, Dict] = {}
    skipped_count = 0
    failed_count = 0
    
    print(f"\n{'='*60}")
    print("Phase 1: Parallel Document Upload & Existence Check")
    print(f"{'='*60}\n")
    print(f"Using {settings.max_workers} parallel workers for uploading...\n")
    
    # Process documents in parallel
    with ThreadPoolExecutor(max_workers=settings.max_workers) as executor:
        # Submit all upload tasks
        future_to_doc = {
            executor.submit(
                process_single_document_upload,
                doc_path,
                client,
                pinecone_index,
                settings,
                i + 1
            ): (i, doc_path)
            for i, doc_path in enumerate(documents)
        }
        
        # Process completed uploads
        for future in as_completed(future_to_doc):
            idx, doc_path = future_to_doc[future]
            try:
                success, status, path, uploaded_file, file_hash = future.result()
                
                if success and uploaded_file and file_hash:
                    # Thread-safe append to shared lists
                    key = file_hash
                    
                    with uploaded_docs_lock:
                        uploaded_documents.append((key, uploaded_file))
                    
                    with metadata_lock:
                        document_metadata[key] = {
                            'document_path': path,
                            'file_hash': file_hash,
                            'uploaded_file': uploaded_file,
                            's3_object_key': file_hash
                        }
                    
                    print(f"✓ [{idx + 1}/{len(documents)}] {path.name} - Ready for batch processing")
                    
                elif status == "skipped":
                    skipped_count += 1
                    print(f"⊘ [{idx + 1}/{len(documents)}] {path.name} - Already exists")
                    
                else:
                    failed_count += 1
                    print(f"✗ [{idx + 1}/{len(documents)}] {path.name} - Failed: {status}")
                    
            except Exception as e:
                failed_count += 1
                print(f"✗ [{idx + 1}/{len(documents)}] {doc_path.name} - Exception: {str(e)}")
    
    print(f"\n{'='*60}")
    print(f"Phase 1 Complete:")
    print(f"  - Uploaded for batch processing: {len(uploaded_documents)}")
    print(f"  - Skipped (existing): {skipped_count}")
    print(f"  - Failed: {failed_count}")
    print(f"{'='*60}\n")
    
    return uploaded_documents, document_metadata


def store_documents_with_summaries_and_embeddings(
    summaries_dict: Dict[str, str],
    embeddings_dict: Dict[str, List[float]],
    document_metadata: Dict[str, Dict],
    settings: Settings,
    pinecone_index,
    s3_client
) -> Tuple[int, int]:
    """
    Store documents to S3 and vectors to Pinecone using batch-generated summaries and embeddings.
    
    Returns:
        Tuple of (success_count, failed_count)
    """
    success_count = 0
    failed_count = 0
    
    print(f"\n{'='*60}")
    print("Phase 4: Document Storage & Vector Indexing")
    print(f"{'='*60}\n")
    
    # Only process documents that have both summary and embedding
    valid_keys = set(summaries_dict.keys()) & set(embeddings_dict.keys()) & set(document_metadata.keys())
    
    for idx, key in enumerate(valid_keys, start=1):
        metadata = document_metadata[key]
        doc_path = metadata['document_path']
        summary = summaries_dict[key]
        embedding_values = embeddings_dict[key]
        
        try:
            print(f"[{idx}/{len(valid_keys)}] Storing: {doc_path.name}")
            
            # Upload to S3
            upload_dto = UploadDocumentDTO(
                bucket_name=settings.s3_bucket_name,
                object_key=metadata['s3_object_key'],
                path=str(doc_path)
            )
            upload_document_to_bucket(s3_client, upload_dto)
            print(f"  - Uploaded to S3")
            
            # Create and store vector
            vector_dto = CreateVectorDTO(
                embedding=embedding_values,
                text_content=summary,
                file_hash=metadata['file_hash'],
                object_key=metadata['s3_object_key']
            )
            store_vector(pinecone_index, vector_dto)
            print(f"  - Vector stored in Pinecone")
            
            # Move to processed directory
            clear_processed_document(doc_path, settings.processed_directory)
            print(f"  ✓ Complete")
            
            success_count += 1
            
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            failed_count += 1
    
    print(f"\n{'='*60}")
    print(f"Phase 4 Complete:")
    print(f"  - Successfully stored: {success_count}")
    print(f"  - Failed: {failed_count}")
    print(f"{'='*60}\n")
    
    return success_count, failed_count


def process_document_chunk(
    chunk: List[Path],
    chunk_num: int,
    total_chunks: int,
    settings: Settings,
    client: genai.Client,
    pinecone_index,
    s3_client
) -> Tuple[int, int, int]:
    """
    Process a single chunk of documents through the complete pipeline:
    1. Upload documents in parallel (Phase 1)
    2. Generate summaries in batch (Phase 2)
    3. Generate embeddings in batch (Phase 3)
    4. Store to S3 and Pinecone (Phase 4)
    
    Returns:
        Tuple of (processed_count, skipped_count, failed_count)
    """
    print(f"\n{'='*60}")
    print(f"PROCESSING CHUNK {chunk_num}/{total_chunks} ({len(chunk)} documents)")
    print(f"{'='*60}\n")
    
    # Phase 1: Upload this chunk's documents in parallel
    uploaded_documents, document_metadata = prepare_documents_full_batch(
        documents=chunk,
        settings=settings,
        client=client,
        pinecone_index=pinecone_index,
    )
    
    skipped_count = len(chunk) - len(uploaded_documents) - len([m for m in document_metadata.values() if 'error' in m])
    
    if not uploaded_documents:
        print(f"No documents to process in chunk {chunk_num}. All may have been skipped.")
        return (0, skipped_count, 0)
    
    # Phase 2: Generate summaries for this chunk
    print(f"\nChunk {chunk_num} - Phase 2: Batch Summary Generation")
    print(f"Generating summaries for {len(uploaded_documents)} documents...")
    
    try:
        from ai.batch_generation import generate_summaries_batch
        summaries_dict = generate_summaries_batch(
            client=client,
            documents=uploaded_documents,
            poll_interval=settings.batch_poll_interval,
            max_wait_time=settings.batch_max_wait_time,
            output_dir=settings.processed_directory
        )
        
        print(f"Phase 2 Complete: {len(summaries_dict)} summaries generated")
        
    except Exception as e:
        print(f"✗ Batch summary generation failed: {str(e)}")
        return (0, skipped_count, len(uploaded_documents))
    
    if not summaries_dict:
        print("No summaries generated.")
        return (0, skipped_count, len(uploaded_documents))
    
    # Phase 3: Generate embeddings for this chunk's summaries in parallel
    print(f"\nChunk {chunk_num} - Phase 3: Parallel Embedding Generation")
    
    summaries_for_embedding: List[Tuple[str, str]] = [
        (key, summary) for key, summary in summaries_dict.items()
    ]
    
    print(f"Generating embeddings for {len(summaries_for_embedding)} summaries...")
    
    try:
        embeddings_dict = generate_embeddings_parallel(
            client=client,
            contents=summaries_for_embedding,
            max_workers=settings.max_workers
        )
        
        print(f"Phase 3 Complete: {len(embeddings_dict)} embeddings generated")
        
    except Exception as e:
        print(f"✗ Parallel embedding failed: {str(e)}")
        return (0, skipped_count, len(summaries_dict))
    
    # Phase 4: Store documents and vectors for this chunk
    print(f"\nChunk {chunk_num} - Phase 4: Storage & Indexing")
    
    success_count, failed_count = store_documents_with_summaries_and_embeddings(
        summaries_dict=summaries_dict,
        embeddings_dict=embeddings_dict,
        document_metadata=document_metadata,
        settings=settings,
        pinecone_index=pinecone_index,
        s3_client=s3_client
    )
    
    print(f"\nChunk {chunk_num} Complete: {success_count} processed, {failed_count} failed")
    
    return (success_count, skipped_count, failed_count)


def main_full_batch():
    """
    Main function using Gemini Batch API for summaries and parallel processing for embeddings.
    Processes documents in chunks - upload, batch process, store, then move to next chunk.
    This provides cost savings (50% on summaries) with fast parallel embeddings.
    """
    # Load configuration
    settings = get_settings()
    
    # Initialize clients
    client = genai.Client(api_key=settings.gemini_api_key)
    
    aws_client_kwargs = {"region_name": settings.aws_region}
    if settings.aws_access_key_id and settings.aws_secret_access_key:
        aws_client_kwargs.update({
            "aws_access_key_id": settings.aws_access_key_id,
            "aws_secret_access_key": settings.aws_secret_access_key,
        })
    
    pc = Pinecone(api_key=settings.pinecone_api_key)
    pinecone_index = pc.Index(settings.vector_index_name)
    s3_client = boto3.client("s3", **aws_client_kwargs)
    
    # Print configuration
    print(f"\n{'='*60}")
    print("BATCH MODE - INCREMENTAL CHUNK PROCESSING")
    print(f"{'='*60}")
    print(f"AWS Region: {settings.aws_region}")
    print(f"Document Bucket: {settings.s3_bucket_name}")
    print(f"Vector Index: {settings.vector_index_name}")
    print(f"Input Directory: {settings.input_directory}")
    print(f"Processed Directory: {settings.processed_directory}")
    print(f"Chunk Size: {settings.batch_generation_chunk_size} documents")
    print(f"Upload Workers: {settings.max_workers}")
    print(f"Embedding Workers: {settings.max_workers}")
    print(f"{'='*60}\n")
    print("Processing strategy: Upload → Batch Summarize → Parallel Embed → Store per chunk")
    print(f"{'='*60}\n")
    
    # Load all documents
    documents = load_all_documents(settings.input_directory)
    
    if not documents:
        print("No documents found to process.")
        return
    
    print(f"Found {len(documents)} documents to process\n")
    
    # Calculate chunks
    chunk_size = settings.batch_generation_chunk_size
    total_chunks = (len(documents) + chunk_size - 1) // chunk_size
    
    print(f"Will process in {total_chunks} chunks of {chunk_size} documents each\n")
    
    # Process each chunk incrementally
    total_processed = 0
    total_skipped = 0
    total_failed = 0
    
    for i in range(0, len(documents), chunk_size):
        chunk = documents[i:i + chunk_size]
        chunk_num = (i // chunk_size) + 1
        
        processed, skipped, failed = process_document_chunk(
            chunk=chunk,
            chunk_num=chunk_num,
            total_chunks=total_chunks,
            settings=settings,
            client=client,
            pinecone_index=pinecone_index,
            s3_client=s3_client
        )
        
        total_processed += processed
        total_skipped += skipped
        total_failed += failed
    
    # Final summary
    print(f"\n{'='*60}")
    print("FINAL SUMMARY")
    print(f"{'='*60}")
    print(f"Total documents found: {len(documents)}")
    print(f"Successfully processed: {total_processed}")
    print(f"Skipped (already exists): {total_skipped}")
    print(f"Failed: {total_failed}")
    print(f"{'='*60}\n")
    print("Parallel embeddings: Fast processing with standard API")
    print("Memory efficient: Documents processed incrementally per chunk")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main_full_batch()
