import { User } from '@entities';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../libs/auth/decorators/current-user.decorator';
import { FirebaseTokenGuard } from '../../libs/auth/guards/firebase-token.guard';
import { AccountService } from './account.service';
import {
  UpdateProfileDto,
  UsageQueryDto,
  UsageResponseDto,
  UserResponseDto,
} from './dto';
import { UserMapper } from './mappers';

@ApiTags('account')
@ApiBearerAuth()
@Controller('account')
@UseGuards(FirebaseTokenGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current user profile',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getCurrentUser(
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    const user = await this.accountService.getUser(currentUser.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserMapper.toResponseDto(user);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfile(
    @CurrentUser() currentUser: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<void> {
    await this.accountService.updateProfile(currentUser.id, updateProfileDto);
  }

  @Get('usage')
  @ApiOperation({
    summary: 'Get user usage history',
    description:
      'Retrieves the usage history for the current user with optional time-based filtering',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (ISO 8601 format)',
    example: '2025-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (ISO 8601 format)',
    example: '2025-12-31T23:59:59Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the usage history',
    type: [UsageResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUsage(
    @CurrentUser() currentUser: User,
    @Query() query: UsageQueryDto,
  ): Promise<UsageResponseDto[]> {
    return this.accountService.getUserUsage(currentUser.id, query);
  }
}
