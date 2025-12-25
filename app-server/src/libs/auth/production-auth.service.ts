import { User } from '@entities';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLoginEvent } from '../../libs/credit/events/user-login.event';
import { AccountService } from '../../modules/account/account.service';
import { FirebaseAuthHelper } from './firebase-auth-helper';
import { IAuthService } from './interfaces/auth-service.interface';

@Injectable()
export class ProductionAuthService implements IAuthService {
  private readonly logger = new Logger(ProductionAuthService.name);

  constructor(
    private firebaseAuthHelper: FirebaseAuthHelper,
    private accountService: AccountService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async verifyIdToken(token: string): Promise<User> {
    try {
      // Verify token with Firebase
      const decodedToken = await this.firebaseAuthHelper.verifyToken(token);

      this.logger.log(`Token verified for user: ${decodedToken.uid}`);

      // Check if user exists in database
      let user = await this.usersRepository.findOne({
        where: {
          firebaseUid: decodedToken.uid,
        },
        relations: ['profile'],
      });

      if (!user) {
        // User doesn't exist in DB, create new user
        this.logger.log(
          `Creating new user for Firebase UID: ${decodedToken.uid}`,
        );

        const initialCredits = this.configService.get<number>(
          'INITIAL_CREDIT_AMOUNT',
          100,
        );

        user = await this.accountService.create(
          {
            firebaseUid: decodedToken.uid,
            email: decodedToken.email || '',
            profile: {
              fullName: decodedToken.name || '',
              avatarUrl: decodedToken.picture || '',
            },
          },
          initialCredits,
        );

        this.logger.log(
          `New user created with ID: ${user.id} and ${initialCredits} initial credits`,
        );
      }

      // Emit login event for non-blocking credit restoration processing
      this.eventEmitter.emit(
        'user.login',
        new UserLoginEvent(user.id, new Date()),
      );

      return user;
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      throw new ForbiddenException('Invalid token');
    }
  }
}
