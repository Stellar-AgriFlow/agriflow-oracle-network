import { describe, it, expect } from 'vitest';
import { HistoricalPriceAggregator } from '../src/historicalAggregator';

describe('HistoricalPriceAggregator.computeSeasonalIndex', () => {
  it('computes 4-quarter agricultural seasonal index and detects peak/trough', () => {
    // Simulated quarterly wheat prices across 2 years (Q1=Lean season, Q3=Harvest glut)
    const observations = [
      { period: 1, price: 120 }, // Year 1 Q1
      { period: 2, price: 105 }, // Year 1 Q2
      { period: 3, price: 80 },  // Year 1 Q3 (harvest)
      { period: 4, price: 95 },  // Year 1 Q4
      { period: 1, price: 125 }, // Year 2 Q1
      { period: 2, price: 110 }, // Year 2 Q2
      { period: 3, price: 85 },  // Year 2 Q3 (harvest)
      { period: 4, price: 100 }, // Year 2 Q4
    ];

    const result = HistoricalPriceAggregator.computeSeasonalIndex(observations);

    expect(result.peakPeriod).toBe(1); // Q1 is peak (lean season highest prices)
    expect(result.troughPeriod).toBe(3); // Q3 is trough (harvest season lowest prices)
    expect(result.periodIndices[1]).toBeGreaterThan(100);
    expect(result.periodIndices[3]).toBeLessThan(100);
    expect(result.seasonalityAmplitudePercent).toBeGreaterThan(30);
  });

  it('handles empty observations gracefully', () => {
    const result = HistoricalPriceAggregator.computeSeasonalIndex([]);
    expect(result.peakPeriod).toBe(0);
    expect(result.seasonalityAmplitudePercent).toBe(0);
  });
});
