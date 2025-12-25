import { ApiProperty } from '@nestjs/swagger';

export class QuestionPaperSummaryResponse {
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
    description: 'Updated at timestamp',
    example: '2021-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Number of questions in the paper',
    example: 25,
  })
  itemCount: number;
}
