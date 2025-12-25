import logging
from typing import List
from pydantic_ai import BinaryContent
    
from src.services.question_paper.dto.generate.request import QuestionPaperGenerateRequestDTO
from src.services.question_paper.dto.generate.response import QuestionPaperGenerateResponseDTO
from src.utils.converter import map_references_to_binary_contents
from src.utils.errors import ServiceError

from .agent import question_paper_agent
from .user_prompt import build_prompt
from .mapper import convert_ai_to_core
from .library.embedding import generate_embedding
from .library.search import search_vector_index, extract_s3_paths
from .library.s3_fetcher import fetch_documents_from_s3_paths

logger = logging.getLogger(__name__)


async def _search_library_materials(data: QuestionPaperGenerateRequestDTO) -> List[BinaryContent]:
    """
    Mandatory RAG search for library materials.
    Builds a structured search query and searches for relevant documents.
    
    Args:
        data: QuestionPaperGenerateRequestDTO containing search parameters
        
    Returns:
        List of BinaryContent objects from library search
    """
    try:
        # Build structured search query dynamically based on available data
        topics_str = ', '.join(data.topics) if isinstance(data.topics, list) else data.topics
        
        # Build query with only available fields
        parts = [
            f"institution: {data.audience}" if data.audience else None,
            f"doc_type: {getattr(data, 'doc_type', None)}" if getattr(data, 'doc_type', None) else None,
            f"subject: {data.course}" if data.course else None,
            f"academic_year: {getattr(data, 'academic_year', None)}" if getattr(data, 'academic_year', None) else None,
            f"target_level: {getattr(data, 'target_level', None)}" if getattr(data, 'target_level', None) else None,
            f"document_code: {getattr(data, 'document_code', None)}" if getattr(data, 'document_code', None) else None,
            f"language: {getattr(data, 'language', None)}" if getattr(data, 'language', None) else None,
            f"total_marks: {getattr(data, 'total_marks', None)}" if getattr(data, 'total_marks', None) else None,
            f"time_limit: {getattr(data, 'time_limit', None)}" if getattr(data, 'time_limit', None) else None,
            f"key_topics: {topics_str}" if data.topics else None,
        ]
        
        search_query = ' '.join(filter(None, parts))
        logger.info(f"Performing mandatory library search for: '{search_query}'")
        
        # Generate embedding for the concatenated query
        query_embedding = await generate_embedding(search_query)
        logger.debug(f"Generated embedding with dimension: {len(query_embedding)}")
        
        # Search Pinecone vector index
        search_results = await search_vector_index(query_embedding)
        logger.info(f"Pinecone search returned {len(search_results)} results")
        
        # Extract S3 paths from search results
        s3_paths = extract_s3_paths(search_results)
        logger.info(f"Extracted {len(s3_paths)} S3 paths from search results")
        
        # Fetch documents from S3 (top 5 are already limited by search)
        if s3_paths:
            binary_contents = await fetch_documents_from_s3_paths(s3_paths)
            logger.info(f"Successfully fetched {len(binary_contents)} documents from S3")
            return binary_contents
        
        logger.info("No documents found in library search")
        return []
        
    except Exception as e:
        # Log error but don't fail the request - proceed without library materials
        logger.warning(f"Library search failed: {e}. Continuing without library materials.")
        return []


async def generate_question_paper(
    request: QuestionPaperGenerateRequestDTO,
) -> QuestionPaperGenerateResponseDTO:
    """Generate a question paper from request DTO."""
    try:
        # Step 1: MANDATORY RAG search - concatenate course+audience, embed, and search library
        library_documents = await _search_library_materials(request)
        logger.info(f"Library search completed with {len(library_documents)} documents")
        
        # Step 2: Fetch user-provided reference documents (URLs or local paths)
        user_documents = []
        if request.user_reference_media_urls:
            user_documents = await map_references_to_binary_contents(
                request.user_reference_media_urls
            )
            logger.info(f"Fetched {len(user_documents)} user-provided reference documents")

        # Step 3: Combine library documents and user documents
        all_documents = library_documents + user_documents
        logger.info(f"Total documents for generation: {len(all_documents)}")

        # Step 4: Build prompt and generate AI paper
        prompt = build_prompt(request)
        
        logger.info(f"Generating question paper for: {request.course}")
        
        # Pass all documents to the agent
        result = await question_paper_agent.run([prompt, *all_documents])
        ai_paper = result.output
                        
        # Step 5: Convert to core model
        core_paper = await convert_ai_to_core(ai_paper)
        
        # Return response
        return QuestionPaperGenerateResponseDTO(question_paper=core_paper)

    except ValueError as ve:
        logger.warning(f"Validation error: {ve}")
        raise ServiceError(400, str(ve))
    except Exception as err:
        logger.exception("Error generating question paper")
        raise ServiceError(500, f"Internal server error: {str(err)}")