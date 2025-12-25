"""
Matplotlib rendering strategy for plots, charts, and data visualizations.
"""

import logging

from src.services.question_paper.models.ai_question_paper import AIQuestionImageRenderStrategy
from src.services.question_paper.response_mapper.image.rendering_interface import ImageRendererFactory
from src.services.question_paper.response_mapper.image.common import PythonSandboxRenderer

logger = logging.getLogger(__name__)


@ImageRendererFactory.register_strategy(AIQuestionImageRenderStrategy.MATPLOTLIB_RENDERED)
class MatplotlibRenderer(PythonSandboxRenderer):
    """Renderer for plots and charts using Matplotlib."""
    
    def __init__(self):
        # matplotlib and numpy are pre-installed in the custom Docker image
        super().__init__()
    
    @property
    def strategy_type(self) -> AIQuestionImageRenderStrategy:
        return AIQuestionImageRenderStrategy.MATPLOTLIB_RENDERED
    
    def _wrap_code(self, code: str, output_path: str) -> str:
        """Wrap Matplotlib code to save PNG to file (maintaining original resolution)."""
        wrapped = "import matplotlib.pyplot as plt\n"
        wrapped += "import numpy as np\n\n"
        wrapped += code
        wrapped += "\n\n"
        wrapped += "# Render plot to PNG file (original resolution)\n"
        wrapped += "if 'fig' in dir():\n"
        wrapped += f"    fig.savefig('{output_path}', format='png', bbox_inches='tight')\n"
        wrapped += "else:\n"
        wrapped += f"    plt.savefig('{output_path}', format='png', bbox_inches='tight')\n"
        
        return wrapped
