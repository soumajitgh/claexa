import { CreditTransaction, FeatureUsage, User } from '@entities';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureFactory } from './feature/feature.factory';
import { FeatureKey } from './feature/interfaces/feature-strategy.interface';

@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(
    @InjectRepository(FeatureUsage)
    private readonly usageRepo: Repository<FeatureUsage>,
    @InjectRepository(CreditTransaction)
    private readonly creditTransactionRepo: Repository<CreditTransaction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly featureFactory: FeatureFactory,
  ) {}

  async recordUsage(featureKey: FeatureKey, userId: string) {
    this.logger.debug(
      `Recording usage for feature: ${featureKey}, userId: ${userId}`,
    );

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: [
        'activeUserOrganization',
        'activeUserOrganization.organization',
      ],
    });

    if (!user) {
      this.logger.error(`User ${userId} not found`);
      throw new Error(`User ${userId} not found`);
    }

    const feature = this.featureFactory.getFeature(featureKey);
    const creditsToCharge = await feature.calculateCost();
    this.logger.debug(
      `Credits to charge for ${featureKey}: ${creditsToCharge}`,
    );

    const organizationId =
      user.activeUserOrganization?.organization?.id ?? null;

    const usage = this.usageRepo.create({
      userId: user.id,
      organizationId,
      featureKey,
      creditsConsumed: organizationId ? 0 : creditsToCharge,
    });
    const savedUsage = await this.usageRepo.save(usage);
    this.logger.debug(`Usage record created with id: ${savedUsage.id}`);

    if (organizationId) {
      // Organization-scoped usage: record only, no user charge
      this.logger.debug(
        `Organization usage - no charge for user ${userId}, org: ${organizationId}`,
      );
      return savedUsage;
    }

    // Individual user: charge credits and create a ledger entry
    const creditTransaction = new CreditTransaction();
    creditTransaction.user = user;
    creditTransaction.amount = -creditsToCharge; // negative for charge
    creditTransaction.relatedUsage = savedUsage;
    await this.creditTransactionRepo.save(creditTransaction);

    const previousCredits = user.credits ?? 0;
    user.credits = previousCredits - creditsToCharge;
    await this.userRepo.save(user);

    this.logger.debug(
      `User ${userId} charged ${creditsToCharge} credits. Previous: ${previousCredits}, New: ${user.credits}`,
    );

    return savedUsage;
  }

  /**
   * Check if user has sufficient credits for a feature
   */
  private async checkSufficientCredits(
    user: User,
    featureKey: FeatureKey,
    context?: Record<string, any>,
  ): Promise<boolean> {
    const feature = this.featureFactory.getFeature(featureKey);
    const requiredCredits = await feature.calculateCost(context);

    const userCredits = user.credits || 0;
    this.logger.debug(
      `Credit check for ${featureKey}: Required=${requiredCredits}, Available=${userCredits}`,
    );
    return userCredits >= requiredCredits;
  }

  /**
   * Get required credits for a feature
   */
  private async getRequiredCredits(
    featureKey: FeatureKey,
    context?: Record<string, any>,
  ): Promise<number> {
    const feature = this.featureFactory.getFeature(featureKey);
    const requiredCredits = await feature.calculateCost(context);
    this.logger.debug(`Required credits for ${featureKey}: ${requiredCredits}`);
    return requiredCredits;
  }

  /**
   * Validate user has sufficient credits, throw exception if not
   */
  async validateSufficientCredits(
    user: User,
    featureKey: FeatureKey,
    context?: Record<string, any>,
  ): Promise<void> {
    this.logger.debug(
      `Validating sufficient credits for user ${user.id}, feature: ${featureKey}`,
    );

    const hasCredits = await this.checkSufficientCredits(
      user,
      featureKey,
      context,
    );

    if (!hasCredits) {
      const requiredCredits = await this.getRequiredCredits(
        featureKey,
        context,
      );
      const userCredits = user.credits || 0;

      this.logger.warn(
        `Insufficient credits for user ${user.id}. Required: ${requiredCredits}, Available: ${userCredits}`,
      );

      throw new BadRequestException(
        `Insufficient credits. Required: ${requiredCredits}, Available: ${userCredits}`,
      );
    }

    this.logger.debug(`Credit validation passed for user ${user.id}`);
  }
}
