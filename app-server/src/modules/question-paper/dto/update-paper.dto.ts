import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject } from 'class-validator';
import { QuestionPaperUpdateIdentifierEnum } from '../update/question-paper-update.dto';

export class UpdatePaperDto {
  @ApiProperty({
    description: 'Type of update to perform',
    enum: QuestionPaperUpdateIdentifierEnum,
    example: QuestionPaperUpdateIdentifierEnum.QUESTION_PAPER_META,
  })
  @IsEnum(QuestionPaperUpdateIdentifierEnum, {
    message: 'Invalid update identifier',
  })
  identifier: QuestionPaperUpdateIdentifierEnum;

  @ApiProperty({
    description: 'Data for the update operation',
    example: {
      name: 'Updated Geography Quiz',
      description: 'Updated description for the quiz',
    },
  })
  @IsObject({ message: 'Data must be an object' })
  data: object;
}

export class QuestionPaperUpdateResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Question paper updated successfully',
  })
  message: string;
}
