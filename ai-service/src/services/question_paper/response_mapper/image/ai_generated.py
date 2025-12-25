"""
AI-generated image rendering strategy using Google's Imagen model.
"""

import logging

import google.genai as genai
from google.genai import types

from src.services.question_paper.models.ai_question_paper import AIQuestionImageRenderStrategy
from src.services.question_paper.response_mapper.image.rendering_interface import (
    ImageRenderStrategy,
    ImageRendererFactory
)
from src.utils.google_ai_client import get_genai_client

logger = logging.getLogger(__name__)


@ImageRendererFactory.register_strategy(AIQuestionImageRenderStrategy.AI_GENERATED)
class AIGeneratedRenderer(ImageRenderStrategy):
    """Renderer for AI-generated images using Google's Imagen model."""
    
    @property
    def strategy_type(self) -> AIQuestionImageRenderStrategy:
        return AIQuestionImageRenderStrategy.AI_GENERATED
    
    async def render(self, output: str) -> bytes:
        """
        Generate AI image using the output as prompt.
        
        Args:
            output: The prompt for image generation
            
        Returns:
            Generated image as bytes
            
        Raises:
            RuntimeError: If image generation fails
        """
        try:
            logger.debug(f"Generating AI image with prompt: {output[:100]}...")
            
            # Get the GenAI client
            client = get_genai_client()
            
            # Generate image directly using Google GenAI
            response = await client.aio.models.generate_images(
                model="imagen-4.0-fast-generate-001",
                prompt=output,
                config=types.GenerateImagesConfig(
                    number_of_images=1
                )
            )
            
            # Extract the image bytes
            if not response.generated_images:
                raise RuntimeError("No images generated from AI service")
            
            img_data = response.generated_images[0]
            if not img_data.image or not img_data.image.image_bytes:
                raise RuntimeError("Generated image has no bytes")
            
            logger.info("Successfully generated AI image")
            return img_data.image.image_bytes
            
        except Exception as e:
            logger.error(f"Failed to generate AI image: {e}")
            raise RuntimeError(f"AI image generation failed: {e}")
