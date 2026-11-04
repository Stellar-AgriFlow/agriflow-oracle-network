/**
 * AgriFlow Oracle Network - End-to-End Oracle Cycle Simulation Script
 * Demonstrates data ingestion, MAD outlier filtering, EWMA volatility calculation,
 * and signed payload dispatch for Soroban smart contracts.
 */

export interface OracleCycleResult {
  timestamp: number;
  feedCount: number;
  filteredOutliers: number;
  medianPriceCents: number;
  annualizedVolatility: number;
  status: 'SUCCESS' | 'ALERT';
}

export function runSimulatedOracleCycle(rawPrices: number[], decayFactor = 0.94): OracleCycleResult {
  if (rawPrices.length === 0) {
    throw new Error('Raw price sample cannot be empty');
  }

  // 1. Median calculation
  const sorted = [...rawPrices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  // 2. Median Absolute Deviation (MAD) filtering (reject if > 2.5 * MAD)
  const deviations = sorted.map((p) => Math.abs(p - median));
  deviations.sort((a, b) => a - b);
  const mad = deviations[mid] || 1;

  const validPrices = sorted.filter((p) => Math.abs(p - median) <= 2.5 * mad);
  const filteredCount = rawPrices.length - validPrices.length;

  // 3. EWMA Volatility computation
  let variance = 0;
  for (let i = 1; i < validPrices.length; i++) {
    const ret = Math.log(validPrices[i] / validPrices[i - 1]);
    variance = decayFactor * variance + (1 - decayFactor) * Math.pow(ret, 2);
  }
  const annualizedVol = Math.sqrt(variance * 252) * 100;

  return {
    timestamp: Date.now(),
    feedCount: validPrices.length,
    filteredOutliers: filteredCount,
    medianPriceCents: Math.round(median * 100),
    annualizedVolatility: Number(annualizedVol.toFixed(2)),
    status: filteredCount > 2 ? 'ALERT' : 'SUCCESS',
  };
}

if (require.main === module) {
  console.log('--- Running AgriFlow Oracle Simulation Cycle ---');
  const sample = [4.38, 4.40, 4.42, 4.41, 7.80 /* outlier */, 4.43];
  const res = runSimulatedOracleCycle(sample);
  console.log('Result:', JSON.stringify(res, null, 2));
}
