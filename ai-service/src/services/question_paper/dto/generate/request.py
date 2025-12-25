from typing import List, Optional
from pydantic import BaseModel, Field


class SubQuestionSchemaItemDTO(BaseModel):
    """Sub question schema item."""
    type: str = Field(..., description="Type of sub question")
    count: int = Field(..., ge=1, le=100, description="Count must be between 1 and 100")
    marks_each: int = Field(..., ge=1, le=100, description="Marks each must be between 1 and 100")
    
    bloom_level: Optional[int] = Field(None, ge=1, le=6, description="Bloom level must be between 1 and 6")


class QuestionSchemaItemDTO(BaseModel):
    """Individual question schema item."""
    type: str = Field(..., description="Type of question")
    count: int = Field(..., ge=1, le=100, description="Count must be between 1 and 100")
    marks_each: int = Field(..., ge=1, le=100, description="Marks each must be between 1 and 100")
    image_required: bool = Field(False, description="Whether the question requires an image")
    difficulty: str = Field(..., description="Difficulty of the question")
    
    bloom_level: Optional[int] = Field(None, ge=1, le=6, description="Bloom level must be between 1 and 6")
    filtered_topics: Optional[List[str]] = Field(None, description="Filtered topics for the question")
    
    sub_questions: Optional[List[SubQuestionSchemaItemDTO]] = Field(None, description="Sub questions for the question")


class QuestionPaperGenerateRequestDTO(BaseModel):
    """Request DTO for generating question papers with the new flattened structure."""
    course: str = Field(..., description="Course name and details")
    audience: str = Field(..., description="Target audience")
    topics: List[str] = Field(..., min_length=1, description="List of topics to cover")
    user_reference_media_urls: List[str] = Field(default_factory=list, description="Optional reference media URLs")
    
    item_schema: List[QuestionSchemaItemDTO] = Field(..., min_length=1, description="Question schema configuration is required")


