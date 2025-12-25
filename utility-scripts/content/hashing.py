import hashlib
from pathlib import Path
from pydantic import BaseModel


def get_pdf_hash(path: Path) -> str:
    """
    Generate a SHA-256 hash for a PDF file.
    
    Args:
        path: Path to the PDF file
        
    Returns:
        The SHA-256 hash of the file as a hexadecimal string
        
    Raises:
        FileNotFoundError: If the file doesn't exist
        IOError: If there's an error reading the file
    """
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")
    
    if not path.is_file():
        raise ValueError(f"Path is not a file: {path}")
    
    # Create SHA-256 hash object
    hash_sha256 = hashlib.sha256()
    
    # Read file in chunks to handle large files efficiently
    with open(path, 'rb') as file:
        for chunk in iter(lambda: file.read(4096), b""):
            hash_sha256.update(chunk)
    
    return hash_sha256.hexdigest()