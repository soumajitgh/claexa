#!/usr/bin/env python3
"""
Vector Store Cleanup Script

This script provides functionality to clear all vectors from a Pinecone index.
WARNING: This operation is irreversible and will delete ALL vectors in the specified index.

Usage:
    python vector_store_cleanup.py
    
Environment Variables Required (loaded via config.py):
    - PINECONE_API_KEY: Pinecone API key
    - VECTOR_INDEX_NAME: Name of the Pinecone index to clean up
    
Optional Environment Variables:
    - INPUT_DIRECTORY: Directory for input files (default: 'input')
    - PROCESSED_DIRECTORY: Directory for processed files (default: 'processed')
    - AWS_ACCESS_KEY_ID: Explicit AWS access key ID for authentication (optional)
    - AWS_SECRET_ACCESS_KEY: Explicit AWS secret access key for authentication (optional)
"""

from pinecone import Pinecone
import sys
import os
from typing import Optional

# Add parent directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import get_settings, Settings


def clear_all_vectors(
    index_name: str,
    settings: Settings
) -> bool:
    """
    Deletes all vectors from the specified Pinecone index.

    This function handles the complete cleanup of vector data.
    It will permanently remove all data in the index.

    Args:
        index_name: Name of the Pinecone index to clear
    
    Returns:
        bool: True if successful, False otherwise.
    """
    print(f"Attempting to clear Pinecone index '{index_name}'...")

    try:
        pc = Pinecone(api_key=settings.pinecone_api_key)
        index = pc.Index(index_name)

        # Pinecone doesn't support delete-all directly without a filter; use delete with no ids and a wildcard filter
        # Many clients support index.delete(delete_all=True) or index.delete(filter={})
        try:
            index.delete(delete_all=True)
            print("Deleted all vectors using delete_all=True")
        except Exception:
            index.delete(filter={})
            print("Deleted all vectors using empty filter")

        print(f"✅ Success! Pinecone index '{index_name}' has been cleared.")
        return True
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
        return False


def get_user_confirmation(index_name: str) -> bool:
    """
    Get user confirmation before proceeding with the vector cleanup.
    
    Args:
        vector_bucket_name: Name of the vector bucket
        index_name: Name of the vector index
        
    Returns:
        True if user confirms, False otherwise
    """
    print(f"\n⚠️  WARNING: You are about to delete ALL vectors in Pinecone index '{index_name}'")
    print("This operation is IRREVERSIBLE and will permanently delete all vector data!")
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
    """Main function to run the vector store cleanup script."""
    print("Vector Store Cleanup Script")
    print("=" * 35)
    
    try:
        # Load configuration from environment variables
        settings = get_settings()
        
        # Get user confirmation
        if not get_user_confirmation(settings.vector_index_name):
            print("Operation cancelled by user.")
            sys.exit(0)

        # Perform cleanup
        success = clear_all_vectors(
            settings.vector_index_name,
            settings,
        )
        
        if success:
            print("\n✅ Vector store cleanup completed successfully!")
        else:
            print("\n❌ Vector store cleanup failed!")
            sys.exit(1)
        
    except Exception as e:
        print(f"\n❌ Script failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()