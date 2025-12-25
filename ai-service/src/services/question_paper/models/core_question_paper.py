from typing import List, Optional
from pydantic import BaseModel


class QuestionOption(BaseModel):
    """Option for multiple choice questions."""
    text: str


class QuestionImage(BaseModel):
    """Image associated with a question."""
    base64_image: str


class SubQuestion(BaseModel):
    """Sub question for a question."""
    text: str
    marks: int
    options: List[QuestionOption] = []

class Question(BaseModel):
    """Individual question model."""
    text: str
    marks: int
    bloom_level: int
    options: List[QuestionOption] = []
    images: List[QuestionImage] = []
    sub_questions: List[SubQuestion] = []


class QuestionPaper(BaseModel):
    """Complete question paper model."""
    name: str
    questions: List[Question] 