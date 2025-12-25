import { OrganizationRole } from '@entities';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationMemberDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ required: false })
  avatarUrl?: string;

  @ApiProperty({ enum: OrganizationRole })
  role: OrganizationRole;
}

export class OrganizationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [OrganizationMemberDto] })
  members: OrganizationMemberDto[];
}

export class CreateOrganizationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  message: string;
}
