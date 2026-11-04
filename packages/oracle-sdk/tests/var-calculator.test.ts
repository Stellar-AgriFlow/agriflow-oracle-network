import { describe, it, expect } from 'vitest';
import { HistoricalPriceAggregator } from '../src/historicalAggregator';

describe('HistoricalPriceAggregator.computeValueAtRisk', () => {
  it('computes 95% Historical VaR and CVaR for volatile series', () => {
    // Simulated series with occasional downward shocks
    const prices = [
      100, 102, 101, 99, 98, 92, 94, 96, 95, 85, // 85 is -10.5% drop
      88, 89, 91, 90, 89, 87, 86, 88, 90, 89,
    ];

    const risk = HistoricalPriceAggregator.computeValueAtRisk(prices, 0.95, 50000);

    expect(risk.varPercent).toBeGreaterThan(0);
    expect(risk.cvarPercent).toBeGreaterThanOrEqual(risk.varPercent); // CVaR is always >= VaR
    expect(risk.varAmountUsd).toBeGreaterThan(0);
    expect(risk.cvarAmountUsd).toBeGreaterThanOrEqual(risk.varAmountUsd);
    expect(risk.observationsCount).toBe(19);
  });

  it('returns zero risk metrics for insufficient data', () => {
    const risk = HistoricalPriceAggregator.computeValueAtRisk([100, 101]);
    expect(risk.varPercent).toBe(0);
    expect(risk.cvarPercent).toBe(0);
  });
});
