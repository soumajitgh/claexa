import logging
import asyncio
from typing import List, Dict, Any
from pinecone import Pinecone
import logfire

from src.config import app_config

logger = logging.getLogger(__name__)

# Configuration constants
SEARCH_LIMIT = 5
SIMILARITY_THRESHOLD = 0.65

# Global Pinecone objects
_pinecone_client = None
_pinecone_index = None


def _get_pinecone_index():
    """Get or create Pinecone index connection."""
    global _pinecone_client, _pinecone_index

    if _pinecone_index is not None:
        logger.debug("Using existing Pinecone index reference")
        return _pinecone_index

    try:
        logger.debug("Initializing Pinecone client and index")
        _pinecone_client = Pinecone(api_key=app_config.pinecone_api_key)
        _pinecone_index = _pinecone_client.Index(app_config.pinecone_index_name)
        logger.debug(f"Connected to Pinecone index: {app_config.pinecone_index_name}")
    except Exception as e:
        logger.error(f"Failed to initialize Pinecone client/index: {e}")
        raise ValueError(f"Pinecone initialization failed: {e}")

    return _pinecone_index


async def search_vector_index(query_embedding: List[float]) -> List[Dict[str, Any]]:
    """
    Search the Pinecone index for similar materials.

    Args:
        query_embedding: The embedding vector to search with

    Returns:
        List of dictionaries containing search results with metadata and scores

    Raises:
        ValueError: If vector search fails
    """
    try:
        index = _get_pinecone_index()

        loop = asyncio.get_event_loop()
        logger.debug(
            f"Querying Pinecone index='{app_config.pinecone_index_name}' top_k={SEARCH_LIMIT}"
        )
        response = await loop.run_in_executor(
            None,
            lambda: index.query(
                vector=query_embedding,
                top_k=SEARCH_LIMIT,
                include_values=False,
                include_metadata=True,
            )
        )

        # Filter results by similarity threshold (Pinecone returns similarity score)
        filtered_results: List[Dict[str, Any]] = []
        for match in getattr(response, 'matches', []) or response.get('matches', []): # type: ignore
            score = match.get('score', 0.0)
            if score >= SIMILARITY_THRESHOLD:
                                
                metadata = match.get('metadata', {}) or {}
                # Flatten metadata and keep a generic key for downstream S3 fetch
                result: Dict[str, Any] = {
                    'id': match.get('id'),
                    'score': score,
                }
                # Promote common s3 path fields to top-level 'key' for compatibility
                key = (
                    metadata.get('object_key')
                )
                if key:
                    result['key'] = key
                # Merge all metadata at top-level to preserve existing consumers
                result.update(metadata)
                filtered_results.append(result)

        logger.debug(f"Pinecone returned {len(getattr(response, 'matches', []) or response.get('matches', []))} matches") # type: ignore
        logger.debug(f"Filtered down to {len(filtered_results)} by threshold {SIMILARITY_THRESHOLD}")
        
        # Sort by score (highest first) and take top 4
        filtered_results.sort(key=lambda x: x.get('score', 0.0), reverse=True)
        top_results = filtered_results[:4]
        
        if len(filtered_results) > 4:
            logger.info(f"Sorted by similarity and selected top 4 from {len(filtered_results)} results")
        
        # Log search results with logfire
        with logfire.span('vector_search_results', 
                         total_matches=len(getattr(response, 'matches', []) or response.get('matches', [])), # type: ignore
                         filtered_count=len(filtered_results),
                         top_results_count=len(top_results),
                         similarity_threshold=SIMILARITY_THRESHOLD):
            for result in top_results:
                logfire.info(
                    'Search result',
                    result_id=result.get('id'),
                    score=result.get('score'),
                    s3_key=result.get('key'),
                )
        
        return top_results

    except Exception as e:
        logger.error(f"Pinecone search failed: {e}")
        raise ValueError(f"Pinecone search failed: {e}")


def extract_s3_paths(results: List[Dict[str, Any]]) -> List[str]:
    """
    Extract S3 paths from search results.

    Args:
        results: List of search result dictionaries

    Returns:
        List of S3 object paths/keys
    """
    s3_paths: List[str] = []

    for result in results:
        # Try different possible field names for S3 path
        s3_path = (
            result.get('s3_path')
            or result.get('s3_key')
            or result.get('bucket_path')
            or result.get('key')
        )
        if s3_path:
            s3_paths.append(s3_path)
            logger.debug(f"Extracted S3 path: {s3_path} (score: {result.get('score', 0):.2f})")

    logger.debug(f"Extracted {len(s3_paths)} S3 paths from {len(results)} search results")
    return s3_paths