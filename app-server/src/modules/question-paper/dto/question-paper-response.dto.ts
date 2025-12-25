import { ApiProperty } from '@nestjs/swagger';

export class QuestionOptionResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the option',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Text content of the option',
    example: 'Option A',
  })
  text: string;
}

export class SubQuestionResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the sub-question',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Text content of the sub-question',
    example: 'What is the derivative of x²?',
  })
  text: string;

  @ApiProperty({
    description: 'Marks of the sub-question',
    example: 10,
  })
  marks: number;

  @ApiProperty({
    description: 'List of options for the sub-question',
    type: [QuestionOptionResponseDto],
  })
  options: QuestionOptionResponseDto[];
}

export class QuestionResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the question',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Text content of the question',
    example: 'Solve the quadratic equation: x² + 5x + 6 = 0',
  })
  text: string;

  @ApiProperty({
    description: 'Marks of the question',
    example: 10,
  })
  marks: number;

  @ApiProperty({
    description: 'List of media IDs associated with the question',
    type: [String],
    example: ['media-id-1', 'media-id-2'],
  })
  imageMediaIds: string[];

  @ApiProperty({
    description: 'List of options for the question',
    type: [QuestionOptionResponseDto],
  })
  options: QuestionOptionResponseDto[];

  @ApiProperty({
    description: 'List of sub-questions',
    type: [SubQuestionResponseDto],
  })
  subQuestions: SubQuestionResponseDto[];
}

export class QuestionPaperResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the question paper',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the question paper',
    example: 'Mathematics Final Exam',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the question paper',
    example: 'Comprehensive mathematics exam covering algebra and calculus',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    description: 'List of questions in the paper',
    type: [QuestionResponseDto],
  })
  questions: QuestionResponseDto[];
}
