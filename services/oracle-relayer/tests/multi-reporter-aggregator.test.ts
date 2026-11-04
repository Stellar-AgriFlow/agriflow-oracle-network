import { describe, it, expect } from 'vitest';
import {
  MultiReporterAggregator,
  ReporterVote,
} from '../src/signer/multiReporterAggregator';

describe('MultiReporterAggregator BFT Consensus', () => {
  const totalWeight = 100;
  const aggregator = new MultiReporterAggregator(totalWeight, 0.67); // 67% required

  it('aggregates consensus price when 2/3 BFT quorum is met', () => {
    const votes: ReporterVote[] = [
      { reporterId: 'REP_1', price: 200, weight: 30, timestamp: 1700000000 },
      { reporterId: 'REP_2', price: 210, weight: 25, timestamp: 1700000000 },
      { reporterId: 'REP_3', price: 205, weight: 20, timestamp: 1700000000 },
    ]; // Total weight: 75 >= 67

    const res = aggregator.aggregateVotes(votes);

    expect(res.isQuorumMet).toBe(true);
    expect(res.totalWeightSubmitted).toBe(75);
    expect(res.participatingReporters).toBe(3);
    expect(res.outliersEliminated).toBe(0);
    // (200*30 + 210*25 + 205*20) / 75 = (6000 + 5250 + 4100) / 75 = 15350 / 75 = 204.66 -> 205
    expect(res.consensusPrice).toBe(205);
  });

  it('rejects consensus when submitted weight falls below BFT threshold', () => {
    const votes: ReporterVote[] = [
      { reporterId: 'REP_1', price: 200, weight: 30, timestamp: 1700000000 },
      { reporterId: 'REP_2', price: 210, weight: 20, timestamp: 1700000000 },
    ]; // Total weight: 50 < 67

    const res = aggregator.aggregateVotes(votes);
    expect(res.isQuorumMet).toBe(false);
    expect(res.reason).toContain('Insufficient BFT quorum');
  });

  it('eliminates Byzantine spoofed price spikes while preserving quorum', () => {
    const votes: ReporterVote[] = [
      { reporterId: 'REP_1', price: 200, weight: 30, timestamp: 1700000000 },
      { reporterId: 'REP_2', price: 205, weight: 25, timestamp: 1700000000 },
      { reporterId: 'REP_3', price: 202, weight: 20, timestamp: 1700000000 },
      { reporterId: 'REP_BYZANTINE', price: 5000, weight: 10, timestamp: 1700000000 },
    ]; // Total weight: 85

    const res = aggregator.aggregateVotes(votes, 25);
    expect(res.isQuorumMet).toBe(true);
    expect(res.outliersEliminated).toBe(1);
    expect(res.participatingReporters).toBe(3);
    expect(res.consensusPrice).toBeGreaterThan(199);
    expect(res.consensusPrice).toBeLessThan(206);
  });
});
