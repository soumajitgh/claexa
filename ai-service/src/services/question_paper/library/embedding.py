import logging
import asyncio
from typing import List, Optional

import google.genai as genai
from google.genai import types
from src.utils.google_ai_client import get_genai_client

logger = logging.getLogger(__name__)

# Configuration constants
EMBEDDING_MODEL = "gemini-embedding-001"

# Universal client accessor
_get_genai_client = get_genai_client


async def generate_embedding(query: str) -> List[float]:
    """
    Generate embedding for the query using Google GenAI.
    
    Args:
        query: The text query to generate embedding for
        
    Returns:
        List of float values representing the embedding vector
        
    Raises:
        ValueError: If embedding generation fails
    """
    try:
        logger.debug(f"Generating embedding for query length={len(query)}")

        client = _get_genai_client()

        # Generate embeddings following Gemini API docs
        response = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=query,
            config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY")
        )

        # Normalize response across possible shapes
        embedding: Optional[List[float]] = None

        # Result generally returns a list in `embeddings`
        if embedding is None and hasattr(response, "embeddings") and response.embeddings:
            emb0 = response.embeddings[0]
            if hasattr(emb0, "values") and emb0.values is not None:
                embedding = list(emb0.values)
            elif isinstance(emb0, dict) and "values" in emb0:
                embedding = list(emb0["values"])  # type: ignore[index]

        # Dict fallback (older/alt return shapes)
        if embedding is None and isinstance(response, dict):
            if "embeddings" in response and response["embeddings"]:
                emb0 = response["embeddings"][0]
                if isinstance(emb0, dict) and "values" in emb0:
                    embedding = list(emb0["values"])  # type: ignore[index]

        if not embedding:
            raise ValueError("Embedding not found in response")

        logger.debug(
            f"Generated embedding for query preview='{query[:50]}' dim={len(embedding)}"
        )
        return embedding

    except Exception as e:
        logger.error(f"Failed to generate embedding for query '{query}': {e}")
        raise ValueError(f"Embedding generation failed: {e}")