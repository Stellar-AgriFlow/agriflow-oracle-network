import { describe, it, expect } from 'vitest';
import { DynamicFeeEscalator } from '../src/stellar/feeEscalator';

describe('DynamicFeeEscalator', () => {
  const escalator = new DynamicFeeEscalator({
    baseFeeStroops: 100,
    maxFeeStroops: 1000000,
    surgeMultiplier: 1.5,
  });

  it('returns base fee for zero retries and normal uncongested ledger', () => {
    const fee = escalator.calculateFee(0, 0.2);
    expect(fee).toBe(100);
  });

  it('escalates fee with consecutive retry attempts', () => {
    // 100 * 1.5^1 = 150
    expect(escalator.calculateFee(1, 0.2)).toBe(150);
    // 100 * 1.5^2 = 225
    expect(escalator.calculateFee(2, 0.2)).toBe(225);
  });

  it('applies congestion multiplier when ledger capacity exceeds 70%', () => {
    // congestionRatio 0.9 => congestionFactor = 1 + (0.9 - 0.7) * 3 = 1 + 0.6 = 1.6
    // fee = 100 * 1.6 = 160
    const fee = escalator.calculateFee(0, 0.9);
    expect(fee).toBe(160);
  });

  it('strictly caps fee at maximum safety ceiling', () => {
    const hugeRetryFee = escalator.calculateFee(50, 0.95);
    expect(hugeRetryFee).toBe(1000000);
    expect(escalator.isFeeWithinBudget(hugeRetryFee)).toBe(true);
    expect(escalator.isFeeWithinBudget(1000001)).toBe(false);
  });
});
