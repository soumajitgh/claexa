from pydantic import BaseModel

from src.services.question_paper.models.core_question_paper import QuestionPaper


class QuestionPaperGenerateResponseDTO(BaseModel):
    question_paper: QuestionPaper


