export interface ReporterVote {
  reporterId: string;
  price: number;
  weight: number;
  timestamp: number;
}

export interface QuorumConsensusResult {
  isQuorumMet: boolean;
  totalWeightSubmitted: number;
  requiredWeight: number;
  participatingReporters: number;
  consensusPrice: number;
  outliersEliminated: number;
  reason?: string;
}

export class MultiReporterAggregator {
  private totalRegisteredWeight: number;
  private bftThresholdFraction: number; // e.g. 0.67 for 2/3

  constructor(totalRegisteredWeight: number, bftThresholdFraction: number = 0.67) {
    this.totalRegisteredWeight = totalRegisteredWeight;
    this.bftThresholdFraction = bftThresholdFraction;
  }

  /**
   * Aggregates reporter submissions with Byzantine Fault Tolerance (BFT)
   */
  aggregateVotes(
    votes: ReporterVote[],
    maxOutlierDeltaPercent: number = 25
  ): QuorumConsensusResult {
    const requiredWeight = Math.ceil(this.totalRegisteredWeight * this.bftThresholdFraction);
    const totalWeightSubmitted = votes.reduce((sum, v) => sum + v.weight, 0);

    if (totalWeightSubmitted < requiredWeight) {
      return {
        isQuorumMet: false,
        totalWeightSubmitted,
        requiredWeight,
        participatingReporters: votes.length,
        consensusPrice: 0,
        outliersEliminated: 0,
        reason: `Insufficient BFT quorum: submitted weight ${totalWeightSubmitted} < required ${requiredWeight}`,
      };
    }

    // Sort to determine weighted median
    const sorted = [...votes].sort((a, b) => a.price - b.price);
    const midIdx = Math.floor(sorted.length / 2);
    const medianPrice = sorted[midIdx].price;

    // Filter Byzantine malicious outliers
    const validVotes: ReporterVote[] = [];
    let outliersEliminated = 0;

    for (const v of sorted) {
      const deltaPercent = (Math.abs(v.price - medianPrice) / (medianPrice || 1)) * 100;
      if (deltaPercent <= maxOutlierDeltaPercent) {
        validVotes.push(v);
      } else {
        outliersEliminated += 1;
      }
    }

    // Compute final stake-weighted average
    const finalWeight = validVotes.reduce((sum, v) => sum + v.weight, 0);
    const weightedSum = validVotes.reduce((sum, v) => sum + v.price * v.weight, 0);
    const consensusPrice = Math.round(weightedSum / (finalWeight || 1));

    return {
      isQuorumMet: true,
      totalWeightSubmitted,
      requiredWeight,
      participatingReporters: validVotes.length,
      consensusPrice,
      outliersEliminated,
    };
  }
}
