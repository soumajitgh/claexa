# Credit Library

The Credit Library provides a robust credit management system for handling user credit transactions, purchases, and balance modifications.

## Overview

This library manages user credit balances and provides a transactional system for credit operations including charges, purchases, and refunds. It ensures data consistency and provides audit trails for all credit-related activities.

## Key Components

### CreditService

The main service for managing credit operations and transactions.

**Main Method:**

```typescript
modifyCredit(input: {
  userId: string;
  amount: number;
  relatedUsage?: FeatureUsage;
  relatedPayment?: PaymentOrder;
  metadata?: Record<string, unknown>;
}): Promise<CreditTransaction>
```

**Behavior:**

- Validates user existence
- Checks for sufficient credits (prevents negative balances)
- Creates credit transaction record
- Updates user's credit balance atomically
- Returns transaction record for audit purposes

## Usage Examples

### Adding Credits (Purchase/Refund)

```typescript
import { CreditService } from '@libs/credit';

constructor(private readonly creditService: CreditService) {}

// Add credits after successful payment
async processPayment(userId: string, paymentOrder: PaymentOrder) {
  const transaction = await this.creditService.modifyCredit({
    userId,
    amount: paymentOrder.creditAmount, // positive amount
    relatedPayment: paymentOrder,
    metadata: { source: 'payment', provider: paymentOrder.provider }
  });

  return transaction;
}
```

### Deducting Credits (Feature Usage)

```typescript
// Deduct credits for feature usage
async chargeForFeature(userId: string, usage: FeatureUsage) {
  const transaction = await this.creditService.modifyCredit({
    userId,
    amount: -usage.creditsConsumed, // negative amount
    relatedUsage: usage,
    metadata: { feature: usage.featureKey }
  });

  return transaction;
}
```

### Manual Credit Adjustment

```typescript
// Admin credit adjustment
async adjustUserCredits(userId: string, adjustmentAmount: number, reason: string) {
  const transaction = await this.creditService.modifyCredit({
    userId,
    amount: adjustmentAmount,
    metadata: {
      reason,
      type: 'manual_adjustment',
      adminId: currentAdminId
    }
  });

  return transaction;
}
```

## Data Models

### CreditTransaction Entity

- `id`: Unique transaction identifier
- `user`: User associated with the transaction
- `amount`: Credit amount (positive for addition, negative for deduction)
- `relatedUsage`: Optional link to feature usage
- `relatedPayment`: Optional link to payment order
- `metadata`: Additional transaction context
- `createdAt`: Transaction timestamp

### User Entity (Credit Field)

- `credits`: Current credit balance (integer)

## Error Handling

- **NotFoundException**: Thrown when user doesn't exist
- **BadRequestException**: Thrown when operation would result in negative balance

## Transaction Safety

The service ensures atomic operations:

1. Validates user exists
2. Checks sufficient balance
3. Creates transaction record
4. Updates user balance
5. Returns transaction for confirmation

All operations are wrapped in database transactions to ensure consistency.

## Integration Points

- **Usage Library**: Credits are automatically deducted when features are used
- **Payment System**: Credits are added when payments are processed
- **Account Module**: Provides user management capabilities
- **Auth System**: Emits login events for credit restoration processing

## Dependencies

- TypeORM repositories (User, CreditTransaction)
- FeatureUsage entity (from usage library)
- PaymentOrder entity (from billing system)
- EventEmitter2 for non-blocking credit restoration

## Automatic Credit Restoration

The library includes an event-driven credit restoration system that automatically restores credits for inactive users:

### How it Works

1. **Login Event**: When users log in, a `user.login` event is emitted
2. **Non-blocking Processing**: The `CreditRestorationListener` processes events asynchronously
3. **Restoration Logic**: Credits are restored if:
   - User hasn't logged in for more than 24 hours
   - Current credits are below the `CREDIT_THRESHOLD` (default: 50)
4. **Transaction Tracking**: All restorations are recorded with detailed metadata

### Configuration

- `CREDIT_THRESHOLD`: Minimum credit amount to maintain (default: 50)
- `INITIAL_CREDIT_AMOUNT`: Credits given to new users (default: 100)

### Event Flow

```text
User Login → Update lastLoginAt → Emit user.login event →
CreditRestorationListener → Check conditions → Restore credits if needed
```

## Best Practices

1. **Always use negative amounts** for deductions to maintain clarity
2. **Include meaningful metadata** for audit trails
3. **Link transactions** to related usage or payments when applicable
4. **Handle errors appropriately** - check for user existence and sufficient credits
5. **Use the returned transaction** for confirmation and logging
6. **Monitor restoration logs** to track automatic credit adjustments
