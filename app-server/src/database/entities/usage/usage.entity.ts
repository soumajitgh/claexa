import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FeatureKey } from '../../../libs/usage/feature/interfaces/feature-strategy.interface';

@Entity()
export class FeatureUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'varchar', nullable: true })
  organizationId?: string | null;

  @Column({ type: 'enum', enum: FeatureKey })
  featureKey: FeatureKey;

  @Column({ type: 'int', default: 0 })
  creditsConsumed: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  executedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
