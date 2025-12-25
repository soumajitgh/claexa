"""
RDKit rendering strategy for chemical structures and molecules.
"""

import logging

from src.services.question_paper.models.ai_question_paper import AIQuestionImageRenderStrategy
from src.services.question_paper.response_mapper.image.rendering_interface import ImageRendererFactory
from src.services.question_paper.response_mapper.image.common import PythonSandboxRenderer

logger = logging.getLogger(__name__)


@ImageRendererFactory.register_strategy(AIQuestionImageRenderStrategy.RDKIT_RENDERED)
class RDKitRenderer(PythonSandboxRenderer):
    """Renderer for chemical structures using RDKit."""
    
    def __init__(self):
        # rdkit and pillow are pre-installed in the custom Docker image
        super().__init__()
    
    @property
    def strategy_type(self) -> AIQuestionImageRenderStrategy:
        return AIQuestionImageRenderStrategy.RDKIT_RENDERED
    
    def _wrap_code(self, code: str, output_path: str) -> str:
        """Wrap RDKit code to save PNG to file."""
        wrapped = "from rdkit import Chem\n"
        wrapped += "from rdkit.Chem import Draw\n\n"
        wrapped += code
        wrapped += "\n\n"
        wrapped += "# Render molecule to PNG file\n"
        wrapped += "if 'mol' in dir():\n"
        wrapped += "    img = Draw.MolToImage(mol)\n"
        wrapped += f"    img.save('{output_path}', format='PNG')\n"
        wrapped += "elif 'mols' in dir():\n"
        wrapped += "    img = Draw.MolsToGridImage(mols)\n"
        wrapped += f"    img.save('{output_path}', format='PNG')\n"
        wrapped += "else:\n"
        wrapped += "    raise ValueError('Code must define mol or mols variable')\n"
        
        return wrapped
