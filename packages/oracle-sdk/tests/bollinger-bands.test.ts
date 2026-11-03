import { describe, it, expect } from 'vitest';
import { HistoricalPriceAggregator } from '../src/historicalAggregator';

describe('Bollinger Bands Commodity Volatility Metrics', () => {
  it('computes accurate SMA, bands, and standard deviation for price series', () => {
    // 5 observations around mean 200
    const series = [190, 195, 200, 205, 210];
    const bands = HistoricalPriceAggregator.computeBollingerBands(series, 2);

    expect(bands.sma).toBe(200);
    expect(bands.standardDeviation).toBe(7.91);
    expect(bands.upperBand).toBe(216); // 200 + 2 * 7.91 = 215.82 -> 216
    expect(bands.lowerBand).toBe(184); // 200 - 2 * 7.91 = 184.18 -> 184
    expect(bands.bandwidthPercent).toBeGreaterThan(15);
  });

  it('handles zero-volatility series where all prices are identical', () => {
    const flat = [250, 250, 250, 250];
    const bands = HistoricalPriceAggregator.computeBollingerBands(flat, 2);

    expect(bands.sma).toBe(250);
    expect(bands.standardDeviation).toBe(0);
    expect(bands.upperBand).toBe(250);
    expect(bands.lowerBand).toBe(250);
    expect(bands.bandwidthPercent).toBe(0);
  });

  it('handles empty series gracefully with zeros', () => {
    const empty = HistoricalPriceAggregator.computeBollingerBands([]);
    expect(empty.sma).toBe(0);
    expect(empty.upperBand).toBe(0);
    expect(empty.lowerBand).toBe(0);
    expect(empty.standardDeviation).toBe(0);
  });
});
