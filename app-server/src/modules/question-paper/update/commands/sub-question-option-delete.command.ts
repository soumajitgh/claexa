import { Option, Question, QuestionPaper, SubQuestion } from '@entities';
import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';
import { Repository } from 'typeorm';
import { IQuestionPaperUpdateCommand } from '../interfaces/question-paper-update-command.interface';

class SubQuestionOptionDeleteDto {
  @IsString()
  optionId: string;
}

export class SubQuestionOptionDeleteCommand
  implements IQuestionPaperUpdateCommand
{
  private data: object;
  private optionRepository: Repository<Option>;
  private subQuestionRepository: Repository<SubQuestion>;
  private questionRepository: Repository<Question>;
  private questionPaperRepository: Repository<QuestionPaper>;
  private questionPaperId: string;
  private userId: string;

  constructor(
    data: object,
    params: {
      questionPaperId: string;
      userId: string;
    },
    repositories: {
      optionRepository: Repository<Option>;
      subQuestionRepository: Repository<SubQuestion>;
      questionRepository: Repository<Question>;
      questionPaperRepository: Repository<QuestionPaper>;
    },
  ) {
    this.data = data;
    this.optionRepository = repositories.optionRepository;
    this.subQuestionRepository = repositories.subQuestionRepository;
    this.questionRepository = repositories.questionRepository;
    this.questionPaperRepository = repositories.questionPaperRepository;
    this.questionPaperId = params.questionPaperId;
    this.userId = params.userId;
  }

  async verifyAccess(): Promise<{ isValid: boolean; message: string }> {
    try {
      const questionPaper = await this.questionPaperRepository.findOne({
        where: { id: this.questionPaperId },
        relations: ['owner'],
      });

      if (!questionPaper) {
        return {
          isValid: false,
          message: 'Question paper not found',
        };
      }

      if (questionPaper.owner.id !== this.userId) {
        return {
          isValid: false,
          message: 'Access denied: Question paper does not belong to user',
        };
      }

      const deleteData = plainToInstance(SubQuestionOptionDeleteDto, this.data);

      // Verify the option belongs to a sub-question in this question paper
      const option = await this.optionRepository.findOne({
        where: { id: deleteData.optionId },
        relations: [
          'subQuestion',
          'subQuestion.parentQuestion',
          'subQuestion.parentQuestion.questionPaper',
        ],
      });

      if (
        !option ||
        !option.subQuestion ||
        option.subQuestion?.parentQuestion?.questionPaper?.id !==
          this.questionPaperId
      ) {
        return {
          isValid: false,
          message:
            'Option not found or does not belong to a sub-question in this question paper',
        };
      }

      return {
        isValid: true,
        message: 'Access verified',
      };
    } catch (error) {
      return {
        isValid: false,
        message: `Access verification failed: ${error.message}`,
      };
    }
  }

  validate(): { isValid: boolean; errors: string[] } {
    const dto = plainToInstance(SubQuestionOptionDeleteDto, this.data);
    const errors = validateSync(dto);

    return {
      isValid: errors.length === 0,
      errors: errors.map((error) => error.toString()),
    };
  }

  async execute(): Promise<void> {
    const deleteData = plainToInstance(SubQuestionOptionDeleteDto, this.data);
    await this.optionRepository.delete(deleteData.optionId);
  }
}
