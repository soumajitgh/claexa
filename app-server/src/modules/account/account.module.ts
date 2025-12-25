import { Module } from '@nestjs/common';
import { CreditModule } from '../../libs/credit/credit.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [CreditModule],
  providers: [AccountService],
  exports: [AccountService],
  controllers: [AccountController],
})
export class AccountModule {}
