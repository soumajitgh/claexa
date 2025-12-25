import logging
from typing import Any, cast

from src.grpc_types import ai_service_pb2 as pb
from .dto.generate.request import (
    QuestionPaperGenerateRequestDTO,
    QuestionSchemaItemDTO,
    SubQuestionSchemaItemDTO,
)
from .models.core_question_paper import QuestionPaper, Question, QuestionOption, QuestionImage, SubQuestion

logger = logging.getLogger(__name__)

# Help static type checkers when using generated protobuf symbols
pb = cast(Any, pb)


def pb_to_generate_request(req) -> QuestionPaperGenerateRequestDTO:
    """Map protobuf QuestionPaperGenerateRequest to service DTO."""
    q_items = []
    for qi in req.item_schema:
        sub_items = []
        for si in getattr(qi, "sub_questions", []):
            sub_items.append(
                SubQuestionSchemaItemDTO(
                    type=si.type,
                    count=si.count,
                    marks_each=si.marks_each,
                    bloom_level=si.bloom_level or None,
                )
            )
        q_items.append(
            QuestionSchemaItemDTO(
                type=qi.type,
                count=qi.count,
                marks_each=qi.marks_each,
                image_required=qi.image_required,
                difficulty=getattr(qi, "difficulty", "medium"),
                bloom_level=qi.bloom_level or None,
                filtered_topics=list(qi.filtered_topics) if qi.filtered_topics else None,
                sub_questions=sub_items or None,
            )
        )

    return QuestionPaperGenerateRequestDTO(
        course=req.course,
        audience=req.audience,
        topics=list(req.topics),
        user_reference_media_urls=list(req.user_reference_media_urls),
        item_schema=q_items,
    )


def _map_option(o):
    return pb.QuestionOption(text=o.text)  # pyright: ignore[reportAttributeAccessIssue]


def _map_image(i):
    return pb.QuestionImage(base64_image=i.base64_image)  # pyright: ignore[reportAttributeAccessIssue]


def _map_subquestion(sq):
    return pb.SubQuestion(  # pyright: ignore[reportAttributeAccessIssue]
        text=sq.text,
        marks=sq.marks,
        options=[_map_option(o) for o in (sq.options or [])],
    )


def _map_question(q):
    return pb.Question(  # pyright: ignore[reportAttributeAccessIssue]
        text=q.text,
        marks=q.marks,
        bloom_level=q.bloom_level,
        options=[_map_option(o) for o in (q.options or [])],
        images=[_map_image(i) for i in (q.images or [])],
        sub_questions=[_map_subquestion(sq) for sq in (q.sub_questions or [])],
    )


def core_to_pb_question_paper(core: QuestionPaper):
    return pb.QuestionPaper(  # pyright: ignore[reportAttributeAccessIssue]
        name=core.name,
        questions=[_map_question(q) for q in core.questions],
    )



