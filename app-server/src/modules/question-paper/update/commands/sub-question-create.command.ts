import { Question, QuestionPaper, SubQuestion } from '@entities';
import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';
import { Repository } from 'typeorm';
import { IQuestionPaperUpdateCommand } from '../interfaces/question-paper-update-command.interface';

class SubQuestionCreateDto {
  @IsString()
  questionId: string;

  @IsString()
  text: string;

  @IsNumber()
  index: number;

  @IsNumber()
  marks: number;
}

export class SubQuestionCreateCommand implements IQuestionPaperUpdateCommand {
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

      const createData = plainToInstance(SubQuestionCreateDto, this.data);

      // Verify the question belongs to the question paper
      const question = await this.questionRepository.findOne({
        where: {
          id: createData.questionId,
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
    const dto = plainToInstance(SubQuestionCreateDto, this.data);
    const errors = validateSync(dto);

    return {
      isValid: errors.length === 0,
      errors: errors.map((error) => error.toString()),
    };
  }

  async execute(): Promise<void> {
    const createData = plainToInstance(SubQuestionCreateDto, this.data);

    // Get the question reference for the new sub-question
    const question = await this.questionRepository.findOne({
      where: {
        id: createData.questionId,
        questionPaper: { id: this.questionPaperId },
      },
    });

    const subQuestion = this.subQuestionRepository.create({
      text: createData.text,
      index: createData.index,
      marks: createData.marks,
      parentQuestion: question,
    });

    await this.subQuestionRepository.save(subQuestion);
  }
}
