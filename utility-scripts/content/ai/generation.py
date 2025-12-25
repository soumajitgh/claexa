from pathlib import Path
from google import genai
from google.genai import types


def _load_prompt(path: str) -> str:
    """
    Load prompt content from a file.
    
    Args:
        path: The file path to load the prompt from
        
    Returns:
        The prompt content as a string, or empty string if file doesn't exist
    """
    prompt_file = Path(path)
    if prompt_file.exists():
        return prompt_file.read_text(encoding="utf-8").strip()
    return ""


def generate_summary(client: genai.Client, document: types.File) -> str:
    """
    Generate a summary for the given document using Google Gemini.

    Args:
        client: An instance of the Google Gemini client
        document: The document to summarize

    Returns:
        The generated summary text
    """
    # Load the system prompt
    prompt_path = Path(__file__).parent / "system_prompt.md"
    system_prompt = _load_prompt(str(prompt_path))
    
    # Prepare contents with system prompt (if available) and document
    contents = []
    if system_prompt:
        contents.append(system_prompt)
    contents.append(document)
    
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=contents,
    )
    
    if not response or not response.text:
        raise ValueError("No summary generated for the document.")
    
    return response.text