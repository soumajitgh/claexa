import { FeatureUsage, User, UserProfile } from '@entities';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreditService } from '../../libs/credit/credit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsageQueryDto } from './dto/usage-query.dto';
import { UsageResponseDto } from './dto/usage-response.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(FeatureUsage)
    private featureUsageRepository: Repository<FeatureUsage>,
    private creditService: CreditService,
  ) {}

  async getUser(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: [
        'profile',
        'activeUserOrganization',
        'activeUserOrganization.organization',
        'userOrganizations',
        'userOrganizations.organization',
      ],
    });
  }

  async create(
    userData: CreateUserDto,
    initialCredits: number = 0,
  ): Promise<User> {
    const user = this.usersRepository.create({
      firebaseUid: userData.firebaseUid,
      email: userData.email,
      profile: {
        fullName: userData.profile.fullName,
        avatarUrl: userData.profile.avatarUrl,
      },
    });

    const savedUser = await this.usersRepository.save(user);

    // Add initial credits if specified
    if (initialCredits > 0) {
      await this.creditService.modifyCredit({
        userId: savedUser.id,
        amount: initialCredits,
        metadata: {
          type: 'initial_credits',
          source: 'user_registration',
        },
      });
    }

    return savedUser;
  }

  async updateProfile(
    userId: string,
    updateData: UpdateProfileDto,
  ): Promise<UserProfile> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.profile) {
      // Create profile if it doesn't exist
      const newProfile = this.userProfileRepository.create({
        ...updateData,
        user,
      });
      return this.userProfileRepository.save(newProfile);
    } else {
      // Update existing profile
      Object.assign(user.profile, updateData);
      return this.userProfileRepository.save(user.profile);
    }
  }

  // Invite-related queries moved to InviteModule

  async getUserUsage(
    userId: string,
    query: UsageQueryDto,
  ): Promise<UsageResponseDto[]> {
    const whereConditions: any = { userId };

    // Handle time-based filtering
    if (query.startDate && query.endDate) {
      whereConditions.executedAt = Between(
        new Date(query.startDate),
        new Date(query.endDate),
      );
    } else if (query.startDate) {
      whereConditions.executedAt = MoreThanOrEqual(new Date(query.startDate));
    } else if (query.endDate) {
      whereConditions.executedAt = LessThanOrEqual(new Date(query.endDate));
    }

    const usageRecords = await this.featureUsageRepository.find({
      where: whereConditions,
      order: { executedAt: 'DESC' },
    });

    return usageRecords.map((record) => ({
      id: record.id,
      feature: record.featureKey,
      timestamp: record.executedAt,
      creditsConsumed: record.creditsConsumed,
    }));
  }
}
