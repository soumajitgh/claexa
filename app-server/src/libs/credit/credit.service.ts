import { CreditTransaction, FeatureUsage, PaymentOrder, User } from '@entities';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CreditService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(CreditTransaction)
    private readonly creditTransactionRepo: Repository<CreditTransaction>,
  ) {}

  async modifyCredit(input: {
    userId: string;
    amount: number;
    relatedUsage?: FeatureUsage;
    relatedPayment?: PaymentOrder;
    metadata?: Record<string, unknown>;
  }): Promise<CreditTransaction> {
    const user = await this.userRepo.findOne({
      where: { id: input.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentCredits = user.credits;

    const newCredits = currentCredits + input.amount;

    if (newCredits < 0) {
      throw new BadRequestException('Insufficient credits');
    }

    const creditTransaction = this.creditTransactionRepo.create({
      ...input,
      user,
    });

    await this.userRepo.update(input.userId, {
      credits: newCredits,
    });

    return this.creditTransactionRepo.save(creditTransaction);
  }
}
