import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentProvider {
  CASHFREE = 'cashfree',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum PaymentCurrency {
  INR = 'INR',
  USD = 'USD',
}

@Entity()
export class PaymentOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PaymentProvider })
  provider: PaymentProvider;

  @Column({ type: 'int' })
  currencyAmount: number;

  @Column({ type: 'enum', enum: PaymentCurrency })
  currency: PaymentCurrency;

  @Column({ type: 'int' })
  creditAmount: number;

  @Column({ type: 'jsonb', nullable: false })
  providerData: Record<string, unknown>;

  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
