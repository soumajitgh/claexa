import { QuestionPaper } from '@entities';
import { plainToInstance } from 'class-transformer';
import { IsOptional, IsString, validateSync } from 'class-validator';
import { Repository } from 'typeorm';
import { IQuestionPaperUpdateCommand } from '../interfaces/question-paper-update-command.interface';

class QuestionPaperMetaUpdateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class QuestionPaperMetaCommand implements IQuestionPaperUpdateCommand {
  private data: object;
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
      questionPaperRepository: Repository<QuestionPaper>;
    },
  ) {
    this.data = data;
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
    const dto = plainToInstance(QuestionPaperMetaUpdateDto, this.data);
    const errors = validateSync(dto);

    return {
      isValid: errors.length === 0,
      errors: errors.map((error) => error.toString()),
    };
  }

  async execute(): Promise<void> {
    const updateData = plainToInstance(QuestionPaperMetaUpdateDto, this.data);

    // Only update fields that are provided
    const updateFields: Partial<QuestionPaper> = {};
    if (updateData.name !== undefined) {
      updateFields.name = updateData.name;
    }
    if (updateData.description !== undefined) {
      updateFields.description = updateData.description;
    }

    await this.questionPaperRepository.update(
      this.questionPaperId,
      updateFields,
    );
  }
}
