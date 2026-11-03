export interface PriceObservation {
  price: number;
  timestamp: number;
  weight?: number;
}

export interface TwapResult {
  twap: number;
  count: number;
  windowSeconds: number;
  minPrice: number;
  maxPrice: number;
}

export class HistoricalPriceAggregator {
  /**
   * Computes Time-Weighted Average Price (TWAP) over a sliding duration window
   */
  static computeTwap(
    observations: PriceObservation[],
    windowSeconds: number,
    currentTime: number = Math.floor(Date.now() / 1000)
  ): TwapResult {
    const minTimestamp = currentTime - windowSeconds;
    const windowObs = observations
      .filter((o) => o.timestamp >= minTimestamp && o.timestamp <= currentTime)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (windowObs.length === 0) {
      return { twap: 0, count: 0, windowSeconds, minPrice: 0, maxPrice: 0 };
    }

    if (windowObs.length === 1) {
      return {
        twap: windowObs[0].price,
        count: 1,
        windowSeconds,
        minPrice: windowObs[0].price,
        maxPrice: windowObs[0].price,
      };
    }

    let weightedSum = 0;
    let totalDuration = 0;
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (let i = 0; i < windowObs.length - 1; i++) {
      const current = windowObs[i];
      const next = windowObs[i + 1];
      const duration = Math.max(1, next.timestamp - current.timestamp);

      weightedSum += current.price * duration;
      totalDuration += duration;

      if (current.price < minPrice) minPrice = current.price;
      if (current.price > maxPrice) maxPrice = current.price;
    }

    // Include the final observation spanning to currentTime
    const last = windowObs[windowObs.length - 1];
    const tailDuration = Math.max(1, currentTime - last.timestamp);
    weightedSum += last.price * tailDuration;
    totalDuration += tailDuration;

    if (last.price < minPrice) minPrice = last.price;
    if (last.price > maxPrice) maxPrice = last.price;

    const twap = Math.round(weightedSum / (totalDuration || 1));

    return {
      twap,
      count: windowObs.length,
      windowSeconds,
      minPrice,
      maxPrice,
    };
  }

  /**
   * Computes Exponential Moving Average (EMA) with decay smoothing factor alpha
   */
  static computeEma(prices: number[], alpha: number = 0.2): number {
    if (prices.length === 0) return 0;
    let ema = prices[0];
    for (let i = 1; i < prices.length; i++) {
      ema = alpha * prices[i] + (1 - alpha) * ema;
    }
    return Math.round(ema);
  }

  /**
   * Filters out extreme outlier spikes that deviate more than threshold multiplier from median
   */
  static filterOutliers(prices: number[], maxDevMultiplier: number = 1.5): number[] {
    if (prices.length <= 2) return prices;

    const sorted = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

    const deviations = prices.map((p) => Math.abs(p - median));
    const medDev = [...deviations].sort((a, b) => a - b)[mid] || 1;

    return prices.filter((p) => Math.abs(p - median) <= maxDevMultiplier * medDev * 2.5);
  }

  /**
   * Computes Pearson correlation coefficient between two commodity price series
   * Returns value between -1.0 and +1.0
   */
  static computePearsonCorrelation(seriesA: number[], seriesB: number[]): number {
    const n = Math.min(seriesA.length, seriesB.length);
    if (n < 2) return 0;

    const meanA = seriesA.slice(0, n).reduce((sum, v) => sum + v, 0) / n;
    const meanB = seriesB.slice(0, n).reduce((sum, v) => sum + v, 0) / n;

    let numerator = 0;
    let denomA = 0;
    let denomB = 0;

    for (let i = 0; i < n; i++) {
      const diffA = seriesA[i] - meanA;
      const diffB = seriesB[i] - meanB;
      numerator += diffA * diffB;
      denomA += diffA * diffA;
      denomB += diffB * diffB;
    }

    if (denomA === 0 || denomB === 0) return 0;

    const correlation = numerator / (Math.sqrt(denomA) * Math.sqrt(denomB));
    return Number(Math.max(-1, Math.min(1, correlation)).toFixed(4));
  }
}
