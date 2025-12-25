import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'The name of the organization',
    example: 'Tech Innovators Inc.',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Organization name is required' })
  @IsString()
  @MinLength(2, {
    message: 'Organization name must be at least 2 characters long',
  })
  @MaxLength(100, {
    message: 'Organization name must not exceed 100 characters',
  })
  @Transform(({ value }) => value?.trim())
  name: string;
}
