from enum import Enum
from typing import List, Literal, Optional
from pydantic import BaseModel

from src.services.question_paper.models.ai_question_paper import AIQuestion, AIQuestionOption, AISubQuestion

class AIQuestionPaperVerificationFeedback(BaseModel):
    """Feedback for AI question paper verification."""
    modification_requirement: List[str]
    status: Literal["pass", "fail"] 


class AIQuestionWithoutImages(BaseModel):
    """AI question without image field - extends from AIQuestion but excludes image."""
    uuid: str
    text: str
    marks: int
    difficulty_level: Literal["easy", "medium", "hard"]
    options: Optional[List[AIQuestionOption]] = None
    sub_questions: Optional[List[AISubQuestion]] = None


class AIQuestionPaperWithoutImages(BaseModel):
    """Question paper without images."""
    questions: List[AIQuestionWithoutImages]