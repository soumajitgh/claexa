import {
  InviteStatus,
  Organization,
  OrganizationInvite,
  OrganizationRole,
  OrganizationStatus,
  User,
  UserOrganization,
} from '@entities';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInviteDto } from './dto/create-invite.dto';
import { InviteResponseDto } from './dto/invite-response.dto';
import { UpdateInviteStatusDto } from './dto/update-invite-status.dto';

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(OrganizationInvite)
    private readonly inviteRepository: Repository<OrganizationInvite>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserOrganization)
    private readonly userOrganizationRepository: Repository<UserOrganization>,
  ) {}

  async createInvite(data: CreateInviteDto): Promise<void> {
    const organization = await this.organizationRepository.findOne({
      where: { id: data.organizationId },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const existingPending = await this.inviteRepository.findOne({
      where: {
        email: data.email,
        organization: { id: data.organizationId },
        status: InviteStatus.PENDING,
      },
    });
    if (existingPending) {
      throw new BadRequestException(
        'An invite has already been sent to this email address',
      );
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (existingUser) {
      const existingMembership = await this.userOrganizationRepository.findOne({
        where: {
          user: { id: existingUser.id },
          organization: { id: data.organizationId },
        },
      });
      if (existingMembership) {
        throw new BadRequestException(
          'User is already a member of this organization',
        );
      }
    }

    const invite = this.inviteRepository.create({
      email: data.email,
      organization,
      role: data.role,
      status: InviteStatus.PENDING,
    });
    await this.inviteRepository.save(invite);
  }

  async listInvites(params: {
    organizationId?: string;
    userEmail?: string;
    status?: InviteStatus;
  }): Promise<InviteResponseDto[]> {
    const where: any = {};
    if (params.organizationId) {
      where.organization = { id: params.organizationId };
    }
    if (params.userEmail) {
      where.email = params.userEmail;
    }
    if (params.status) {
      where.status = params.status;
    }
    const invites = await this.inviteRepository.find({
      where,
      relations: ['organization'],
    });
    return invites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: invite.role as OrganizationRole,
      status: invite.status,
      organizationId: invite.organization.id,
      organizationName: invite.organization.name,
    }));
  }

  async getInviteById(inviteId: string): Promise<InviteResponseDto> {
    const invite = await this.inviteRepository.findOne({
      where: { id: inviteId },
      relations: ['organization'],
    });
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    return {
      id: invite.id,
      email: invite.email,
      role: invite.role as OrganizationRole,
      status: invite.status,
      organizationId: invite.organization.id,
      organizationName: invite.organization.name,
    };
  }

  async deleteInvite(inviteId: string): Promise<void> {
    const invite = await this.inviteRepository.findOne({
      where: { id: inviteId },
    });
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    await this.inviteRepository.remove(invite);
  }

  async updateInviteStatus(
    currentUserId: string,
    inviteId: string,
    dto: UpdateInviteStatusDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const invite = await this.inviteRepository.findOne({
      where: { id: inviteId, email: user.email },
      relations: ['organization'],
    });
    if (!invite || invite.status !== InviteStatus.PENDING) {
      throw new NotFoundException('Invite not found or already processed');
    }

    if (dto.status === InviteStatus.ACCEPTED) {
      const membership = await this.userOrganizationRepository.findOne({
        where: {
          user: { id: currentUserId },
          organization: { id: invite.organization.id },
        },
      });
      if (membership) {
        throw new BadRequestException(
          'User is already a member of this organization',
        );
      }

      const userOrg = this.userOrganizationRepository.create({
        user: { id: currentUserId } as User,
        organization: invite.organization,
        role: invite.role as OrganizationRole,
        status: OrganizationStatus.ACTIVE,
      });
      await this.userOrganizationRepository.save(userOrg);
    }

    invite.status = dto.status;
    await this.inviteRepository.save(invite);
  }
}
