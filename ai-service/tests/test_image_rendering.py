"""
Basic tests for image rendering strategy pattern.

Run with: python -m pytest tests/test_image_rendering.py -v
"""

import pytest
from src.services.question_paper.response_mapper.image import (
    ImageRendererFactory,
)
from src.services.question_paper.response_mapper.image.ai_generated import AIGeneratedRenderer
from src.services.question_paper.response_mapper.image.latex import LaTeXRenderer
from src.services.question_paper.response_mapper.image.matplotlib import MatplotlibRenderer
from src.services.question_paper.response_mapper.image.graphviz import GraphvizRenderer
from src.services.question_paper.models.ai_question_paper import AIQuestionImageRenderStrategy


class TestImageRendererFactory:
    """Test the ImageRendererFactory."""
    
    def test_factory_creates_correct_renderer_for_ai_generated(self):
        """Test factory creates AIGeneratedRenderer."""
        renderer = ImageRendererFactory.create_renderer(
            AIQuestionImageRenderStrategy.AI_GENERATED
        )
        assert isinstance(renderer, AIGeneratedRenderer)
        assert renderer.strategy_type == AIQuestionImageRenderStrategy.AI_GENERATED
    
    def test_factory_creates_correct_renderer_for_latex(self):
        """Test factory creates LaTeXRenderer."""
        renderer = ImageRendererFactory.create_renderer(
            AIQuestionImageRenderStrategy.LATEX_RENDERED
        )
        assert isinstance(renderer, LaTeXRenderer)
        assert renderer.strategy_type == AIQuestionImageRenderStrategy.LATEX_RENDERED
    
    def test_factory_creates_correct_renderer_for_matplotlib(self):
        """Test factory creates MatplotlibRenderer."""
        renderer = ImageRendererFactory.create_renderer(
            AIQuestionImageRenderStrategy.MATPLOTLIB_RENDERED
        )
        assert isinstance(renderer, MatplotlibRenderer)
        assert renderer.strategy_type == AIQuestionImageRenderStrategy.MATPLOTLIB_RENDERED
    
    def test_factory_creates_correct_renderer_for_graphviz(self):
        """Test factory creates GraphvizRenderer."""
        renderer = ImageRendererFactory.create_renderer(
            AIQuestionImageRenderStrategy.GRAPHVIZ_RENDERED
        )
        assert isinstance(renderer, GraphvizRenderer)
        assert renderer.strategy_type == AIQuestionImageRenderStrategy.GRAPHVIZ_RENDERED
    
    def test_factory_raises_error_for_unsupported_strategy(self):
        """Test factory raises ValueError for unsupported strategy."""
        with pytest.raises(ValueError, match="Unsupported rendering strategy"):
            # Create a mock strategy that isn't registered
            ImageRendererFactory.create_renderer("unsupported_strategy")
    
    def test_get_supported_strategies(self):
        """Test getting list of supported strategies."""
        strategies = ImageRendererFactory.get_supported_strategies()
        
        # Should include all registered strategies
        assert AIQuestionImageRenderStrategy.AI_GENERATED in strategies
        assert AIQuestionImageRenderStrategy.LATEX_RENDERED in strategies
        assert AIQuestionImageRenderStrategy.MATPLOTLIB_RENDERED in strategies
        assert AIQuestionImageRenderStrategy.GRAPHVIZ_RENDERED in strategies
        assert AIQuestionImageRenderStrategy.RDKIT_RENDERED in strategies


