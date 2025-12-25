import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { DatabaseModule } from './database/database.module';
import { environmentValidationSchema } from './environment.schema';

import { HealthController } from './health.controller';

import { AiBridgeModule } from './libs/ai-bridge/ai-bridge.module';
import { AuthModule } from './libs/auth/auth.module';
import { AuthzModule } from './libs/authz/authz.module';
import { CreditModule } from './libs/credit/credit.module';
import { FirebaseModule } from './libs/firebase/firebase.module';
import { PosthogModule } from './libs/posthog/posthog.module';
import { UsageModule } from './libs/usage/usage.module';
import { AccountModule } from './modules/account/account.module';
import { BillingModule } from './modules/billing/billing.module';
import { InviteModule } from './modules/invite/invite.module';
import { MediaModule } from './modules/media/media.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { QuestionPaperModule } from './modules/question-paper/question-paper.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: ['.env'],
      expandVariables: true,
      validationSchema: environmentValidationSchema,
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    ScheduleModule.forRoot(),

    // LibraryModules
    AuthModule,
    FirebaseModule,
    PosthogModule,

    // Modules
    QuestionPaperModule,
    AccountModule,
    OrganizationModule,
    MediaModule,
    AiBridgeModule,
    InviteModule,
    BillingModule,
    CreditModule,
    UsageModule,
    AuthzModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
