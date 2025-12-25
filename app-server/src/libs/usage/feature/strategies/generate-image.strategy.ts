import {
  FeatureConfig,
  FeatureKey,
  IFeatureStrategy,
} from '../interfaces/feature-strategy.interface';

export class GenerateImageStrategy implements IFeatureStrategy {
  calculateCost(context?: Record<string, any>): Promise<number> {
    // 2 credits per image
    return Promise.resolve(2);
  }

  getConfig(): FeatureConfig {
    return {
      key: FeatureKey.GENERATE_IMAGE,
      name: 'Generate Image',
    };
  }
}
