import { InviteStatus, User } from '@entities';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../libs/auth/decorators/current-user.decorator';
import { FirebaseTokenGuard } from '../../libs/auth/guards/firebase-token.guard';
import { CreateInviteDto } from './dto/create-invite.dto';
import { InviteResponseDto } from './dto/invite-response.dto';
import { UpdateInviteStatusDto } from './dto/update-invite-status.dto';
import { InviteService } from './invite.service';

@ApiTags('invites')
@ApiBearerAuth()
@Controller('invites')
@UseGuards(FirebaseTokenGuard)
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invite' })
  @ApiResponse({ status: 201, description: 'Invite created successfully' })
  async create(@Body() body: CreateInviteDto): Promise<void> {
    await this.inviteService.createInvite(body);
  }

  @Get()
  @ApiOperation({ summary: 'List invites with optional filtering' })
  @ApiQuery({ name: 'organizationId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: InviteStatus })
  @ApiResponse({ status: 200, type: [InviteResponseDto] })
  async index(
    @CurrentUser() currentUser: User,
    @Query('organizationId') organizationId?: string,
    @Query('status') status?: InviteStatus,
  ): Promise<InviteResponseDto[]> {
    return this.inviteService.listInvites({
      organizationId,
      userEmail: organizationId ? undefined : currentUser.email,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single invite by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: InviteResponseDto })
  async show(@Param('id') id: string): Promise<InviteResponseDto> {
    return this.inviteService.getInviteById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invite status (accept/reject)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Invite status updated' })
  async update(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
    @Body() dto: UpdateInviteStatusDto,
  ): Promise<void> {
    await this.inviteService.updateInviteStatus(currentUser.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an invite' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Invite deleted successfully' })
  async destroy(@Param('id') id: string): Promise<void> {
    await this.inviteService.deleteInvite(id);
  }
}
