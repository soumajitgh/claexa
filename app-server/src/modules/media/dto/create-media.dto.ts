import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMediaDto {
  @ApiProperty({
    description: 'Original name of the file',
    example: 'my-document.pdf',
  })
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  @IsString()
  @IsNotEmpty()
  mimetype: string;
}

export class UploadFileDto extends CreateMediaDto {
  @ApiPropertyOptional({
    description: 'Whether to create a database record for this upload',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  createRecord?: boolean = true;
}
