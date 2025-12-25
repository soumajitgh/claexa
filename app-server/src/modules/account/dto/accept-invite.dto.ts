import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum InviteAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
}

export class InviteActionDto {
  @ApiProperty({
    enum: InviteAction,
    example: InviteAction.ACCEPT,
    description: 'The action to perform on the invite',
  })
  @IsEnum(InviteAction)
  action: InviteAction;
}
