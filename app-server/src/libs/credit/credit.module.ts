// No entity imports needed; repositories are provided globally by DatabaseModule
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CreditService } from './credit.service';
import { CreditRestorationListener } from './listeners/credit-restoration.listener';

@Module({
  imports: [ConfigModule],
  providers: [CreditService, CreditRestorationListener],
  exports: [CreditService],
})
export class CreditModule {}
