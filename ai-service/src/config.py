import logging
from pathlib import Path
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Module logger (level configured by server)
logger = logging.getLogger(__name__)


class AppConfig(BaseSettings):
    """
    Application configuration using Pydantic Settings.
    Automatically loads from environment variables and .env files.
    """
    
    # Environment
    env: str = Field(default="development", description="Application environment")
    
    # Server Settings
    port: int = Field(default=8080, description="Server port number")
    
    openrouter_api_key: str = Field(description="OpenRouter API key")
    gcp_service_account_json: str = Field(default="", description="GCP service account JSON for Vertex AI")
    google_api_key: str = Field(default="", description="Google Gemini API key")
    
    # AWS Settings
    aws_access_key_id: str = Field(description="AWS access key ID")
    aws_secret_access_key: str = Field(description="AWS secret access key")
    aws_region: str = Field(default="us-east-1", description="AWS region")
    aws_s3_bucket_name: str = Field(description="AWS S3 bucket name for documents")
    
    # Pinecone Settings
    pinecone_api_key: str = Field(default="", description="Pinecone API key")
    pinecone_index_name: str = Field(default="", description="Pinecone index name")
    

    
    # Pydantic Settings Configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        case_sensitive=False,
        enable_decoding=False,
        extra="ignore",  # Ignore extra environment variables
    )
    
    def __init__(self, **kwargs):
        """Initialize settings with environment loading."""
        super().__init__(**kwargs)
        self._log_environment_loading()
    

    
    def _log_environment_loading(self) -> None:
        """Log information about environment loading."""
        env_file_path = Path(".env")
        
        if self.env.lower() == "production":
            logger.info("Production environment detected. Using system environment variables.")
        elif env_file_path.exists():
            logger.info(f"Successfully loaded .env file from: {env_file_path.absolute()}")
        else:
            logger.info(".env file not found. Using system environment variables or defaults.")
    
    @property  
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.env.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.env.lower() == "development"


# --- Global instances ---

# Single global config instance
app_config = AppConfig()

# Export the config instance and class for different use cases
__all__ = [
    "app_config", 
    "AppConfig"
]