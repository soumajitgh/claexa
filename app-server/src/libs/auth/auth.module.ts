import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user/user.entity';
import { Repository } from 'typeorm';
import { AccountModule } from '../../modules/account/account.module';
import { AccountService } from '../../modules/account/account.service';
import { CreditModule } from '../credit/credit.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { DevelopmentAuthService } from './development-auth.service';
import { FirebaseAuthHelper } from './firebase-auth-helper';
import { FirebaseTokenGuard } from './guards/firebase-token.guard';
import {
  AUTH_SERVICE_TOKEN,
  IAuthService,
} from './interfaces/auth-service.interface';
import { ProductionAuthService } from './production-auth.service';
import { FirebaseStrategy } from './strategies/firebase.strategy';

@Global()
@Module({
  imports: [
    FirebaseModule,
    AccountModule,
    ConfigModule,
    EventEmitterModule,
    CreditModule,
  ],
  providers: [
    {
      provide: AUTH_SERVICE_TOKEN,
      useFactory: (
        configService: ConfigService,
        firebaseAuthHelper: FirebaseAuthHelper,
        accountService: AccountService,
        eventEmitter: EventEmitter2,
        usersRepository: Repository<User>,
      ): IAuthService => {
        const nodeEnv = configService.get<string>('NODE_ENV');

        if (nodeEnv === 'development') {
          return new DevelopmentAuthService(
            accountService,
            configService,
            eventEmitter,
            usersRepository,
          );
        } else {
          return new ProductionAuthService(
            firebaseAuthHelper,
            accountService,
            configService,
            eventEmitter,
            usersRepository,
          );
        }
      },
      inject: [
        ConfigService,
        FirebaseAuthHelper,
        AccountService,
        EventEmitter2,
        getRepositoryToken(User),
      ],
    },
    FirebaseAuthHelper,
    FirebaseStrategy,
    FirebaseTokenGuard,
  ],
  exports: [
    AUTH_SERVICE_TOKEN,
    FirebaseAuthHelper,
    FirebaseStrategy,
    FirebaseTokenGuard,
  ],
})
export class AuthModule {}
