import { describe, it, expect } from 'vitest';
import { HistoricalPriceAggregator } from '../src/historicalAggregator';

describe('HistoricalPriceAggregator.computeSharpeAndSortino', () => {
  it('computes Sharpe and Sortino ratios correctly for positive skewed agricultural yields', () => {
    // Mostly steady small gains with one big positive jump and minimal downside
    const returns = [
      0.002, 0.003, -0.001, 0.004, 0.001,
      0.002, -0.002, 0.015, 0.003, 0.002,
    ];

    const metrics = HistoricalPriceAggregator.computeSharpeAndSortino(
      returns,
      4.0, // 4% risk-free
      0.0, // 0% target return
      252
    );

    expect(metrics.annualizedReturnPercent).toBeGreaterThan(0);
    expect(metrics.annualizedVolatilityPercent).toBeGreaterThan(0);
    expect(metrics.downsideDeviationPercent).toBeGreaterThan(0);
    // When upside volatility dominates, Sortino ratio is significantly higher than Sharpe ratio
    expect(metrics.sortinoRatio).toBeGreaterThan(metrics.sharpeRatio);
  });

  it('handles empty returns array without division by zero', () => {
    const metrics = HistoricalPriceAggregator.computeSharpeAndSortino([]);
    expect(metrics.sharpeRatio).toBe(0);
    expect(metrics.sortinoRatio).toBe(0);
  });
});
