import { Question, QuestionPaper, SubQuestion } from '@entities';
import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';
import { Repository } from 'typeorm';
import { IQuestionPaperUpdateCommand } from '../interfaces/question-paper-update-command.interface';

class SubQuestionDeleteDto {
  @IsString()
  subQuestionId: string;
}

export class SubQuestionDeleteCommand implements IQuestionPaperUpdateCommand {
  private data: object;
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
      subQuestionRepository: Repository<SubQuestion>;
      questionRepository: Repository<Question>;
      questionPaperRepository: Repository<QuestionPaper>;
    },
  ) {
    this.data = data;
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

      const deleteData = plainToInstance(SubQuestionDeleteDto, this.data);

      // Verify the sub-question belongs to a question in this question paper
      const subQuestion = await this.subQuestionRepository.findOne({
        where: { id: deleteData.subQuestionId },
        relations: ['parentQuestion', 'parentQuestion.questionPaper'],
      });

      if (
        !subQuestion ||
        subQuestion.parentQuestion?.questionPaper?.id !== this.questionPaperId
      ) {
        return {
          isValid: false,
          message:
            'Sub-question not found or does not belong to this question paper',
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
    const dto = plainToInstance(SubQuestionDeleteDto, this.data);
    const errors = validateSync(dto);

    return {
      isValid: errors.length === 0,
      errors: errors.map((error) => error.toString()),
    };
  }

  async execute(): Promise<void> {
    const deleteData = plainToInstance(SubQuestionDeleteDto, this.data);
    await this.subQuestionRepository.delete(deleteData.subQuestionId);
  }
}
