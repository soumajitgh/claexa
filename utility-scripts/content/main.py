from pathlib import Path
from pprint import pprint
from google import genai
import boto3
from pinecone import Pinecone
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
from config import Settings, get_settings
from document import load_all_documents, clear_processed_document
from ai.document import upload_local_document_to_ai
from ai.generation import generate_summary
from ai.vector_generation import generate_embeddings
from hashing import get_pdf_hash
from pinecone_vector_store import store_vector, check_vector_exists
from vector_models import CreateVectorDTO
from s3_object_storage import upload_document_to_bucket, UploadDocumentDTO


# Global lock for thread-safe document loading
document_lock = Lock()


def process_document(document_path: Path, settings: Settings, client, pinecone_index, s3_client, worker_id: int):
    """
    Process a single document: generate hash, check existence, create embeddings, and store.
    
    Args:
        document_path: Path to the document to process
        settings: Application settings
        client: Google Gemini client
        pinecone_index: Pinecone index instance
        s3_client: S3 client instance
        worker_id: ID of the worker thread for logging
        
    Returns:
        tuple: (success: bool, document_path: Path, message: str)
    """
    try:
        print(f"[Worker {worker_id}] Processing document: {document_path}")

        # Generate hash for the document
        file_hash = get_pdf_hash(document_path)
        print(f"[Worker {worker_id}] Generated file hash: {file_hash}")
        
        # Check if vector with this hash already exists in Pinecone
        if check_vector_exists(pinecone_index, file_hash):
            print(f"[Worker {worker_id}] Vector with hash {file_hash} already exists in Pinecone. Skipping processing.")
            # Move the processed document to avoid reprocessing
            clear_processed_document(document_path, settings.processed_directory)
            print(f"[Worker {worker_id}] Document moved to processed directory: {settings.processed_directory}")
            return (True, document_path, "Already exists - skipped")

        # Define S3 object key for document storage
        s3_object_key = f"{file_hash}"

        # Upload the document to AI service
        uploaded_file = upload_local_document_to_ai(client, document_path)
        print(f"[Worker {worker_id}] Uploaded document to AI: {uploaded_file.name}")
        
        # Generate a summary for the uploaded document
        summary = generate_summary(client, uploaded_file)
        pprint(f"[Worker {worker_id}] Generated summary: {summary}")
        
        # Generate vector embeddings from the summary
        embeddings = generate_embeddings(client, summary)
        pprint(f"[Worker {worker_id}] Generated embeddings: {type(embeddings)}")

        # Extract the actual embedding values from the response
        embedding_values = embeddings[0].values if embeddings and len(embeddings) > 0 else []
        
        if not embedding_values:
            raise ValueError("No embedding values generated")
        
        # Upload document to S3 after embedding creation
        upload_dto = UploadDocumentDTO(
            bucket_name=settings.s3_bucket_name,
            object_key=s3_object_key,
            path=str(document_path)
        )
        upload_document_to_bucket(s3_client, upload_dto)
        print(f"[Worker {worker_id}] Document uploaded to S3: s3://{settings.s3_bucket_name}/{s3_object_key}")
        
        # Create vector DTO with S3 object key
        vector_dto = CreateVectorDTO(
            embedding=embedding_values,
            text_content=summary,
            file_hash=file_hash,
            object_key=s3_object_key
        )
        
        # Store vector in Pinecone
        store_vector(pinecone_index, vector_dto)
        print(f"[Worker {worker_id}] Vector stored successfully in Pinecone")
        
        # Move the processed document to a 'processed' directory
        clear_processed_document(document_path, settings.processed_directory)
        print(f"[Worker {worker_id}] Document moved to processed directory: {settings.processed_directory}")
        
        return (True, document_path, "Successfully processed")
        
    except Exception as e:
        error_msg = f"Error: {str(e)}"
        print(f"[Worker {worker_id}] Error processing document {document_path}: {error_msg}")
        return (False, document_path, error_msg)


def main():
    # Load configuration settings
    settings = get_settings()
        
    # Step 1: Load the Google Gemini client
    client = genai.Client(api_key=settings.gemini_api_key)
    
    # Prepare AWS credential kwargs if provided
    aws_client_kwargs = {"region_name": settings.aws_region}
    if settings.aws_access_key_id and settings.aws_secret_access_key:
        aws_client_kwargs.update({
            "aws_access_key_id": settings.aws_access_key_id,
            "aws_secret_access_key": settings.aws_secret_access_key,
        })

    # Step 2: Initialize Pinecone index client
    pc = Pinecone(api_key=settings.pinecone_api_key)
    pinecone_index = pc.Index(settings.vector_index_name)

    # Step 3: Initialize S3 client for document storage
    s3_client = boto3.client("s3", **aws_client_kwargs)

    # Step 4: Print configuration
    if settings.aws_access_key_id:
        print("Using explicit AWS credentials from config: AWS_ACCESS_KEY_ID is set")
    else:
        print("Using default AWS credential chain (env/IMDS/SSO/profile)")
    
    print("Starting document processing...")
    print(f"AWS Region: {settings.aws_region}")
    print(f"Document Bucket: {settings.s3_bucket_name}")
    print(f"Vector Index (Pinecone): {settings.vector_index_name}")
    print(f"Input Directory: {settings.input_directory}")
    print(f"Processed Directory: {settings.processed_directory}")
    print(f"Max Parallel Workers: {settings.max_workers}")
    
    # Step 5: Collect all documents to process
    documents_to_process = load_all_documents(settings.input_directory)
    
    total_documents = len(documents_to_process)
    if total_documents == 0:
        print("No documents found to process.")
        return
    
    print(f"\nFound {total_documents} documents to process")
    print(f"Processing with {settings.max_workers} parallel workers...\n")
    
    # Step 6: Process documents in parallel
    processed_count = 0
    failed_count = 0
    skipped_count = 0
    
    with ThreadPoolExecutor(max_workers=settings.max_workers) as executor:
        # Submit all tasks
        future_to_doc = {
            executor.submit(
                process_document,
                doc_path,
                settings,
                client,
                pinecone_index,
                s3_client,
                i + 1
            ): doc_path
            for i, doc_path in enumerate(documents_to_process)
        }
        
        # Process completed tasks
        for future in as_completed(future_to_doc):
            doc_path = future_to_doc[future]
            try:
                success, path, message = future.result()
                if success:
                    if "skipped" in message.lower():
                        skipped_count += 1
                    else:
                        processed_count += 1
                    print(f"✓ Completed: {path.name} - {message}")
                else:
                    failed_count += 1
                    print(f"✗ Failed: {path.name} - {message}")
            except Exception as e:
                failed_count += 1
                print(f"✗ Exception for {doc_path.name}: {str(e)}")
    
    # Step 7: Print summary
    print(f"\n{'='*60}")
    print("Document Processing Summary")
    print(f"{'='*60}")
    print(f"Total documents found: {total_documents}")
    print(f"Successfully processed: {processed_count}")
    print(f"Skipped (already exists): {skipped_count}")
    print(f"Failed: {failed_count}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    settings = get_settings()
    
    # Check batch processing mode
    if settings.use_batch_processing:
        print("\n🚀 Starting in FULL BATCH mode...")
        
        # Import and run full batch mode
        from main_full_batch import main_full_batch
        main_full_batch()
        
    else:
        print("\n🚀 Starting in STANDARD mode...")
        print(f"   - {settings.max_workers} parallel workers\n")
        main()
