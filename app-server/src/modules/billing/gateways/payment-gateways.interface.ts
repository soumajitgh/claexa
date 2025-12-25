import { PaymentCurrency, PaymentOrder, User } from '@entities';

export type PaymentGatewayCreateOrderInput = {
  currencyAmount: number;
  creditAmount: number;
  currency: PaymentCurrency;
  user: User;
  metadata?: Record<string, unknown>;
};

export type PaymentGatewayCreateOrderResult = {
  order: PaymentOrder;
  clientResponse: unknown;
};

export type PaymentGatewayVerifyInput = {
  orderId: string;
  payload: unknown;
};

export interface IPaymentGateway {
  createOrder(
    input: PaymentGatewayCreateOrderInput,
  ): Promise<PaymentGatewayCreateOrderResult>;
  verifyPayment(input: PaymentGatewayVerifyInput): Promise<boolean>;
}
