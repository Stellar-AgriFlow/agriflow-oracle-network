import { describe, it, expect } from 'vitest';
import { runSimulatedOracleCycle } from '../scripts/simulate-oracle-cycle';
import { benchmarkOracleSubmission } from '../scripts/benchmark-oracle-costs';
import { getContractVerificationConfig } from '../scripts/verify-testnet-contracts';

describe('Operational & Benchmarking Scripts Suite', () => {
  it('correctly filters anomalous outliers and computes EWMA volatility in oracle cycle', () => {
    const raw = [4.38, 4.40, 4.42, 4.41, 12.50 /* extreme outlier */, 4.43];
    const result = runSimulatedOracleCycle(raw);

    expect(result.feedCount).toBe(5);
    expect(result.filteredOutliers).toBe(1);
    expect(result.medianPriceCents).toBeGreaterThan(430);
    expect(result.medianPriceCents).toBeLessThan(450);
    expect(result.status).toBe('SUCCESS');
  });

  it('provides precise Soroban CPU, memory, and XLM fee benchmarks', () => {
    const priceBench = benchmarkOracleSubmission('PRICE_FEED_UPDATE');
    expect(priceBench.cpuInstructions).toBeGreaterThan(100_000);
    expect(priceBench.estimatedCostXlm).toBeLessThan(0.001);

    const weatherBench = benchmarkOracleSubmission('WEATHER_TELEMETRY');
    expect(weatherBench.memoryBytes).toBeGreaterThan(10_000);

    const stakeBench = benchmarkOracleSubmission('STAKE_REGISTRATION');
    expect(stakeBench.baseFeeStroops).toBe(200);
  });

  it('validates testnet contract addresses and RPC configuration', () => {
    const cfg = getContractVerificationConfig();
    expect(cfg.allDeployed).toBe(true);
    expect(cfg.priceFeedContract).toBe('CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7');
    expect(cfg.weatherOracleContract).toBe('CCC6PHP7LADEVOW4AOLSRXHC6WOK2LW3ZJQX4EEYKR42GR3HXNSFIPHN');
    expect(cfg.stakingContract).toBe('CA7X2E2V5D6E7YBNZMRJ5E8WKQP4K5M4X6N3R8B2C9L1A4G5H7J3K');
    expect(cfg.rpcEndpoint).toBe('https://soroban-testnet.stellar.org');
  });
});
