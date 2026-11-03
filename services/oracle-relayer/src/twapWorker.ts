import { CommodityPriceDb } from './storage/commodityDb';

export interface CachedTwap {
  commodity: string;
  twap: number;
  calculatedAt: number;
  windowSeconds: number;
  sampleCount: number;
}

export class TwapWorker {
  private cache: Map<string, CachedTwap> = new Map();
  private db?: CommodityPriceDb;
  private cacheTtlSeconds: number;

  constructor(db?: CommodityPriceDb, cacheTtlSeconds: number = 300) {
    this.db = db;
    this.cacheTtlSeconds = cacheTtlSeconds;
  }

  /**
   * Calculates time-weighted average price from a list of price observations
   */
  calculateTwapFromSeries(
    observations: Array<{ price: number; timestamp: number }>,
    windowSeconds: number,
    now: number = Math.floor(Date.now() / 1000)
  ): number {
    const minTime = now - windowSeconds;
    const windowObs = observations
      .filter((o) => o.timestamp >= minTime && o.timestamp <= now)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (windowObs.length === 0) return 0;
    if (windowObs.length === 1) return windowObs[0].price;

    let weightedSum = 0;
    let totalTime = 0;

    for (let i = 0; i < windowObs.length - 1; i++) {
      const dt = Math.max(1, windowObs[i + 1].timestamp - windowObs[i].timestamp);
      weightedSum += windowObs[i].price * dt;
      totalTime += dt;
    }

    const last = windowObs[windowObs.length - 1];
    const tailDt = Math.max(1, now - last.timestamp);
    weightedSum += last.price * tailDt;
    totalTime += tailDt;

    return Math.round(weightedSum / (totalTime || 1));
  }

  /**
   * Refreshes the cached TWAP for a commodity
   */
  async refreshTwap(
    commodity: string,
    windowSeconds: number = 3600,
    customObservations?: Array<{ price: number; timestamp: number }>
  ): Promise<CachedTwap> {
    const now = Math.floor(Date.now() / 1000);
    let obs = customObservations;

    if (!obs && this.db) {
      const raw = await this.db.getObservations(commodity, now - windowSeconds, now);
      obs = raw.map((r) => ({ price: r.price, timestamp: r.timestamp }));
    }

    const twap = this.calculateTwapFromSeries(obs || [], windowSeconds, now);
    const entry: CachedTwap = {
      commodity,
      twap,
      calculatedAt: now,
      windowSeconds,
      sampleCount: obs?.length || 0,
    };

    this.cache.set(commodity, entry);
    return entry;
  }

  /**
   * Gets current cached TWAP, checking freshness
   */
  getCachedTwap(commodity: string): CachedTwap | undefined {
    const cached = this.cache.get(commodity);
    if (!cached) return undefined;

    const now = Math.floor(Date.now() / 1000);
    if (now - cached.calculatedAt > this.cacheTtlSeconds) {
      return undefined; // Stale cache
    }

    return cached;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
