import { Option, Question, QuestionPaper, SubQuestion } from '@entities';
import {
  QuestionOptionResponseDto,
  QuestionPaperResponseDto,
  QuestionResponseDto,
  SubQuestionResponseDto,
} from '../dto/question-paper-response.dto';
import { QuestionPaperSummaryResponse } from '../dto/question-paper-summary-response.dto';

export class QuestionPaperResponseMapper {
  static toResponseDto(questionPaper: QuestionPaper): QuestionPaperResponseDto {
    return {
      id: questionPaper.id,
      name: questionPaper.name,
      description: questionPaper.description,
      questions:
        questionPaper.questions?.map((question) =>
          this.mapQuestionToResponseDto(question),
        ) || [],
    };
  }

  private static mapQuestionToResponseDto(
    question: Question,
  ): QuestionResponseDto {
    return {
      id: question.id,
      text: question.text,
      marks: question.marks,
      imageMediaIds: question.images?.map((image) => image.media.id) || [],
      options:
        question.options?.map((option) =>
          this.mapOptionToResponseDto(option),
        ) || [],
      subQuestions:
        question.subQuestions?.map((subQuestion) =>
          this.mapSubQuestionToResponseDto(subQuestion),
        ) || [],
    };
  }

  private static mapSubQuestionToResponseDto(
    subQuestion: SubQuestion,
  ): SubQuestionResponseDto {
    return {
      id: subQuestion.id,
      text: subQuestion.text,
      marks: subQuestion.marks,
      options:
        subQuestion.options?.map((option) =>
          this.mapOptionToResponseDto(option),
        ) || [],
    };
  }

  private static mapOptionToResponseDto(
    option: Option,
  ): QuestionOptionResponseDto {
    return {
      id: option.id,
      text: option.text,
    };
  }

  static toSummaryResponseDto(
    questionPaper: QuestionPaper,
  ): QuestionPaperSummaryResponse {
    return {
      id: questionPaper.id,
      name: questionPaper.name,
      updatedAt: questionPaper.updatedAt,
      itemCount: questionPaper.questions?.length || 0,
    };
  }
}