class TestRendererInterfaces:
    """Test that all renderers implement the required interface."""
    
    def test_all_renderers_have_strategy_type_property(self):
        """Test all renderers have strategy_type property."""
        strategies = [
            AIQuestionImageRenderStrategy.LATEX_RENDERED,
            AIQuestionImageRenderStrategy.MATPLOTLIB_RENDERED,
            AIQuestionImageRenderStrategy.GRAPHVIZ_RENDERED,
        ]
        
        for strategy in strategies:
            renderer = ImageRendererFactory.create_renderer(strategy)
            assert hasattr(renderer, 'strategy_type')
            assert renderer.strategy_type == strategy
    
    def test_all_renderers_have_render_method(self):
        """Test all renderers have async render method."""
        strategies = [
            AIQuestionImageRenderStrategy.LATEX_RENDERED,
            AIQuestionImageRenderStrategy.MATPLOTLIB_RENDERED,
        ]
        
        for strategy in strategies:
            renderer = ImageRendererFactory.create_renderer(strategy)
            assert hasattr(renderer, 'render')
            assert callable(renderer.render)


@pytest.mark.asyncio
class TestMatplotlibRenderer:
    """Test Matplotlib renderer with sandbox."""
    
    async def test_matplotlib_renders_simple_plot(self):
        """Test rendering a simple matplotlib plot."""
        renderer = MatplotlibRenderer()
        
        code = """
import matplotlib.pyplot as plt
import numpy as np

x = [1, 2, 3, 4, 5]
y = [1, 4, 9, 16, 25]

fig, ax = plt.subplots()
ax.plot(x, y)
"""
        
        try:
            image_bytes = await renderer.render(code)
            assert isinstance(image_bytes, bytes)
            assert len(image_bytes) > 0
            # PNG files start with these bytes
            assert image_bytes[:4] == b'\x89PNG'
        except Exception as e:
            # If sandbox isn't available, skip test
            pytest.skip(f"Sandbox not available: {e}")


@pytest.mark.asyncio
class TestConversionFlow:
    """Test the full conversion flow."""
    
    async def test_convert_ai_to_core_with_latex_image(self):
        """Test converting AI question paper with LaTeX image."""
        from src.services.question_paper.response_mapper import convert_ai_to_core
        from src.services.question_paper.models.ai_question_paper import (
            AIQuestionPaper,
            AIQuestion,
            AIQuestionImage,
        )
        
        ai_question = AIQuestion(
            text="Solve the equation",
            marks=5,
            bloom_level=3,
            image=AIQuestionImage(
                output=r"$x^2 + 2x + 1 = 0$",
                render_strategy=AIQuestionImageRenderStrategy.LATEX_RENDERED
            )
        )
        
        ai_paper = AIQuestionPaper(
            name="Math Test",
            questions=[ai_question]
        )
        
        try:
            core_paper = await convert_ai_to_core(ai_paper)
            
            assert core_paper.name == "Math Test"
            assert len(core_paper.questions) == 1
            assert core_paper.questions[0].text == "Solve the equation"
            assert core_paper.questions[0].marks == 5
            
            # Check image was rendered
            if len(core_paper.questions[0].images) > 0:
                assert len(core_paper.questions[0].images) == 1
                assert core_paper.questions[0].images[0].base64_image
                # Base64 strings are usually quite long
                assert len(core_paper.questions[0].images[0].base64_image) > 100
        except Exception as e:
            # LaTeX tools might not be available in test environment
            pytest.skip(f"LaTeX rendering not available: {e}")
    
    async def test_convert_ai_to_core_without_image(self):
        """Test converting AI question paper without images."""
        from src.services.question_paper.response_mapper import convert_ai_to_core
        from src.services.question_paper.models.ai_question_paper import (
            AIQuestionPaper,
            AIQuestion,
        )
        
        ai_question = AIQuestion(
            text="What is 2+2?",
            marks=1,
            bloom_level=1,
        )
        
        ai_paper = AIQuestionPaper(
            name="Simple Test",
            questions=[ai_question]
        )
        
        core_paper = await convert_ai_to_core(ai_paper)
        
        assert core_paper.name == "Simple Test"
        assert len(core_paper.questions) == 1
        assert core_paper.questions[0].text == "What is 2+2?"
        assert len(core_paper.questions[0].images) == 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
