# Usage Library

The Usage Library provides a comprehensive feature usage tracking and credit charging system for the application.

## Overview

This library tracks feature usage across the application and automatically handles credit deduction based on feature-specific costs. It supports both individual user usage and organization-scoped usage.

## Key Components

### UsageService

The main service for recording feature usage and managing credit charges.

**Main Method:**

```typescript
recordUsage(featureKey: FeatureKey, userId: string): Promise<FeatureUsage>
```

**Behavior:**

- Records feature usage in the database
- Calculates credit cost based on the feature strategy
- For organization users: Only records usage (no credit charge)
- For individual users: Charges credits and creates transaction record
- Updates user's credit balance

### Feature Factory System

Implements the Strategy pattern for feature-specific cost calculation:

- **FeatureFactory**: Routes feature keys to appropriate strategy implementations
- **FeatureKey**: Enum defining available features (currently `GENERATE_QUESTION_PAPER`)
- **IFeatureStrategy**: Interface for feature-specific cost calculation
- **GenerateQuestionPaperStrategy**: Costs 5 credits per usage

## Usage Example

```typescript
import { UsageService } from '@libs/usage';
import { FeatureKey } from '@libs/usage/feature';

// Inject the service
constructor(private readonly usageService: UsageService) {}

// Record usage when a feature is executed
async generateQuestionPaper(userId: string) {
  // ... feature logic ...

  // Record usage and charge credits
  const usage = await this.usageService.recordUsage(
    FeatureKey.GENERATE_QUESTION_PAPER,
    userId
  );

  return usage;
}
```

## Data Models

### FeatureUsage Entity

- `id`: Unique identifier
- `userId`: User who used the feature
- `organizationId`: Organization (if applicable)
- `featureKey`: Type of feature used
- `creditsConsumed`: Credits charged for this usage
- `metadata`: Additional context data
- `executedAt`: When the feature was used

## Adding New Features

1. Add new feature key to `FeatureKey` enum
2. Create strategy class implementing `IFeatureStrategy`
3. Add routing in `FeatureFactory.router()`
4. Register strategy in `UsageModule` providers

## Dependencies

- TypeORM repositories (User, FeatureUsage, CreditTransaction)
- Credit library for transaction management
- User and Organization entities

## Credit Handling

- **Individual Users**: Credits are deducted from user balance
- **Organization Users**: Usage is recorded but no credits are charged
- **Transactions**: All credit changes are tracked via CreditTransaction entity
