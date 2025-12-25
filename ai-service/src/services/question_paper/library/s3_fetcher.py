import logging
from typing import List

from pydantic_ai import BinaryContent

from src.utils.aws import fetch_documents_from_s3

logger = logging.getLogger(__name__)


async def fetch_documents_from_s3_paths(s3_paths: List[str]) -> List[BinaryContent]:
    """
    Fetch documents from AWS S3 using the provided S3 paths.
    
    Args:
        s3_paths: List of S3 object keys/paths to fetch
        
    Returns:
        List of BinaryContent objects containing the document data
        
    Raises:
        Exception: If fetching documents fails
    """
    if not s3_paths:
        return []
        
    try:
        logger.info(f"Fetching {len(s3_paths)} documents from S3")
        
        binary_contents = await fetch_documents_from_s3(s3_paths)
        
        logger.info(f"Successfully fetched {len(binary_contents)} documents from S3")
        return binary_contents
        
    except Exception as e:
        logger.error(f"Failed to fetch documents from S3: {e}")
        raise 