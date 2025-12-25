
#!/usr/bin/env python3
"""
S3 Bucket Cleanup Script

This script provides functionality to clean up all objects in an S3 bucket.
WARNING: This operation is irreversible and will delete ALL objects in the specified bucket.

Usage:
    python object_bucket_cleanup.py
    
Environment Variables Required (loaded via config.py):
    - AWS_REGION: AWS region for S3 service
    - S3_BUCKET_NAME: Name of the S3 bucket to clean up
    - S3_VECTOR_BUCKET_NAME: Name of the S3 vector bucket
    - VECTOR_INDEX_NAME: Name of the vector index
    - GEMINI_API_KEY: Google Gemini API key
    
Optional Environment Variables:
    - INPUT_DIRECTORY: Directory for input files (default: 'input')
    - PROCESSED_DIRECTORY: Directory for processed files (default: 'processed')
    - AWS_ACCESS_KEY_ID: Explicit AWS access key ID for authentication (optional)
    - AWS_SECRET_ACCESS_KEY: Explicit AWS secret access key for authentication (optional)
"""

import boto3
import sys
import os
from typing import Optional
from botocore.exceptions import ClientError, NoCredentialsError

# Add parent directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import get_settings, Settings


def clean_up_bucket(bucket_name: str, settings: Settings) -> bool:
    """
    Deletes all objects and versions from the specified S3 bucket.

    This function handles both versioned and unversioned buckets.
    It will permanently remove all data in the bucket.

    Args:
        bucket_name: The name of the S3 bucket to empty.
    
    Returns:
        bool: True if successful, False otherwise.
    """
    print(f"Attempting to empty bucket: {bucket_name}...")

    try:
        # Prepare AWS credentials if provided
        aws_resource_kwargs = {"region_name": settings.aws_region}
        if settings.aws_access_key_id and settings.aws_secret_access_key:
            aws_resource_kwargs.update({
                "aws_access_key_id": settings.aws_access_key_id,
                "aws_secret_access_key": settings.aws_secret_access_key,
            })

        # Use the high-level resource API with configured region/credentials
        s3 = boto3.resource('s3', **aws_resource_kwargs)
        bucket = s3.Bucket(bucket_name)  # type: ignore

        # This one-liner handles both versioned and unversioned buckets
        # It deletes all object versions and delete markers
        bucket.object_versions.delete()

        # For good measure, ensure all regular objects are gone too
        # (though the above call should handle it)
        bucket.objects.all().delete()
        
        print(f"✅ Success! Bucket '{bucket_name}' has been emptied.")
        return True

    except ClientError as e:
        # Handle potential errors like bucket not found, access denied, etc.
        error_code = e.response.get("Error", {}).get("Code")
        print(f"❌ Error emptying bucket: {error_code}")
        print(f"   Message: {e.response.get('Error', {}).get('Message')}")
        return False
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
        return False


def get_user_confirmation(bucket_name: str) -> bool:
    """
    Get user confirmation before proceeding with the cleanup.
    
    Args:
        bucket_name: Name of the bucket to be cleaned
        
    Returns:
        True if user confirms, False otherwise
    """
    print(f"\n⚠️  WARNING: You are about to delete ALL objects in bucket '{bucket_name}'")
    print("This operation is IRREVERSIBLE and will permanently delete all data!")
    print("\nAre you sure you want to continue?")
    
    while True:
        response = input("Type 'DELETE' to confirm or 'cancel' to abort: ").strip()
        if response == 'DELETE':
            return True
        elif response.lower() in ['cancel', 'c', 'no', 'n']:
            return False
        else:
            print("Please type 'DELETE' to confirm or 'cancel' to abort.")


def main():
    """Main function to run the bucket cleanup script."""
    print("S3 Bucket Cleanup Script")
    print("=" * 30)
    
    try:
        # Load configuration from environment variables
        settings = get_settings()
        
        # Get user confirmation
        if not get_user_confirmation(settings.s3_bucket_name):
            print("Operation cancelled by user.")
            sys.exit(0)
        
        if settings.aws_access_key_id:
            print("Using explicit AWS credentials from config: AWS_ACCESS_KEY_ID is set")
        else:
            print("Using default AWS credential chain (env/IMDS/SSO/profile)")

        # Perform cleanup
        success = clean_up_bucket(settings.s3_bucket_name, settings)
        
        if success:
            print("\n✅ Bucket cleanup completed successfully!")
        else:
            print("\n❌ Bucket cleanup failed!")
            sys.exit(1)
        
    except Exception as e:
        print(f"\n❌ Script failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()