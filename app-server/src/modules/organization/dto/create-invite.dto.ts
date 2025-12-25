import { OrganizationRole } from '@entities';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateInviteDto {
  @ApiProperty({
    description: 'Email address of the user to invite',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Role to assign to the user in the organization',
    enum: OrganizationRole,
    example: OrganizationRole.MEMBER,
  })
  @IsEnum(OrganizationRole, { message: 'Role must be either admin or member' })
  role: OrganizationRole;
}
