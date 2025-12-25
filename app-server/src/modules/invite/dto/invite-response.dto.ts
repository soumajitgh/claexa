import { InviteStatus, OrganizationRole } from '@entities';
import { ApiProperty } from '@nestjs/swagger';

export class InviteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: OrganizationRole })
  role: OrganizationRole;

  @ApiProperty({ enum: InviteStatus })
  status: InviteStatus;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  organizationName: string;
}
