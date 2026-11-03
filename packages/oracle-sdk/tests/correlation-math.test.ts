import { describe, it, expect } from 'vitest';
import { HistoricalPriceAggregator } from '../src/historicalAggregator';

describe('Cross-Commodity Pearson Correlation Analysis', () => {
  it('computes perfect +1.0 correlation for co-moving commodity prices', () => {
    const wheat = [200, 210, 220, 230, 240];
    const maize = [100, 105, 110, 115, 120];

    const r = HistoricalPriceAggregator.computePearsonCorrelation(wheat, maize);
    expect(r).toBe(1);
  });

  it('computes perfect -1.0 correlation for inversely moving commodities', () => {
    const seriesA = [10, 20, 30, 40, 50];
    const seriesB = [50, 40, 30, 20, 10];

    const r = HistoricalPriceAggregator.computePearsonCorrelation(seriesA, seriesB);
    expect(r).toBe(-1);
  });

  it('computes realistic positive correlation for real-world agricultural prices', () => {
    const wheat = [210, 215, 212, 225, 230, 228];
    const barley = [180, 185, 181, 192, 198, 194];

    const r = HistoricalPriceAggregator.computePearsonCorrelation(wheat, barley);
    expect(r).toBeGreaterThan(0.9);
    expect(r).toBeLessThanOrEqual(1.0);
  });

  it('returns 0 for constant/flat series with zero variance', () => {
    const flat = [100, 100, 100, 100];
    const variable = [10, 20, 30, 40];

    const r = HistoricalPriceAggregator.computePearsonCorrelation(flat, variable);
    expect(r).toBe(0);
  });

  it('returns 0 for short or empty series (< 2 observations)', () => {
    expect(HistoricalPriceAggregator.computePearsonCorrelation([], [])).toBe(0);
    expect(HistoricalPriceAggregator.computePearsonCorrelation([10], [20])).toBe(0);
  });
});
