import { User } from '@entities';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountService } from '../../modules/account/account.service';
import { IAuthService } from './interfaces/auth-service.interface';

@Injectable()
export class DevelopmentAuthService implements IAuthService {
  private readonly logger = new Logger(DevelopmentAuthService.name);

  // Fixed development user credentials
  private readonly DEV_FIREBASE_UID = 'dev-user-123';
  private readonly DEV_EMAIL = 'dev@example.com';
  private readonly DEV_FULL_NAME = 'Development User';
  private readonly DEV_AVATAR_URL =
    'https://via.placeholder.com/150?text=Dev+User';

  constructor(
    private accountService: AccountService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async verifyIdToken(token: string): Promise<User> {
    this.logger.log(
      `Development mode: Ignoring token validation for token: ${token?.substring(0, 10)}...`,
    );

    // Check if development user already exists
    let user = await this.usersRepository.findOne({
      where: {
        firebaseUid: this.DEV_FIREBASE_UID,
      },
      relations: ['profile'],
    });

    if (!user) {
      // Create development user if it doesn't exist
      this.logger.log(
        `Creating development user with UID: ${this.DEV_FIREBASE_UID}`,
      );

      const initialCredits = this.configService.get<number>(
        'INITIAL_CREDIT_AMOUNT',
        100,
      );

      user = await this.accountService.create(
        {
          firebaseUid: this.DEV_FIREBASE_UID,
          email: this.DEV_EMAIL,
          profile: {
            fullName: this.DEV_FULL_NAME,
            avatarUrl: this.DEV_AVATAR_URL,
          },
        },
        100000000,
      );

      this.logger.log(
        `Development user created with ID: ${user.id} and ${initialCredits} initial credits`,
      );
    } else {
      this.logger.log(`Using existing development user with ID: ${user.id}`);
    }

    return user;
  }
}
