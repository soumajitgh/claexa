


from src.services.question_paper.dto.generate.request import QuestionPaperGenerateRequestDTO


def build_prompt(request: QuestionPaperGenerateRequestDTO) -> str:
    """
    Serializes the request DTO into a clean JSON string.

    This function transforms the structured Python request object into a JSON
    string that serves as the direct input for the AI model, which expects
    data conforming to the QuestionPaperGenerateRequestDTO schema.

    Args:
        request: An instance of the QuestionPaperGenerateRequestDTO class.

    Returns:
        A string containing the request data in JSON format.
    """
    # Use Pydantic's built-in method to correctly serialize the model to a JSON string.
    # `indent=2` is used for readability in logs; it can be removed for a more compact output.
    return request.model_dump_json(indent=2) 