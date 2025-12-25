import { User } from '@entities';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../libs/auth/decorators/current-user.decorator';
import { FirebaseTokenGuard } from '../../libs/auth/guards/firebase-token.guard';
import { CreateOrganizationDto, OrganizationMemberDto } from './dto';
import { OrganizationService } from './organization.service';

@ApiTags('organization')
@ApiBearerAuth()
@Controller('organization')
@UseGuards(FirebaseTokenGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new organization',
    description:
      'Creates a new organization with the current user as an admin member',
  })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async createOrganization(
    @CurrentUser() currentUser: User,
    @Body() createOrgDto: CreateOrganizationDto,
  ): Promise<void> {
    await this.organizationService.createOrganization(
      currentUser.id,
      createOrgDto,
    );
  }

  @Get(':id/members')
  @ApiOperation({
    summary: 'Get all members of an organization',
    description:
      'Returns all active members of the organization. Only organization members can access this endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'List of organization members',
    type: [OrganizationMemberDto],
  })
  @ApiResponse({ status: 400, description: 'No access to organization' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMembers(
    @CurrentUser() currentUser: User,
    @Param('id') organizationId: string,
  ): Promise<OrganizationMemberDto[]> {
    return this.organizationService.getOrganizationMembers(
      currentUser.id,
      organizationId,
    );
  }
}
