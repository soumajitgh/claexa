from typing import Any

from vector_models import CreateVectorDTO


def check_vector_exists(index: Any, vector_key: str) -> bool:
    """
    Check if a vector with the given key exists in a Pinecone index.

    Args:
        index: A Pinecone Index instance
        vector_key: The id/key to check

    Returns:
        bool: True if the vector exists, False otherwise
    """
    try:
        response = index.fetch(ids=[vector_key])

        vectors = None
        if isinstance(response, dict):
            vectors = response.get("vectors") or response.get("records")
        else:
            vectors = getattr(response, "vectors", None)

        if isinstance(vectors, dict):
            return vector_key in vectors and vectors[vector_key] is not None
        if isinstance(vectors, list):
            return any(getattr(v, "id", getattr(v, "vector", {}).get("id", None)) == vector_key for v in vectors)
        return False
    except Exception:
        return False


def store_vector(index: Any, content: CreateVectorDTO) -> None:
    """
    Store a vector in a Pinecone index.

    Args:
        index: A Pinecone Index instance
        content: CreateVectorDTO containing embedding, text content, file hash, and object key
    """
    index.upsert(
        vectors=[
            {
                "id": content.file_hash,
                "values": content.embedding,
                "metadata": {
                    "object_key": content.object_key,
                },
            }
        ]
    )


