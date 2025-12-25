
from pathlib import Path
from typing import Optional, List


def load_next_document(input_dir: str) -> Optional[Path]:
    """
    Load the next document from the input directory.
    
    Args:
        input_dir: The directory path to search for documents
        
    Returns:
        Path to the next document file, or None if no documents are found
    """
    input_path = Path(input_dir)
    
    # Check if the directory exists
    if not input_path.exists() or not input_path.is_dir():
        return None
    
    # Get all files in the directory (you can add specific file extensions if needed)
    files = [f for f in input_path.iterdir() if f.is_file()]
    
    # Return the first file found, or None if no files exist
    if files:
        return files[0]
    
    return None


def load_all_documents(input_dir: str) -> List[Path]:
    """
    Load all documents from the input directory.
    
    Args:
        input_dir: The directory path to search for documents
        
    Returns:
        List of Path objects for all documents found
    """
    input_path = Path(input_dir)
    
    # Check if the directory exists
    if not input_path.exists() or not input_path.is_dir():
        return []
    
    # Get all files in the directory (you can add specific file extensions if needed)
    files = [f for f in input_path.iterdir() if f.is_file() and not f.name.startswith('.')]
    
    return files

def clear_processed_document(document_path: Path, processed_dir: str) -> None:
    """
    Move the processed document to a 'processed' directory.
    
    Args:
        document_path: The path of the document to move
        processed_dir: The directory where processed documents should be moved
    """
    processed_path = Path(processed_dir)
    
    # Ensure the processed directory exists
    processed_path.mkdir(parents=True, exist_ok=True)
    
    # Move the document to the processed directory
    document_path.rename(processed_path / document_path.name)
    print(f"Moved {document_path} to {processed_path}")
    return