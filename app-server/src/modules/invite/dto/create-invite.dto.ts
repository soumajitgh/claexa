import { OrganizationRole } from '@entities';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateInviteDto {
  @ApiProperty({ description: 'Target organization ID', example: 'org-123' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({
    description: 'Email of the invitee',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ description: 'Role for the invitee', enum: OrganizationRole })
  @IsEnum(OrganizationRole, { message: 'Role must be either admin or member' })
  role: OrganizationRole;
}
