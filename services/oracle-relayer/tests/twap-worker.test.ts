import { describe, it, expect } from 'vitest';
import { TwapWorker } from '../src/twapWorker';

describe('Relayer TwapWorker', () => {
  const baseTime = 1700000000;

  it('calculates TWAP across sample series correctly', async () => {
    const worker = new TwapWorker(undefined, 300);
    const now = Math.floor(Date.now() / 1000);

    const observations = [
      { price: 200, timestamp: now - 3000 },
      { price: 240, timestamp: now - 1000 },
    ];

    const cached = await worker.refreshTwap('WHEAT', 3600, observations);
    expect(cached.twap).toBeGreaterThan(200);
    expect(cached.twap).toBeLessThan(240);
    expect(cached.commodity).toBe('WHEAT');
    expect(cached.sampleCount).toBe(2);
  });

  it('retrieves cached entry within TTL window', async () => {
    const worker = new TwapWorker(undefined, 300);
    await worker.refreshTwap('MAIZE', 1800, [{ price: 150, timestamp: Math.floor(Date.now() / 1000) }]);

    const hit = worker.getCachedTwap('MAIZE');
    expect(hit).toBeDefined();
    expect(hit?.twap).toBe(150);
  });

  it('returns undefined for expired cache when TTL elapsed', async () => {
    // 0-second TTL
    const worker = new TwapWorker(undefined, -1);
    await worker.refreshTwap('SOY', 1800, [{ price: 320, timestamp: Math.floor(Date.now() / 1000) }]);

    const stale = worker.getCachedTwap('SOY');
    expect(stale).toBeUndefined();
  });

  it('handles empty observation set gracefully with zero TWAP', async () => {
    const worker = new TwapWorker();
    const empty = await worker.refreshTwap('COFFEE', 3600, []);
    expect(empty.twap).toBe(0);
    expect(empty.sampleCount).toBe(0);
  });
});
