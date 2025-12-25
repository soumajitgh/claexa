"""
Response mapper module for question paper conversion.

This module provides the main interface for converting AI-generated
question papers to core models.
"""

from src.services.question_paper.response_mapper.mapper import (
    convert_ai_to_core,
    process_question_images
)

__all__ = ['convert_ai_to_core', 'process_question_images']
