import {
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
import { AccountService } from '../account/account.service';
import { CreateOrganizationDto, OrganizationMemberDto } from './dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(UserOrganization)
    private userOrganizationRepository: Repository<UserOrganization>,
    @InjectRepository(OrganizationInvite)
    private organizationInviteRepository: Repository<OrganizationInvite>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private accountService: AccountService,
  ) {}

  async createOrganization(
    userId: string,
    createOrgDto: CreateOrganizationDto,
  ): Promise<Organization> {
    // Find the user
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['activeUserOrganization'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create the organization
    const organization = this.organizationRepository.create({
      name: createOrgDto.name,
    });
    const savedOrganization =
      await this.organizationRepository.save(organization);

    // Add the user as an admin to the organization
    const userOrganization = this.userOrganizationRepository.create({
      user: { id: user.id },
      organization: { id: savedOrganization.id },
      role: OrganizationRole.ADMIN,
      status: OrganizationStatus.ACTIVE,
    });
    const savedUserOrganization =
      await this.userOrganizationRepository.save(userOrganization);

    // Set the created organization as the current organization for the user
    user.activeUserOrganization = savedUserOrganization;
    await this.usersRepository.save(user);

    return savedOrganization;
  }

  async getOrganizationMembers(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMemberDto[]> {
    // Check if user is a member of the organization
    const userOrg = await this.userOrganizationRepository.findOne({
      where: {
        user: { id: userId },
        organization: { id: organizationId },
        status: OrganizationStatus.ACTIVE,
      },
    });

    if (!userOrg) {
      throw new BadRequestException(
        'You do not have access to this organization',
      );
    }

    // Get all active members of the organization
    const members = await this.userOrganizationRepository.find({
      where: {
        organization: { id: organizationId },
        status: OrganizationStatus.ACTIVE,
      },
      relations: ['user', 'user.profile'],
    });

    return members.map((member) => ({
      id: member.user.id,
      email: member.user.email,
      fullName: member.user.profile?.fullName || '',
      avatarUrl: member.user.profile?.avatarUrl,
      role: member.role,
    }));
  }

  // Invite-related logic moved to InviteModule
}
