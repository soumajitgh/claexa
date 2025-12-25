from google import genai
from google.genai import types


def generate_embeddings(client: genai.Client, content: str) -> list[types.ContentEmbedding]:
    """
    Generate a vector representation for the given content using Google Gemini.

    Args:
        client: An instance of the Google Gemini client
        content: The content to generate a vector for

    Returns:
        The generated vector object
    """
    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=content,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT")
    )
    
    if not response or not response.embeddings:
        raise ValueError("No vector generated for the content.")

    return response.embeddings