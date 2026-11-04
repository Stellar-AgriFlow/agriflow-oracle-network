import { describe, it, expect } from 'vitest';
import { HistoricalPriceAggregator } from '../src/historicalAggregator';

describe('HistoricalPriceAggregator.computeMaximumDrawdownAndCalmar', () => {
  it('correctly calculates maximum peak-to-trough drawdown and Calmar ratio', () => {
    // Price trajectory: Starts at 100, peaks at 150, crashes to 90 (-40% drawdown), then recovers to 180
    const prices = [100, 120, 150, 110, 90, 130, 160, 180];

    const result = HistoricalPriceAggregator.computeMaximumDrawdownAndCalmar(prices, 8); // 8 periods = 1 year

    expect(result.peakPrice).toBe(150);
    expect(result.troughPrice).toBe(90);
    expect(result.maxDrawdownPercent).toBe(40.0); // (150 - 90) / 150 = 40%
    expect(result.peakIndex).toBe(2);
    expect(result.troughIndex).toBe(4);
    expect(result.annualizedReturnPercent).toBeGreaterThan(0);
    expect(result.calmarRatio).toBeGreaterThan(0);
  });

  it('handles monotonic upwards trend with zero drawdown', () => {
    const prices = [100, 110, 120, 130, 140];
    const result = HistoricalPriceAggregator.computeMaximumDrawdownAndCalmar(prices);

    expect(result.maxDrawdownPercent).toBe(0);
    expect(result.calmarRatio).toBe(0);
  });
});
