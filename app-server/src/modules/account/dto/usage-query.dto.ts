import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UsageQueryDto {
  @ApiProperty({
    description: 'Start date for filtering usage records (ISO 8601 format)',
    required: false,
    example: '2025-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering usage records (ISO 8601 format)',
    required: false,
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
