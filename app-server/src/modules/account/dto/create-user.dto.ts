import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateUserProfileDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  fullName: string;

  @ApiProperty({
    description: 'Avatar URL for the user profile',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
  avatarUrl?: string;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Firebase UID for the user',
    example: 'firebase_uid_123',
  })
  @IsString()
  @IsNotEmpty()
  firebaseUid: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User profile information',
    type: CreateUserProfileDto,
  })
  @ValidateNested()
  @Type(() => CreateUserProfileDto)
  profile: CreateUserProfileDto;
}
