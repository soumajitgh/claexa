import { ApiProperty } from '@nestjs/swagger';
import { FeatureKey } from '../../../libs/usage/feature/interfaces/feature-strategy.interface';

export class UsageResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the usage record',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Feature that was used',
    enum: FeatureKey,
    example: FeatureKey.GENERATE_QUESTION_PAPER,
  })
  feature: FeatureKey;

  @ApiProperty({
    description: 'Timestamp when the feature was used',
    example: '2025-09-30T10:30:00Z',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Number of credits consumed',
    example: 100,
  })
  creditsConsumed: number;
}
