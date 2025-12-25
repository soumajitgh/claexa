/**
 * Example Request for GenerateWithAiDto:
 *
 * {
 *   "course": "Advanced Mathematics - Calculus and Integration",
 *   "audience": "university",
 *   "difficulty": 7,
 *   "topics": [
 *     "Calculus",
 *     "Integration",
 *     "Differential Equations",
 *     "Limits and Continuity"
 *   ],
 *   "mediaIds": [
 *     "123e4567-e89b-12d3-a456-426614174000",
 *     "987fcdeb-51a2-43d1-b789-123456789abc"
 *   ],
 *   "itemSchema": [
 *     {
 *       "type": "multiple_choice",
 *       "count": 10,
 *       "marksEach": 2,
 *       "bloomLevel": 2,
 *       "subQuestions": [
 *         {
 *           "type": "short_answer",
 *           "count": 3,
 *           "marksEach": 5,
 *           "bloomLevel": 4
 *         }
 *       ]
 *     },
 *     {
 *       "type": "essay",
 *       "count": 2,
 *       "marks_each": 15,
 *       "bloom_level": 5
 *     },
 *     {
 *       "type": "problem_solving",
 *       "count": 3,
 *       "marks_each": 10,
 *       "bloom_level": 6
 *     }
 *   ]
 * }
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class SubQuestionSchemaItemDto {
  @ApiProperty({ description: 'Type of sub question', example: 'short_answer' })
  @IsString({ message: 'Sub question type must be a string' })
  @IsNotEmpty({ message: 'Sub question type cannot be empty' })
  type: string;

  @ApiProperty({
    description: 'Count of sub questions (1-100)',
    example: 3,
    minimum: 1,
    maximum: 100,
  })
  @IsInt({ message: 'Count must be an integer' })
  @Min(1, { message: 'Count must be at least 1' })
  @Max(100, { message: 'Count must not exceed 100' })
  count: number;

  @ApiProperty({
    description: 'Marks for each sub question (1-100)',
    example: 5,
    minimum: 1,
    maximum: 100,
  })
  @IsInt({ message: 'Marks each must be an integer' })
  @Min(1, { message: 'Marks each must be at least 1' })
  @Max(100, { message: 'Marks each must not exceed 100' })
  marksEach: number;

  @ApiProperty({
    description: 'Bloom level (1-6)',
    example: 4,
    minimum: 1,
    maximum: 6,
  })
  @IsInt({ message: 'Bloom level must be an integer' })
  @Min(1, { message: 'Bloom level must be at least 1' })
  @Max(6, { message: 'Bloom level must not exceed 6' })
  @IsOptional()
  bloomLevel?: number;
}

export class QuestionSchemaItemDto {
  @ApiProperty({ description: 'Type of question', example: 'multiple_choice' })
  @IsString({ message: 'Question type must be a string' })
  @IsNotEmpty({ message: 'Question type cannot be empty' })
  type: string;

  @ApiProperty({
    description: 'Count of questions (1-100)',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsInt({ message: 'Count must be an integer' })
  @Min(1, { message: 'Count must be at least 1' })
  @Max(100, { message: 'Count must not exceed 100' })
  count: number;

  @ApiProperty({
    description: 'Marks for each question (1-100)',
    example: 2,
    minimum: 1,
    maximum: 100,
  })
  @IsInt({ message: 'Marks each must be an integer' })
  @Min(1, { message: 'Marks each must be at least 1' })
  @Max(100, { message: 'Marks each must not exceed 100' })
  marksEach: number;

  @ApiPropertyOptional({
    description: 'Difficulty for this item',
    example: 'medium',
    enum: ['very_easy', 'easy', 'medium', 'hard', 'very_hard'],
  })
  @IsString({ message: 'difficulty must be a string' })
  @IsIn(['very_easy', 'easy', 'medium', 'hard', 'very_hard'], {
    message: 'difficulty must be one of very_easy|easy|medium|hard|very_hard',
  })
  difficulty: string;

  @ApiPropertyOptional({
    description: 'Whether image is required for each question',
    example: false,
  })
  @IsBoolean({ message: 'imageRequired must be a boolean' })
  imageRequired: boolean;

  @ApiProperty({
    description: 'Bloom level (1-6)',
    example: 2,
    minimum: 1,
    maximum: 6,
  })
  @IsInt({ message: 'Bloom level must be an integer' })
  @Min(1, { message: 'Bloom level must be at least 1' })
  @Max(6, { message: 'Bloom level must not exceed 6' })
  @IsOptional()
  bloomLevel?: number;

  @ApiPropertyOptional({
    description: 'Filtered topics for this item',
    type: [String],
    example: ['Integration'],
  })
  @IsOptional()
  @IsArray({ message: 'filteredTopics must be an array' })
  @IsString({ each: true, message: 'Each topic must be a string' })
  filteredTopics?: string[];

  @ApiPropertyOptional({
    description: 'Sub questions for the question',
    type: [SubQuestionSchemaItemDto],
  })
  @IsOptional()
  @IsArray({ message: 'Sub questions must be an array' })
  @ValidateNested({ each: true })
  @Type(() => SubQuestionSchemaItemDto)
  subQuestions?: SubQuestionSchemaItemDto[];
}

export class GenerateWithAiDto {
  @ApiProperty({
    description: 'Course name and details',
    example: 'Advanced Mathematics - Calculus and Integration',
  })
  @IsString({ message: 'Course must be a string' })
  @IsNotEmpty({ message: 'Course cannot be empty' })
  @Transform(({ value }) => value?.trim())
  course: string;

  @ApiProperty({
    description: 'Target audience for the question paper',
    example: 'university',
  })
  @IsString({ message: 'Audience must be a string' })
  @IsNotEmpty({ message: 'Audience cannot be empty' })
  audience: string;

  @ApiProperty({
    description: 'List of topics to cover',
    example: ['Calculus', 'Integration', 'Differential Equations'],
    type: [String],
  })
  @IsArray({ message: 'Topics must be an array' })
  @ArrayMinSize(1, { message: 'At least one topic is required' })
  @IsString({ each: true, message: 'Each topic must be a string' })
  @IsNotEmpty({ each: true, message: 'Each topic cannot be empty' })
  @Transform(({ value }) => value?.map((topic: string) => topic?.trim()))
  topics: string[];

  @ApiProperty({
    description: 'List of media IDs',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsArray({ message: 'Media IDs must be an array' })
  @IsOptional()
  mediaIds: string[] = [];

  @ApiProperty({
    description: 'Question schema configuration',
    type: [QuestionSchemaItemDto],
    example: [
      {
        type: 'multiple_choice',
        count: 10,
        marksEach: 2,
        bloomLevel: 2,
        subQuestions: [
          {
            type: 'short_answer',
            count: 3,
            marksEach: 5,
            bloomLevel: 4,
          },
        ],
      },
    ],
  })
  @IsNotEmpty({ message: 'Item schema is required' })
  @ArrayMinSize(1, { message: 'At least one item schema entry is required' })
  @ValidateNested({ each: true })
  @Type(() => QuestionSchemaItemDto)
  itemSchema: QuestionSchemaItemDto[];
}

export class GenerateWithAiResponseDto {
  @ApiProperty({
    description: 'Generated question paper ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;
}
