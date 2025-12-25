import { Option, Question, QuestionPaper, SubQuestion } from '@entities';
import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';
import { Repository } from 'typeorm';
import { IQuestionPaperUpdateCommand } from '../interfaces/question-paper-update-command.interface';

class SubQuestionOptionCreateDto {
  @IsString()
  subQuestionId: string;

  @IsString()
  text: string;

  @IsNumber()
  index: number;
}

export class SubQuestionOptionCreateCommand
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

      const createData = plainToInstance(SubQuestionOptionCreateDto, this.data);

      // Verify the sub-question belongs to a question in this question paper
      const subQuestion = await this.subQuestionRepository.findOne({
        where: { id: createData.subQuestionId },
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
    const dto = plainToInstance(SubQuestionOptionCreateDto, this.data);
    const errors = validateSync(dto);

    return {
      isValid: errors.length === 0,
      errors: errors.map((error) => error.toString()),
    };
  }

  async execute(): Promise<void> {
    const createData = plainToInstance(SubQuestionOptionCreateDto, this.data);

    // Get the sub-question reference for the new option
    const subQuestion = await this.subQuestionRepository.findOne({
      where: { id: createData.subQuestionId },
      relations: ['parentQuestion', 'parentQuestion.questionPaper'],
    });

    const option = this.optionRepository.create({
      text: createData.text,
      index: createData.index,
      subQuestion: subQuestion,
    });

    await this.optionRepository.save(option);
  }
}
