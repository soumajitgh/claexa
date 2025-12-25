import { UploadStatus } from '@entities';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive } from 'class-validator';

export class CompleteUploadDto {
  @ApiProperty({
    description: 'Size of the uploaded file in bytes',
    example: 1024000,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive({ message: 'File size must be a positive number' })
  size: number;

  @ApiProperty({
    description: 'Upload status to set for the media',
    enum: UploadStatus,
    example: UploadStatus.COMPLETED,
  })
  @IsEnum(UploadStatus, { message: 'Upload status must be a valid enum value' })
  uploadStatus: UploadStatus;
}
