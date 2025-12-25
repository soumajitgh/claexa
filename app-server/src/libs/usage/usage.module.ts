import { CreditTransaction, FeatureUsage, User } from '@entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureFactory } from './feature/feature.factory';
import { GenerateImageStrategy } from './feature/strategies/generate-image.strategy';
import { GenerateQuestionPaperWithAiStrategy } from './feature/strategies/generate-question-paper-with-ai.strategy';
import { UsageService } from './usage.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureUsage, CreditTransaction, User])],
  providers: [
    UsageService,
    FeatureFactory,
    GenerateQuestionPaperWithAiStrategy,
    GenerateImageStrategy,
  ],
  exports: [UsageService],
})
export class UsageModule {}
