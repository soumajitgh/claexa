import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfigFactory } from '../config/database.config';
import { CreditTransaction } from './entities/billing/credit-transaction.entity';
import { PaymentOrder } from './entities/billing/payment-order.entity';
import { Media } from './entities/media/media.entity';
import { QuestionImage } from './entities/media/question-image.entity';
import { OrganizationInvite } from './entities/organization/organization-invite.entity';
import { Organization } from './entities/organization/organization.entity';
import { UserOrganization } from './entities/organization/user-organization.entity';
import { Option } from './entities/question-paper/option.entity';
import { QuestionPaper } from './entities/question-paper/question-paper.entity';
import { Question } from './entities/question-paper/question.entity';
import { SubQuestion } from './entities/question-paper/sub-question.entity';
import { FeatureUsage } from './entities/usage/usage.entity';
import { UserProfile } from './entities/user/user-profile.entity';
import { User } from './entities/user/user.entity';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfigFactory,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      // Billing
      CreditTransaction,
      PaymentOrder,
      // Media
      Media,
      QuestionImage,
      // Organization
      Organization,
      OrganizationInvite,
      UserOrganization,
      // Question Paper
      QuestionPaper,
      Question,
      Option,
      SubQuestion,
      // Usage
      FeatureUsage,
      // User
      User,
      UserProfile,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
