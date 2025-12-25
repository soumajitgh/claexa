import { Injectable } from '@nestjs/common';
import {
  FeatureKey,
  IFeatureStrategy,
} from './interfaces/feature-strategy.interface';
import { GenerateImageStrategy } from './strategies/generate-image.strategy';
import { GenerateQuestionPaperWithAiStrategy } from './strategies/generate-question-paper-with-ai.strategy';

@Injectable()
export class FeatureFactory {
  constructor() {}

  getFeature(featureKey: FeatureKey): IFeatureStrategy {
    return this.router(featureKey);
  }

  protected router(featureKey: FeatureKey): IFeatureStrategy {
    switch (featureKey) {
      case FeatureKey.GENERATE_QUESTION_PAPER_WITH_AI:
        return new GenerateQuestionPaperWithAiStrategy();
      case FeatureKey.GENERATE_IMAGE:
        return new GenerateImageStrategy();
      default:
        throw new Error(`Feature ${featureKey} not found`);
    }
  }
}
