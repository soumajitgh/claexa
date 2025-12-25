import { UploadStatus } from '@entities';
import { ApiProperty } from '@nestjs/swagger';

export class MediaResponseDto {
  @ApiProperty({
    description: 'Media ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Original file name',
    example: 'my-image.jpg',
  })
  originalName: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
  })
  mimetype: string;

  @ApiProperty({
    description: 'Size of the file in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'Upload status of the media',
    enum: UploadStatus,
    example: UploadStatus.COMPLETED,
  })
  uploadStatus: UploadStatus;
}
