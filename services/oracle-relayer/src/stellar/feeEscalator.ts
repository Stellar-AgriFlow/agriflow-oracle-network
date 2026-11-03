export interface FeeConfig {
  baseFeeStroops: number;
  maxFeeStroops: number;
  surgeMultiplier: number;
}

export class DynamicFeeEscalator {
  private baseFeeStroops: number;
  private maxFeeStroops: number;
  private surgeMultiplier: number;

  constructor(
    config: FeeConfig = {
      baseFeeStroops: 100, // Standard 100 stroops (0.00001 XLM)
      maxFeeStroops: 1000000, // 0.1 XLM safety ceiling
      surgeMultiplier: 1.5,
    }
  ) {
    this.baseFeeStroops = config.baseFeeStroops;
    this.maxFeeStroops = config.maxFeeStroops;
    this.surgeMultiplier = config.surgeMultiplier;
  }

  /**
   * Calculates escalated fee based on consecutive retries or ledger congestion level
   */
  calculateFee(retryAttempt: number = 0, congestionRatio: number = 0): number {
    let fee = this.baseFeeStroops;

    // Apply exponential backoff multiplier for retries
    if (retryAttempt > 0) {
      fee = Math.round(fee * Math.pow(this.surgeMultiplier, retryAttempt));
    }

    // Apply additional surge if network ledger is congested (> 70% capacity)
    if (congestionRatio > 0.7) {
      const congestionFactor = 1 + (congestionRatio - 0.7) * 3;
      fee = Math.round(fee * congestionFactor);
    }

    // Cap strictly at safety maximum
    return Math.min(fee, this.maxFeeStroops);
  }

  /**
   * Checks whether the current fee exceeds safety limits
   */
  isFeeWithinBudget(feeStroops: number): boolean {
    return feeStroops <= this.maxFeeStroops;
  }

  getBaseFee(): number {
    return this.baseFeeStroops;
  }

  getMaxFee(): number {
    return this.maxFeeStroops;
  }
}
