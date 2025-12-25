from pydantic import BaseModel


class CreateVectorDTO(BaseModel):
    embedding: list[float]
    file_hash: str
    text_content: str
    object_key: str


