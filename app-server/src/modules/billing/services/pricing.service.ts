import { PaymentCurrency } from '@entities';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CREDIT_FACTOR_TOKEN } from '../tokens';

@Injectable()
export class PricingService {
  constructor(
    @Inject(CREDIT_FACTOR_TOKEN)
    private readonly factor: Record<PaymentCurrency, number>,
  ) {}

  creditsForAmount(amount: number, currency: PaymentCurrency): number {
    const f = this.factor[currency];
    if (!f || f <= 0) throw new BadRequestException('Pricing not set');
    return Math.floor(amount * f);
  }
}
