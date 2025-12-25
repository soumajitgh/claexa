import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePaperDto {
  @ApiProperty({
    description: 'Name of the question paper',
    example: 'Geography Quiz - Europe',
    minLength: 3,
    maxLength: 200,
  })
  @IsString({ message: 'Paper name must be a string' })
  @IsNotEmpty({ message: 'Paper name cannot be empty' })
  @MinLength(3, { message: 'Paper name must be at least 3 characters long' })
  @MaxLength(200, { message: 'Paper name must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the question paper',
    example:
      'A comprehensive quiz covering European geography, capitals, and landmarks',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Paper description must be a string' })
  @MaxLength(1000, {
    message: 'Paper description must not exceed 1000 characters',
  })
  @Transform(({ value }) => value?.trim())
  description?: string;
}

export class QuestionPaperCreateResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the newly created question paper',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;
}
