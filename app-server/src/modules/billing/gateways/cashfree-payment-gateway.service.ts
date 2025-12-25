import { PaymentOrder, PaymentProvider, PaymentStatus } from '@entities';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Cashfree, CFEnvironment, CreateOrderRequest } from 'cashfree-pg';
import { plainToInstance } from 'class-transformer';
import { IsPhoneNumber, validateSync } from 'class-validator';
import { Repository } from 'typeorm';
import {
  IPaymentGateway,
  PaymentGatewayCreateOrderInput,
  PaymentGatewayCreateOrderResult,
} from './payment-gateways.interface';

class CashfreeCreateOrderMetadata {
  @IsPhoneNumber()
  phone: string;
}

@Injectable()
export class CashFreePaymentGatewayService
  implements IPaymentGateway, OnModuleInit
{
  cashfree: Cashfree;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(PaymentOrder)
    private readonly paymentOrderRepository: Repository<PaymentOrder>,
  ) {}

  onModuleInit() {
    this.cashfree = new Cashfree(
      this.configService.get<string>('NODE_ENV') === 'production'
        ? CFEnvironment.PRODUCTION
        : CFEnvironment.SANDBOX,
      this.configService.get<string>('CASHFREE_APP_ID'),
      this.configService.get<string>('CASHFREE_SECRET_KEY'),
    );
  }

  async createOrder(
    input: PaymentGatewayCreateOrderInput,
  ): Promise<PaymentGatewayCreateOrderResult> {
    if (!input.metadata) {
      throw new BadRequestException('Metadata is required');
    }

    const metadata = plainToInstance(
      CashfreeCreateOrderMetadata,
      input.metadata,
    );

    const errors = validateSync(metadata);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const request: CreateOrderRequest = {
      order_amount: input.currencyAmount,
      order_currency: input.currency,
      customer_details: {
        customer_id: input.user.id,
        customer_name: input.user.profile.fullName,
        customer_email: input.user.email,
        customer_phone: metadata.phone,
      },
    };

    const response = await this.cashfree.PGCreateOrder(request);

    const paymentOrder = this.paymentOrderRepository.create({
      provider: PaymentProvider.CASHFREE,
      currencyAmount: input.currencyAmount,
      currency: input.currency,
      creditAmount: input.creditAmount,
      providerData: response.data as Record<string, unknown>,
      status: PaymentStatus.PENDING,
    });

    const savedPaymentOrder =
      await this.paymentOrderRepository.save(paymentOrder);

    return {
      order: savedPaymentOrder,
      clientResponse: {
        orderId: savedPaymentOrder.id,
        paymentSessionId: (response.data as any).payment_session_id,
      },
    };
  }

  async verifyPayment(input: {
    orderId: string;
    payload: unknown;
  }): Promise<boolean> {
    const order = await this.paymentOrderRepository.findOne({
      where: { id: input.orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const response = await this.cashfree.PGFetchOrder(input.orderId);

    if (response.data.order_status === 'PAID') {
      await this.paymentOrderRepository.update(input.orderId, {
        status: PaymentStatus.COMPLETED,
      });

      return true;
    }

    if (response.data.order_status === 'FAILED') {
      await this.paymentOrderRepository.update(input.orderId, {
        status: PaymentStatus.FAILED,
      });
    }

    return false;
  }
}
