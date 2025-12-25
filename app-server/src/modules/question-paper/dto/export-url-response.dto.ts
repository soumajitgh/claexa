import { ApiProperty } from '@nestjs/swagger';

export class ExportUrlResponseDto {
  @ApiProperty({
    description: 'Pre-signed URL to download the exported file',
    example:
      'https://s3.amazonaws.com/bucket/exports/123/file.pdf?X-Amz-Signature=...',
  })
  url: string;
}
