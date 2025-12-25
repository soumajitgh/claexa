import logging
from typing import List, Optional

try:
    import boto3
    from botocore.exceptions import ClientError as BotoClientError, NoCredentialsError as BotoNoCredentialsError
except ImportError:  # Fallbacks to satisfy type-checkers and runtime except blocks
    boto3 = None  # type: ignore
    BotoClientError = Exception  # type: ignore[assignment]
    BotoNoCredentialsError = Exception  # type: ignore[assignment]

from src.utils.errors import ServiceError
from pydantic_ai import BinaryContent

from src.config import app_config

logger = logging.getLogger(__name__)

# Module-level cached client
_s3_client = None


def _get_s3_client():
    """Get or create an S3 client (cached)."""
    global _s3_client
    if _s3_client is not None:
        return _s3_client

    if boto3 is None:
        raise ImportError("boto3 package not available. Install with: pip install boto3")

    try:
        _s3_client = boto3.client(
            's3',
            aws_access_key_id=app_config.aws_access_key_id,
            aws_secret_access_key=app_config.aws_secret_access_key,
            region_name=app_config.aws_region,
        )
        logger.info(f"Connected to AWS S3 in region: {app_config.aws_region}")
    except Exception as e:
        logger.error(f"Failed to initialize S3 client: {e}")
        raise ValueError(f"S3 client initialization failed: {e}")

    return _s3_client


def reset_s3_client() -> None:
    """Reset the cached S3 client (for tests or reconfiguration)."""
    global _s3_client
    _s3_client = None
    logger.debug("S3 client cache reset")


async def fetch_document(s3_key: str, bucket_name: str) -> BinaryContent:
    """
    Fetch a single document from S3.

    Args:
        s3_key: The S3 object key (path) to the document
        bucket_name: Optional bucket name, defaults to configured bucket

    Returns:
        BinaryContent object containing the document data
    """
    resolved_bucket = bucket_name

    try:
        logger.info(f"Fetching document from S3: s3://{resolved_bucket}/{s3_key}")
        response = _get_s3_client().get_object(Bucket=resolved_bucket, Key=s3_key)
        content_bytes = response['Body'].read()

        # Get content type from S3 metadata, default to application/octet-stream
        content_type = response.get('ContentType', 'application/octet-stream')

        logger.debug(
            f"Fetched S3 object bytes={len(content_bytes)} content_type={content_type}"
        )
        logger.info("Successfully fetched document from S3")

        return BinaryContent(data=content_bytes, media_type=content_type)

    except BotoClientError as e:  # type: ignore[misc]
        error_code = e.response['Error']['Code']  # type: ignore[assignment]
        logger.error(f"S3 ClientError fetching {s3_key}: {error_code} - {e}")

        if error_code == 'NoSuchKey':
            raise ServiceError(404, f"Document not found: {s3_key}")
        elif error_code == 'NoSuchBucket':
            raise ServiceError(404, f"Bucket not found: {resolved_bucket}")
        elif error_code == 'AccessDenied':
            raise ServiceError(403, f"Access denied to document: {s3_key}")
        else:
            raise ServiceError(500, f"S3 error fetching document: {error_code}")

    except BotoNoCredentialsError:  # type: ignore[misc]
        logger.error("AWS credentials not found")
        raise ServiceError(500, "AWS credentials not configured")

    except Exception as e:
        logger.error(f"Unexpected error fetching {s3_key}: {e}")
        raise ServiceError(500, f"Failed to fetch document from S3: {str(e)}")


async def fetch_documents(s3_keys: List[str], bucket_name: Optional[str] = None) -> List[BinaryContent]:
    """
    Fetch multiple documents from S3.

    Args:
        s3_keys: List of S3 object keys to fetch
        bucket_name: Optional bucket name, defaults to configured bucket

    Returns:
        List of BinaryContent objects
    """
    if not s3_keys:
        return []

    resolved_bucket = bucket_name or app_config.aws_s3_bucket_name
    fetched_contents: List[BinaryContent] = []

    for s3_key in s3_keys:
        try:
            content = await fetch_document(s3_key, resolved_bucket)
            fetched_contents.append(content)
        except ServiceError:
            # Re-raise service errors (already logged in fetch_document)
            raise
        except Exception as e:
            logger.error(f"Unexpected error fetching document {s3_key}: {e}")
            raise ServiceError(500, f"Failed to fetch document {s3_key}: {str(e)}")

    logger.info(f"Successfully fetched {len(fetched_contents)} documents from S3")
    return fetched_contents


async def fetch_documents_from_s3(s3_keys: List[str], bucket_name: Optional[str] = None) -> List[BinaryContent]:
    """
    Fetch documents from AWS S3.

    Args:
        s3_keys: List of S3 object keys (paths) to fetch
        bucket_name: Optional bucket name, defaults to configured bucket

    Returns:
        List of BinaryContent objects containing the document data

    Raises:
        HTTPException: If fetching documents fails due to S3 errors or configuration issues
    """
    return await fetch_documents(s3_keys, bucket_name)