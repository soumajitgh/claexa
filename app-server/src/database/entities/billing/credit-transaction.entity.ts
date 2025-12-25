import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FeatureUsage } from '../usage/usage.entity';
import { User } from '../user/user.entity';
import { PaymentOrder } from './payment-order.entity';

@Entity()
export class CreditTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn()
  user: User;

  @Column({ type: 'int' })
  amount: number;

  @ManyToOne(() => FeatureUsage, { nullable: true })
  @JoinColumn()
  relatedUsage?: FeatureUsage | null;

  @ManyToOne(() => PaymentOrder, { nullable: true })
  @JoinColumn()
  relatedPayment?: PaymentOrder | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
