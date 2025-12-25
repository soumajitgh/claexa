import { OrganizationRole } from '@entities';
import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'Avatar URL for the user profile',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatarUrl?: string;
}

export class UserOrganizationResponseDto {
  @ApiProperty({
    description: 'Current organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Current organization name',
    example: 'My Organization',
  })
  name: string;

  @ApiProperty({
    description: 'Current organization role',
    enum: OrganizationRole,
  })
  role: OrganizationRole;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User credits',
    example: 100,
  })
  credits: number;

  @ApiProperty({
    description: 'User profile information',
    type: UserProfileResponseDto,
    nullable: true,
  })
  profile?: UserProfileResponseDto;

  @ApiProperty({
    description: 'Current organization information',
    type: UserOrganizationResponseDto,
    nullable: true,
  })
  activeOrganization?: UserOrganizationResponseDto;

  @ApiProperty({
    description: 'Organizations the user is a member of',
    type: [UserOrganizationResponseDto],
  })
  organizations: UserOrganizationResponseDto[];
}
