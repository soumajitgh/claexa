export enum FeatureKey {
  GENERATE_QUESTION_PAPER = 'GENERATE_QUESTION_PAPER',
  GENERATE_QUESTION_PAPER_WITH_AI = 'GENERATE_QUESTION_PAPER_WITH_AI',
  GENERATE_IMAGE = 'GENERATE_IMAGE',
}

export interface FeatureConfig {
  key: FeatureKey;
  name: string;
}

export interface IFeatureStrategy {
  /**
   * Get the feature configuration
   */
  getConfig(): FeatureConfig;

  /**
   * Calculate the credit cost for this feature execution
   */
  calculateCost(context?: Record<string, any>): Promise<number>;
}
