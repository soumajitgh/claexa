import os
from pydantic import Field, ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """
    Settings for the content indexer.
    All settings must be provided via environment variables.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        validate_default=True
    )
    
    # AWS Configuration
    aws_access_key_id: Optional[str] = Field(
        default=None,
        description="AWS access key ID for authenticating SDK clients"
    )
    aws_secret_access_key: Optional[str] = Field(
        default=None,
        description="AWS secret access key for authenticating SDK clients"
    )
    aws_region: str = Field(
        description="AWS region for S3 and other AWS services",
        min_length=1
    )
    
    # S3 Configuration
    s3_bucket_name: str = Field(
        description="S3 bucket name for storing documents",
        min_length=1
    )
    vector_index_name: str = Field(
        description="Name of the vector index",
        min_length=1
    )
    
    # Pinecone Configuration
    pinecone_api_key: str = Field(
        description="Pinecone API key for vector storage",
        min_length=1
    )

    # Google Gemini Configuration
    gemini_api_key: str = Field(
        description="Google Gemini API key for AI processing",
        min_length=1
    )
    
    # Directory Configuration
    input_directory: str = Field(
        default="input",
        description="Directory path for input files"
    )
    processed_directory: str = Field(
        default="processed",
        description="Directory path for processed files"
    )
    output_directory: str = Field(
        default="output",
        description="Directory path for output files (CSV reports, etc.)"
    )
    
    # Parallel Processing Configuration
    max_workers: int = Field(
        default=3,
        ge=1,
        le=20,
        description="Maximum number of parallel workers for document processing"
    )
    
    # Batch Processing Configuration
    use_batch_processing: bool = Field(
        default=False,
        description="Use Gemini Batch API for summaries (50% cost, async processing)"
    )
    batch_generation_chunk_size: int = Field(
        default=50,
        ge=1,
        le=200,
        description="Number of summaries to generate in each batch chunk"
    )
    batch_poll_interval: int = Field(
        default=30,
        ge=10,
        le=300,
        description="Seconds between batch job status checks (for summaries)"
    )
    batch_max_wait_time: int = Field(
        default=3600,
        ge=300,
        le=86400,
        description="Maximum seconds to wait for batch job completion (for summaries)"
    )


def get_settings() -> Settings:
    """
    Get application settings with proper error handling.
    
    Returns:
        Settings: Validated settings instance
        
    Raises:
        ValidationError: If required environment variables are missing or invalid
    """
    try:
        return Settings()  # type: ignore[call-arg]
    except ValidationError as e:
        print(f"Configuration Error: {e}")
        print("\nPlease ensure all required environment variables are set:")
        print("- AWS_REGION") 
        print("- S3_BUCKET_NAME") 
        print("- VECTOR_INDEX_NAME")
        print("- PINECONE_API_KEY")
        print("- GEMINI_API_KEY")
        print("\nOptional environment variables:")
        print("- AWS_ACCESS_KEY_ID (if omitted, default AWS credential chain is used)")
        print("- AWS_SECRET_ACCESS_KEY (if omitted, default AWS credential chain is used)")
        print("- INPUT_DIRECTORY (default: 'input')")
        print("- PROCESSED_DIRECTORY (default: 'processed')")
        print("- OUTPUT_DIRECTORY (default: 'output')")
        print("- MAX_WORKERS (default: 3, range: 1-20)")
        print("- USE_BATCH_PROCESSING (default: False) - Batch mode for summaries")
        print("- BATCH_GENERATION_CHUNK_SIZE (default: 50, range: 1-200)")
        print("- BATCH_POLL_INTERVAL (default: 30, range: 10-300)")
        print("- BATCH_MAX_WAIT_TIME (default: 3600, range: 300-86400)")
        raise


if __name__ == "__main__":
    settings = get_settings()
    print(settings.model_dump_json(indent=2))