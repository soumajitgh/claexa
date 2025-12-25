"""
Graphviz rendering strategy for graph diagrams and flowcharts.
"""

import logging

from src.services.question_paper.models.ai_question_paper import AIQuestionImageRenderStrategy
from src.services.question_paper.response_mapper.image.rendering_interface import ImageRendererFactory
from src.services.question_paper.response_mapper.image.common import PythonSandboxRenderer

logger = logging.getLogger(__name__)


@ImageRendererFactory.register_strategy(AIQuestionImageRenderStrategy.GRAPHVIZ_RENDERED)
class GraphvizRenderer(PythonSandboxRenderer):
    """Renderer for Graphviz diagrams."""
    
    def __init__(self):
        # graphviz is pre-installed in the custom Docker image
        super().__init__()
    
    @property
    def strategy_type(self) -> AIQuestionImageRenderStrategy:
        return AIQuestionImageRenderStrategy.GRAPHVIZ_RENDERED
    
    def _wrap_code(self, code: str, output_path: str) -> str:
        """Wrap Graphviz code to save PNG to file."""
        wrapped = "import graphviz\n\n"
        wrapped += code
        wrapped += "\n\n"
        wrapped += "# Render graph to PNG file\n"
        wrapped += "if 'graph' in dir() or 'dot' in dir():\n"
        wrapped += "    g = graph if 'graph' in dir() else dot\n"
        wrapped += "    image_bytes = g.pipe(format='png')\n"
        wrapped += f"    with open('{output_path}', 'wb') as f:\n"
        wrapped += "        f.write(image_bytes)\n"
        wrapped += "else:\n"
        wrapped += "    raise ValueError('Code must define graph or dot variable')\n"
        
        return wrapped
