import {
  FeatureConfig,
  FeatureKey,
  IFeatureStrategy,
} from '../interfaces/feature-strategy.interface';

export class GenerateQuestionPaperWithAiStrategy implements IFeatureStrategy {
  calculateCost(context?: Record<string, any>): Promise<number> {
    // Base cost for AI generation
    let cost = 10;

    // Add cost for each image generated
    const imageCount = context?.imageCount || 0;
    cost += imageCount * 2; // 2 credits per image

    return Promise.resolve(cost);
  }

  getConfig(): FeatureConfig {
    return {
      key: FeatureKey.GENERATE_QUESTION_PAPER_WITH_AI,
      name: 'Generate Question Paper with AI',
    };
  }
}
