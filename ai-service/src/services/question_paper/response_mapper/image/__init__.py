"""
Image rendering module.

This module provides the strategy pattern implementation for rendering
different types of images (AI-generated, LaTeX, Python-based visualizations).

Each rendering strategy is in its own file for better maintainability:
- ai_generated.py - AI image generation using Google Imagen
- latex.py - LaTeX mathematical expressions (including CircuiTikz for circuits)
- matplotlib.py - Plots and charts
- graphviz.py - Graph diagrams
- rdkit.py - Chemical structures
- common.py - Shared base classes

All strategies are automatically registered via the @register_strategy decorator.
"""

from src.services.question_paper.response_mapper.image.rendering_interface import (
    ImageRenderStrategy,
    ImageRendererFactory
)
from src.services.question_paper.response_mapper.image.common import PythonSandboxRenderer
from src.services.question_paper.response_mapper.image.ai_generated import AIGeneratedRenderer
from src.services.question_paper.response_mapper.image.latex import LaTeXRenderer
from src.services.question_paper.response_mapper.image.matplotlib import MatplotlibRenderer
from src.services.question_paper.response_mapper.image.graphviz import GraphvizRenderer
from src.services.question_paper.response_mapper.image.rdkit import RDKitRenderer

__all__ = [
    'ImageRenderStrategy',
    'ImageRendererFactory',
    'PythonSandboxRenderer',
    'AIGeneratedRenderer',
    'LaTeXRenderer',
    'MatplotlibRenderer',
    'GraphvizRenderer',
    'RDKitRenderer'
]
