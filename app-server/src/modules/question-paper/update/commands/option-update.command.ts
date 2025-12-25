import { Option, Question, QuestionPaper } from '@entities';
import { plainToInstance } from 'class-transformer';
import { IsNumber, IsOptional, IsString, validateSync } from 'class-validator';
import { Repository } from 'typeorm';
import { IQuestionPaperUpdateCommand } from '../interfaces/question-paper-update-command.interface';

class OptionUpdateDto {
  @IsString()
  optionId: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsNumber()
  @IsOptional()
  index?: number;
}

export class OptionUpdateCommand implements IQuestionPaperUpdateCommand {
  private data: object;
  private optionRepository: Repository<Option>;
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
      questionRepository: Repository<Question>;
      questionPaperRepository: Repository<QuestionPaper>;
    },
  ) {
    this.data = data;
    this.optionRepository = repositories.optionRepository;
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

      const updateData = plainToInstance(OptionUpdateDto, this.data);

      // Verify the option belongs to a question in this question paper
      const option = await this.optionRepository.findOne({
        where: { id: updateData.optionId },
        relations: ['question', 'question.questionPaper'],
      });

      if (
        !option ||
        option.question?.questionPaper?.id !== this.questionPaperId
      ) {
        return {
          isValid: false,
          message: 'Option not found or does not belong to this question paper',
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
    const dto = plainToInstance(OptionUpdateDto, this.data);
    const errors = validateSync(dto);

    return {
      isValid: errors.length === 0,
      errors: errors.map((error) => error.toString()),
    };
  }

  async execute(): Promise<void> {
    const updateData = plainToInstance(OptionUpdateDto, this.data);

    // Only update fields that are provided
    const updateFields: Partial<Option> = {};
    if (updateData.text !== undefined) {
      updateFields.text = updateData.text;
    }
    if (updateData.index !== undefined) {
      updateFields.index = updateData.index;
    }

    await this.optionRepository.update(updateData.optionId, updateFields);
  }
}
