from pathlib import Path
from google import genai
from google.genai import types


def upload_local_document_to_ai(client: genai.Client, path: Path) -> types.File:
    """
    Upload a local document to Google Gemini Files API.
    
    Args:
        client: An instance of the Google Gemini client
        path: Path to the document file to upload
        
    Returns:
        The uploaded file object from the Gemini Files API
    """    
    # Upload the file using the File API
    uploaded_file = client.files.upload(file=path)
    
    return uploaded_file