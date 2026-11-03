import { describe, it, expect } from 'vitest';
import { HistoricalPriceAggregator } from '../src/historicalAggregator';

describe('Median Absolute Deviation (MAD) Outlier Filter', () => {
  it('detects and eliminates extreme upward price manipulation spikes', () => {
    const rawPrices = [200, 202, 198, 205, 199, 201, 204, 5000, 203, 197];
    const cleaned = HistoricalPriceAggregator.filterOutliersMad(rawPrices, 3.0);

    expect(cleaned).not.toContain(5000);
    expect(cleaned.length).toBe(9);
  });

  it('detects and eliminates flash-drop / flash-crash outliers', () => {
    const rawPrices = [210, 212, 209, 215, 208, 1, 214, 211];
    const cleaned = HistoricalPriceAggregator.filterOutliersMad(rawPrices, 3.0);

    expect(cleaned).not.toContain(1);
    expect(cleaned.length).toBe(7);
  });

  it('preserves all genuine market observations in normal commodity series', () => {
    const normalSeries = [100, 102, 98, 105, 101, 99, 103];
    const cleaned = HistoricalPriceAggregator.filterOutliersMad(normalSeries, 3.0);

    expect(cleaned.length).toBe(normalSeries.length);
  });

  it('handles flat zero-MAD series and short arrays without error', () => {
    const flat = [150, 150, 150, 150];
    const cleanedFlat = HistoricalPriceAggregator.filterOutliersMad(flat);
    expect(cleanedFlat.length).toBe(4);

    const short = [100, 200];
    const cleanedShort = HistoricalPriceAggregator.filterOutliersMad(short);
    expect(cleanedShort.length).toBe(2);
  });
});
