"""
Question paper mapper module.

This module provides backward compatibility by delegating to the
new response_mapper module that implements the strategy pattern.
"""

import logging

from .models.ai_question_paper import AIQuestionPaper
from .models.core_question_paper import QuestionPaper
from .response_mapper import convert_ai_to_core

logger = logging.getLogger(__name__)

# Export the main conversion function
__all__ = ['convert_ai_to_core'] 