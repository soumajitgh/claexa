import { InviteStatus } from '@entities';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateInviteStatusDto {
  @ApiProperty({ enum: InviteStatus, example: InviteStatus.ACCEPTED })
  @IsEnum(InviteStatus)
  status: InviteStatus;
}
