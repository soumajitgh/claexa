from typing import List, Optional
from enum import Enum
from pydantic import BaseModel


class AIQuestionImageRenderStrategy(str, Enum):
    """Strategy for rendering images in AI questions."""
    AI_GENERATED = "ai_generated"
    LATEX_RENDERED = "latex_rendered"
    GRAPHVIZ_RENDERED = "graphviz_rendered"
    RDKIT_RENDERED = "rdkit_rendered"
    MATPLOTLIB_RENDERED = "matplotlib_rendered"


class AIQuestionImage(BaseModel):
    """Image configuration for AI questions."""
    output: str
    render_strategy: AIQuestionImageRenderStrategy


class AIQuestionOption(BaseModel):
    """Option for AI multiple choice questions."""
    text: str

class AISubQuestion(BaseModel):
    """Sub question for AI questions."""
    text: str
    marks: int
    options: Optional[List[AIQuestionOption]] = None

class AIQuestion(BaseModel):
    """Individual AI question model."""
    text: str
    marks: int
    bloom_level: int
    options: Optional[List[AIQuestionOption]] = None
    image: Optional[AIQuestionImage] = None
    sub_questions: Optional[List[AISubQuestion]] = None


class AIQuestionPaper(BaseModel):
    """Complete AI question paper model."""
    name: str
    questions: List[AIQuestion]