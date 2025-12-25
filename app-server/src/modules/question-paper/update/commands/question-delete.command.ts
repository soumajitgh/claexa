import { Question, QuestionPaper } from '@entities';
import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';
import { Repository } from 'typeorm';
import { IQuestionPaperUpdateCommand } from '../interfaces/question-paper-update-command.interface';

class QuestionDeleteDto {
  @IsString()
  questionId: string;
}

export class QuestionDeleteCommand implements IQuestionPaperUpdateCommand {
  private data: object;
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
      questionRepository: Repository<Question>;
      questionPaperRepository: Repository<QuestionPaper>;
    },
  ) {
    this.data = data;
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

      const deleteData = plainToInstance(QuestionDeleteDto, this.data);

      // Verify the question belongs to the question paper
      const question = await this.questionRepository.findOne({
        where: {
          id: deleteData.questionId,
          questionPaper: { id: this.questionPaperId },
        },
      });

      if (!question) {
        return {
          isValid: false,
          message:
            'Question not found or does not belong to this question paper',
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
    const dto = plainToInstance(QuestionDeleteDto, this.data);
    const errors = validateSync(dto);

    return {
      isValid: errors.length === 0,
      errors: errors.map((error) => error.toString()),
    };
  }

  async execute(): Promise<void> {
    const deleteData = plainToInstance(QuestionDeleteDto, this.data);
    await this.questionRepository.delete(deleteData.questionId);
  }
}
