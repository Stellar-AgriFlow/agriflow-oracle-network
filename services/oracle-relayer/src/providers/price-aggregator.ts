export interface CommodityQuote {
  source: string;
  price: number;
  confidence: number;
  timestamp: number;
}

export interface AggregatedPriceResult {
  commodity: string;
  price: number;
  decimals: number;
  confidence: number;
  sourcesCount: number;
  timestamp: number;
}

export class MultiSourcePriceAggregator {
  /**
   * Aggregates quotes from multiple sources with outlier filtering
   */
  static aggregateQuotes(
    commodity: string,
    quotes: CommodityQuote[],
    maxDeviationPercent: number = 15
  ): AggregatedPriceResult {
    if (!quotes || quotes.length === 0) {
      throw new Error(`No price quotes available for ${commodity}`);
    }

    if (quotes.length === 1) {
      const q = quotes[0];
      return {
        commodity,
        price: q.price,
        decimals: 2,
        confidence: q.confidence,
        sourcesCount: 1,
        timestamp: q.timestamp,
      };
    }

    // 1. Calculate median price
    const sortedPrices = [...quotes].map((q) => q.price).sort((a, b) => a - b);
    const mid = Math.floor(sortedPrices.length / 2);
    const median =
      sortedPrices.length % 2 !== 0
        ? sortedPrices[mid]
        : (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;

    // 2. Filter outliers deviating beyond maxDeviationPercent
    const validQuotes = quotes.filter((q) => {
      const deviation = Math.abs((q.price - median) / median) * 100;
      return deviation <= maxDeviationPercent;
    });

    const candidateQuotes = validQuotes.length > 0 ? validQuotes : quotes;

    // 3. Compute confidence-weighted average
    let totalWeight = 0;
    let weightedSum = 0;

    for (const q of candidateQuotes) {
      const weight = Math.max(1, q.confidence);
      weightedSum += q.price * weight;
      totalWeight += weight;
    }

    const aggregatedPrice = Number((weightedSum / totalWeight).toFixed(2));
    const avgConfidence = Math.round(
      candidateQuotes.reduce((acc, q) => acc + q.confidence, 0) / candidateQuotes.length
    );

    return {
      commodity,
      price: aggregatedPrice,
      decimals: 2,
      confidence: avgConfidence,
      sourcesCount: candidateQuotes.length,
      timestamp: Date.now(),
    };
  }
}
