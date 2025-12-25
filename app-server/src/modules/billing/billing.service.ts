import { PaymentCurrency, PaymentOrder, PaymentStatus, User } from '@entities';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreditService } from 'src/libs/credit/credit.service';
import { Repository } from 'typeorm';
import { IPaymentGateway } from './gateways/payment-gateways.interface';
import { CreditPackDto } from './interfaces/credit-packs.dto';
import { PackCatalogService } from './services/pack-catalog.service';
import { PricingService } from './services/pricing.service';
import { PAYMENT_GATEWAY } from './tokens';

@Injectable()
export class BillingService {
  constructor(
    private readonly packCatalogService: PackCatalogService,
    private readonly pricingService: PricingService,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGatewayService: IPaymentGateway,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(PaymentOrder)
    private readonly paymentOrderRepository: Repository<PaymentOrder>,
    private readonly creditService: CreditService,
  ) {}

  listPacks(): CreditPackDto[] {
    return this.packCatalogService.getAll();
  }

  async buyPack(input: {
    userId: string;
    packId: string;
    currency: PaymentCurrency;
    metadata?: Record<string, unknown>;
  }): Promise<any> {
    const pack = this.packCatalogService.findById(input.packId);
    if (!pack) {
      throw new NotFoundException('Pack not found');
    }

    const user = await this.userRepo.findOne({
      where: { id: input.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result = await this.paymentGatewayService.createOrder({
      currencyAmount: pack.price[input.currency],
      creditAmount: pack.credits,
      currency: input.currency,
      user,
      metadata: input.metadata,
    });

    return result.clientResponse;
  }

  async buyCustom(input: {
    userId: string;
    amount: number;
    currency: PaymentCurrency;
    metadata?: Record<string, unknown>;
  }): Promise<any> {
    const credits = this.pricingService.creditsForAmount(
      input.amount,
      input.currency,
    );

    const user = await this.userRepo.findOne({
      where: { id: input.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result = await this.paymentGatewayService.createOrder({
      currencyAmount: input.amount,
      creditAmount: credits,
      currency: input.currency,
      user,
      metadata: input.metadata,
    });

    return result.clientResponse;
  }

  async verifyAndCredit(
    orderId: string,
    userId: string,
    payload: unknown,
  ): Promise<void> {
    const result = await this.paymentGatewayService.verifyPayment({
      orderId,
      payload,
    });

    if (!result) {
      throw new BadRequestException('Payment verification failed');
    }

    const order = await this.paymentOrderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Order already completed');
    }

    if (order.status === PaymentStatus.FAILED) {
      throw new BadRequestException('Order failed');
    }

    await this.creditService.modifyCredit({
      userId,
      amount: order.creditAmount,
      relatedPayment: order,
    });
  }
}
