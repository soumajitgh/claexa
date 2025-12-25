import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CreditModule } from 'src/libs/credit/credit.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { CashFreePaymentGatewayService } from './gateways/cashfree-payment-gateway.service';
import { IPaymentGateway } from './gateways/payment-gateways.interface';
import { CreditPackDto } from './interfaces/credit-packs.dto';
import { PackCatalogService } from './services/pack-catalog.service';
import { PricingService } from './services/pricing.service';
import { CREDIT_FACTOR_TOKEN, PACKS_TOKEN, PAYMENT_GATEWAY } from './tokens';

@Module({
  imports: [ConfigModule, CreditModule],
  controllers: [BillingController],
  providers: [
    // Core services
    BillingService,
    PackCatalogService,
    PricingService,

    // Tokens and values
    {
      provide: PACKS_TOKEN,
      useValue: [
        {
          id: 'starter',
          name: 'Starter',
          credits: 100,
          price: { INR: 99, USD: 2 },
        },
        { id: 'pro', name: 'Pro', credits: 600, price: { INR: 499, USD: 8 } },
        {
          id: 'scale',
          name: 'Scale',
          credits: 1500,
          price: { INR: 999, USD: 15 },
        },
      ] as CreditPackDto[],
    },
    {
      provide: CREDIT_FACTOR_TOKEN,
      useValue: { INR: 1, USD: 10 },
    },

    // Payment gateway
    CashFreePaymentGatewayService,
    {
      provide: PAYMENT_GATEWAY,
      useExisting: CashFreePaymentGatewayService as unknown as IPaymentGateway,
    },
  ],
  exports: [BillingService],
})
export class BillingModule {}
