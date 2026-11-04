import { describe, it, expect } from 'vitest';
import { MetricsStorage } from '../src/storage/metricsDb';

describe('MetricsStorage', () => {
  const baseTime = 1700000000;

  it('records metrics and computes SLA uptime and average latency', () => {
    const storage = new MetricsStorage(':memory:');

    // 4 successful relays at 100ms, 120ms, 140ms, 160ms -> avg = 130ms
    storage.recordRelayMetric({
      metricName: 'relay_execution',
      metricValue: 1,
      feedSymbol: 'MAIZE',
      relayerNodeId: 'node-primary-01',
      isSuccess: true,
      latencyMs: 100,
      timestamp: baseTime + 10,
    });
    storage.recordRelayMetric({
      metricName: 'relay_execution',
      metricValue: 1,
      feedSymbol: 'MAIZE',
      relayerNodeId: 'node-primary-01',
      isSuccess: true,
      latencyMs: 120,
      timestamp: baseTime + 20,
    });
    storage.recordRelayMetric({
      metricName: 'relay_execution',
      metricValue: 1,
      feedSymbol: 'MAIZE',
      relayerNodeId: 'node-primary-01',
      isSuccess: true,
      latencyMs: 140,
      timestamp: baseTime + 30,
    });
    storage.recordRelayMetric({
      metricName: 'relay_execution',
      metricValue: 1,
      feedSymbol: 'MAIZE',
      relayerNodeId: 'node-primary-01',
      isSuccess: true,
      latencyMs: 160,
      timestamp: baseTime + 40,
    });

    // 1 failed relay
    storage.recordRelayMetric({
      metricName: 'relay_execution',
      metricValue: 0,
      feedSymbol: 'MAIZE',
      relayerNodeId: 'node-primary-01',
      isSuccess: false,
      latencyMs: 500,
      timestamp: baseTime + 50,
    });

    // 4 successes / 5 total = 80.0% SLA
    const uptime = storage.getSlaUptimePercent('MAIZE', 3600, baseTime + 60);
    expect(uptime).toBe(80.0);

    const avgLat = storage.getAverageLatencyMs('MAIZE', 3600, baseTime + 60);
    expect(avgLat).toBe(130);
  });

  it('returns default 100% SLA when no metrics exist in window', () => {
    const storage = new MetricsStorage(':memory:');
    const uptime = storage.getSlaUptimePercent('WHEAT', 3600, baseTime);
    expect(uptime).toBe(100.0);
  });
});
