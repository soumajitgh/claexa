import { User } from '@entities';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditService } from '../credit.service';
import { UserLoginEvent } from '../events/user-login.event';

@Injectable()
export class CreditRestorationListener {
  private readonly logger = new Logger(CreditRestorationListener.name);

  constructor(
    private readonly creditService: CreditService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @OnEvent('user.login')
  async handleUserLogin(event: UserLoginEvent) {
    this.logger.debug(
      `Processing login event for user ${event.userId} at ${event.loginTime}`,
    );

    try {
      const user = await this.userRepository.findOne({
        where: { id: event.userId },
        select: ['id', 'credits', 'lastCreditsUpdated'],
      });

      if (!user) {
        this.logger.warn(
          `User ${event.userId} not found for credit restoration`,
        );
        return;
      }

      const creditThreshold = this.configService.get<number>(
        'CREDIT_THRESHOLD',
        50,
      );
      const hoursSinceLastCreditUpdate = this.getHoursSinceLastCreditUpdate(
        user.lastCreditsUpdated,
      );

      // Check if user should get credit restoration
      if (hoursSinceLastCreditUpdate >= 24 && user.credits < creditThreshold) {
        const creditsToAdd = creditThreshold - user.credits;

        this.logger.log(
          `Restoring ${creditsToAdd} credits to user ${user.id} (last credit update: ${hoursSinceLastCreditUpdate.toFixed(1)}h ago, current credits: ${user.credits})`,
        );

        await this.creditService.modifyCredit({
          userId: user.id,
          amount: creditsToAdd,
          metadata: {
            type: 'credit_restoration',
            reason: 'inactive_user_restoration',
            hoursSinceLastCreditUpdate: Math.round(hoursSinceLastCreditUpdate),
            previousCredits: user.credits,
            creditThreshold,
          },
        });

        await this.userRepository.update(user.id, {
          lastCreditsUpdated: new Date(),
        });

        this.logger.log(`Successfully restored credits for user ${user.id}`);
      } else {
        this.logger.debug(
          `User ${user.id} does not qualify for credit restoration (last credit update: ${hoursSinceLastCreditUpdate.toFixed(1)}h ago, credits: ${user.credits}, threshold: ${creditThreshold})`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to process credit restoration for user ${event.userId}: ${error.message}`,
        error.stack,
      );
    }
  }

  private getHoursSinceLastCreditUpdate(
    lastCreditsUpdated: Date | null,
  ): number {
    if (!lastCreditsUpdated) {
      // If no previous credit update, consider it as a very long time ago
      return 999;
    }

    const now = new Date();
    const diffInMs = now.getTime() - lastCreditsUpdated.getTime();
    return diffInMs / (1000 * 60 * 60); // Convert to hours
  }
}
