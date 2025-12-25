"""
Response mapper for converting AI question papers to core models.

This module provides functionality to map AI-generated question papers
to the core QuestionPaper model, handling different image rendering strategies.
"""

import logging
from typing import List

from src.services.question_paper.models.ai_question_paper import AIQuestionPaper, AIQuestion
from src.services.question_paper.models.core_question_paper import (
    QuestionPaper,
    Question,
    QuestionOption,
    QuestionImage,
    SubQuestion
)
from src.services.question_paper.response_mapper.image import ImageRendererFactory
from src.services.question_paper.tools.adapters.byte_to_base64 import ByteToBase64Adapter

logger = logging.getLogger(__name__)


async def convert_ai_to_core(ai_paper: AIQuestionPaper) -> QuestionPaper:
    """
    Convert AI question paper to core QuestionPaper model.
    
    This function orchestrates the conversion process, utilizing the strategy pattern
    for handling different image rendering types.
    
    Args:
        ai_paper: AI-generated question paper
        
    Returns:
        Core QuestionPaper model with all questions and images processed
    """
    logger.info(f"Converting AI question paper '{ai_paper.name}' with {len(ai_paper.questions)} questions")
    
    questions = []
    for idx, ai_question in enumerate(ai_paper.questions, 1):
        logger.debug(f"Processing question {idx}/{len(ai_paper.questions)}")
        
        # Convert options
        options = []
        if ai_question.options:
            options = [QuestionOption(text=opt.text) for opt in ai_question.options]
        
        # Convert sub-questions
        sub_questions = []
        if ai_question.sub_questions:
            for sub_q in ai_question.sub_questions:
                sub_options = []
                if sub_q.options:
                    sub_options = [QuestionOption(text=opt.text) for opt in sub_q.options]
                sub_questions.append(SubQuestion(
                    text=sub_q.text,
                    marks=sub_q.marks,
                    options=sub_options
                ))
        
        # Process images using strategy pattern
        images = await process_question_images(ai_question)
        
        questions.append(Question(
            text=ai_question.text,
            marks=ai_question.marks,
            bloom_level=ai_question.bloom_level,
            options=options,
            images=images,
            sub_questions=sub_questions
        ))
    
    result = QuestionPaper(name=ai_paper.name, questions=questions)
    logger.info(f"Successfully converted AI question paper to core model with {len(questions)} questions")
    return result


async def process_question_images(ai_question: AIQuestion) -> List[QuestionImage]:
    """
    Process images for AI question using the appropriate rendering strategy.
    
    This function implements the strategy pattern by delegating image rendering
    to the appropriate strategy based on the render_strategy specified in the
    AI question's image configuration.
    
    Args:
        ai_question: AI question with potential image configuration
        
    Returns:
        List of QuestionImage objects with base64-encoded images
    """
    images = []
    
    if not ai_question.image:
        return images
    
    try:
        # Get the appropriate renderer using the factory
        renderer = ImageRendererFactory.create_renderer(ai_question.image.render_strategy)
        
        logger.debug(
            f"Using {ai_question.image.render_strategy.value} strategy to render image"
        )
        
        # Render the image using the selected strategy
        image_bytes = await renderer.render(ai_question.image.output)
        
        # Convert bytes to base64
        base64_image = ByteToBase64Adapter.bytes_to_base64(image_bytes)
        
        images.append(QuestionImage(base64_image=base64_image))
        
        logger.info(
            f"Successfully rendered image using {ai_question.image.render_strategy.value} strategy"
        )
        
    except ValueError as e:
        logger.error(f"Unsupported rendering strategy: {e}")
        # Continue processing without the image
    except Exception as e:
        logger.error(f"Failed to process image for question: {e}")
        # Continue processing without the image
    
    return images
