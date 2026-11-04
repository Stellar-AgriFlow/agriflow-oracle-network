import { describe, it, expect } from 'vitest';
import { HistoricalPriceAggregator } from '../src/historicalAggregator';

describe('RiskMetrics EWMA Volatility Forecasting', () => {
  it('computes positive conditional variance and annualized volatility for realistic commodity prices', () => {
    // 7 days of commodity price movements
    const prices = [200, 204, 202, 208, 205, 212, 210];
    const res = HistoricalPriceAggregator.computeEwmaVolatility(prices, 0.94);

    expect(res.variance).toBeGreaterThan(0);
    expect(res.annualizedVolatilityPercent).toBeGreaterThan(10);
    expect(res.annualizedVolatilityPercent).toBeLessThan(100);
  });

  it('computes 0 volatility for completely flat price series', () => {
    const flat = [150, 150, 150, 150, 150];
    const res = HistoricalPriceAggregator.computeEwmaVolatility(flat);

    expect(res.variance).toBe(0);
    expect(res.annualizedVolatilityPercent).toBe(0);
  });

  it('handles short or empty series gracefully with zeros', () => {
    expect(HistoricalPriceAggregator.computeEwmaVolatility([]).annualizedVolatilityPercent).toBe(0);
    expect(HistoricalPriceAggregator.computeEwmaVolatility([100]).annualizedVolatilityPercent).toBe(0);
  });

  it('reports higher volatility for wider price fluctuations', () => {
    const calm = [200, 201, 200, 201, 202];
    const volatile = [200, 230, 180, 240, 170];

    const resCalm = HistoricalPriceAggregator.computeEwmaVolatility(calm);
    const resVolatile = HistoricalPriceAggregator.computeEwmaVolatility(volatile);

    expect(resVolatile.annualizedVolatilityPercent).toBeGreaterThan(
      resCalm.annualizedVolatilityPercent
    );
  });
});
