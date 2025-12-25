import { OrganizationRole } from '@entities';
import { ApiProperty } from '@nestjs/swagger';

export class InviteOrganizationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class InviteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: OrganizationRole })
  role: OrganizationRole;

  @ApiProperty()
  organization: InviteOrganizationDto;
}
