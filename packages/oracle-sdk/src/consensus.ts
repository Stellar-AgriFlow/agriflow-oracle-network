export class OracleConsensusUtils {
  /**
   * Calculates median price from an array of reporter numbers
   */
  static calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    }
    return sorted[mid];
  }

  /**
   * Filters out values that deviate more than maxVariancePercent from the median
   */
  static filterOutliers(values: number[], maxVariancePercent: number = 10): number[] {
    if (values.length <= 2) return values;
    const median = this.calculateMedian(values);
    if (median === 0) return values;

    const threshold = (median * maxVariancePercent) / 100;
    return values.filter((val) => Math.abs(val - median) <= threshold);
  }
}
