import { describe, it, expect } from 'vitest';
import {
  HistoricalPriceAggregator,
  PriceObservation,
} from '../src/historicalAggregator';

describe('HistoricalPriceAggregator SDK', () => {
  const baseTime = 1700000000;

  it('computes accurate TWAP over a sliding 1-hour window', () => {
    const observations: PriceObservation[] = [
      { price: 200, timestamp: baseTime - 3600 },
      { price: 220, timestamp: baseTime - 1800 },
      { price: 240, timestamp: baseTime - 600 },
    ];

    const result = HistoricalPriceAggregator.computeTwap(
      observations,
      3600,
      baseTime
    );

    expect(result.count).toBe(3);
    expect(result.minPrice).toBe(200);
    expect(result.maxPrice).toBe(240);
    // (200 * 1800 + 220 * 1200 + 240 * 600) / 3600 = (360000 + 264000 + 144000) / 3600 = 768000 / 3600 = 213.33 -> 213
    expect(result.twap).toBe(213);
  });

  it('returns single price when only one observation is within window', () => {
    const observations: PriceObservation[] = [
      { price: 350, timestamp: baseTime - 500 },
    ];
    const result = HistoricalPriceAggregator.computeTwap(
      observations,
      3600,
      baseTime
    );
    expect(result.twap).toBe(350);
    expect(result.count).toBe(1);
  });

  it('returns zero for an empty observation window', () => {
    const result = HistoricalPriceAggregator.computeTwap([], 3600, baseTime);
    expect(result.twap).toBe(0);
    expect(result.count).toBe(0);
  });

  it('computes exponential moving average (EMA) smoothing properly', () => {
    const prices = [100, 110, 120, 130];
    const ema = HistoricalPriceAggregator.computeEma(prices, 0.3);
    expect(ema).toBeGreaterThan(100);
    expect(ema).toBeLessThan(130);
  });

  it('filters out flash-loan / oracle manipulation price spikes', () => {
    const manipulatedSeries = [200, 202, 198, 201, 2000, 199, 203];
    const cleaned = HistoricalPriceAggregator.filterOutliers(manipulatedSeries);
    expect(cleaned).not.toContain(2000);
    expect(cleaned.length).toBe(6);
  });
});
