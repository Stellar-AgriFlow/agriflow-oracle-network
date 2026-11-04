import { describe, it, expect, afterEach } from 'vitest';
import { RelayerTelemetry } from '../src/telemetry';

describe('RelayerTelemetry', () => {
  let telemetry: RelayerTelemetry;

  afterEach(async () => {
    if (telemetry) {
      await telemetry.stopServer();
    }
  });

  it('records cycles and exports Prometheus formatted exposition text', () => {
    telemetry = new RelayerTelemetry();
    telemetry.recordCycle(5, 1, 142);
    telemetry.setHsmStatus('HSM-NITRO-PRIMARY');
    telemetry.setCollateralStake(75000);

    const m = telemetry.getMetrics();
    expect(m.totalCycles).toBe(1);
    expect(m.successfulSubmissions).toBe(5);
    expect(m.failedSubmissions).toBe(1);
    expect(m.lastLatencyMs).toBe(142);

    const text = telemetry.exportPrometheusText();
    expect(text).toContain('# HELP agriflow_oracle_cycles_total');
    expect(text).toContain('# TYPE agriflow_oracle_cycles_total counter');
    expect(text).toContain('agriflow_oracle_cycles_total 1');
    expect(text).toContain('agriflow_oracle_submissions_successful_total 5');
    expect(text).toContain('agriflow_oracle_latency_milliseconds 142');
    expect(text).toContain('agriflow_oracle_stake_collateral_xlm 75000');
  });

  it('starts HTTP server and handles /metrics and /healthz endpoints', async () => {
    telemetry = new RelayerTelemetry();
    const port = 9188;
    await telemetry.startServer(port);

    const healthRes = await fetch(`http://127.0.0.1:${port}/healthz`);
    expect(healthRes.status).toBe(200);
    const healthData = await healthRes.json();
    expect(healthData.status).toBe('ok');

    const metricsRes = await fetch(`http://127.0.0.1:${port}/metrics`);
    expect(metricsRes.status).toBe(200);
    const metricsText = await metricsRes.text();
    expect(metricsText).toContain('agriflow_oracle_cycles_total');
  });
});
