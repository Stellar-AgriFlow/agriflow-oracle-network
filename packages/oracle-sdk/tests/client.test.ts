import { describe, it, expect } from 'vitest';
import { AgriOracleClient, OracleConsensusUtils } from '../src';

describe('AgriOracleClient & Consensus Utilities', () => {
  const client = new AgriOracleClient();

  it('queries commodity price feed and validates formatted output', async () => {
    const feed = await client.getCommodityPrice('WHEAT');

    expect(feed.commodity).toBe('WHEAT');
    expect(feed.price).toBe(588);
    expect(feed.formattedPrice).toBe('$5.88');
    expect(feed.isStale).toBe(false);
    expect(AgriOracleClient.isPriceFresh(feed, 3600)).toBe(true);
  });

  it('evaluates parametric drought trigger properly', async () => {
    // NG_KANO has droughtIndex 78
    const triggered = await client.evaluateInsuranceTrigger('NG_KANO', 75);
    expect(triggered).toBe(true);

    const notTriggered = await client.evaluateInsuranceTrigger('KE_RIFT', 75);
    expect(notTriggered).toBe(false);
  });

  it('evaluates parametric flood trigger properly', async () => {
    // BR_MATO_GROSSO has rainfall 160 mm
    const floodTriggered = await client.evaluateFloodTrigger('BR_MATO_GROSSO', 150);
    expect(floodTriggered).toBe(true);

    const normalRain = await client.evaluateFloodTrigger('NG_KANO', 150);
    expect(normalRain).toBe(false);
  });

  it('calculates median consensus across price observations', () => {
    const pricesOdd = [100, 105, 102, 108, 101]; // sorted: 100, 101, 102, 105, 108 => 102
    expect(OracleConsensusUtils.calculateMedian(pricesOdd)).toBe(102);

    const pricesEven = [100, 102, 104, 106]; // mid avg: (102 + 104)/2 = 103
    expect(OracleConsensusUtils.calculateMedian(pricesEven)).toBe(103);
  });

  it('filters out statistical price outliers exceeding variance tolerance', () => {
    const pricesWithOutliers = [100, 102, 101, 103, 500]; // 500 is extreme outlier
    const filtered = OracleConsensusUtils.filterOutliers(pricesWithOutliers, 10);

    expect(filtered).not.toContain(500);
    expect(filtered.length).toBe(4);
  });
});
