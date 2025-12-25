"""
Image rendering interface and strategy pattern implementation.

This module defines the interface for different image rendering strategies
and provides concrete implementations for each rendering type.
"""

import logging
from abc import ABC, abstractmethod
from typing import Optional

from src.services.question_paper.models.ai_question_paper import AIQuestionImageRenderStrategy

logger = logging.getLogger(__name__)


class ImageRenderStrategy(ABC):
    """Abstract base class for image rendering strategies."""
    
    @abstractmethod
    async def render(self, output: str) -> bytes:
        """
        Render the output to image bytes.
        
        Args:
            output: The output content to render (e.g., LaTeX code, prompt, Python code)
            
        Returns:
            Image as bytes
            
        Raises:
            RuntimeError: If rendering fails
        """
        pass
    
    @property
    @abstractmethod
    def strategy_type(self) -> AIQuestionImageRenderStrategy:
        """Return the strategy type this renderer handles."""
        pass


class ImageRendererFactory:
    """Factory class to create appropriate image renderers based on strategy type."""
    
    _strategies: dict[AIQuestionImageRenderStrategy, type[ImageRenderStrategy]] = {}
    
    @classmethod
    def register_strategy(cls, strategy_type: AIQuestionImageRenderStrategy):
        """
        Decorator to register a rendering strategy.
        
        Args:
            strategy_type: The strategy type to register
        """
        def decorator(strategy_class: type[ImageRenderStrategy]):
            cls._strategies[strategy_type] = strategy_class
            return strategy_class
        return decorator
    
    @classmethod
    def create_renderer(cls, strategy_type: AIQuestionImageRenderStrategy) -> ImageRenderStrategy:
        """
        Create and return appropriate renderer for the given strategy type.
        
        Args:
            strategy_type: The type of rendering strategy needed
            
        Returns:
            An instance of the appropriate ImageRenderStrategy
            
        Raises:
            ValueError: If strategy type is not supported
        """
        strategy_class = cls._strategies.get(strategy_type)
        if not strategy_class:
            raise ValueError(f"Unsupported rendering strategy: {strategy_type}")
        
        return strategy_class()
    
    @classmethod
    def get_supported_strategies(cls) -> list[AIQuestionImageRenderStrategy]:
        """Return list of all supported rendering strategies."""
        return list(cls._strategies.keys())
