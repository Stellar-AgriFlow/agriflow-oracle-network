import http from 'http';

export interface RelayerMetrics {
  totalCycles: number;
  successfulSubmissions: number;
  failedSubmissions: number;
  lastRunTimestamp: number;
  uptimeSeconds: number;
  lastLatencyMs: number;
  activeHsmNodeId?: string;
  totalStakeCollateralXlm?: number;
}

export class RelayerTelemetry {
  private startTime: number;
  private metrics: RelayerMetrics;
  private server?: http.Server;

  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      totalCycles: 0,
      successfulSubmissions: 0,
      failedSubmissions: 0,
      lastRunTimestamp: 0,
      uptimeSeconds: 0,
      lastLatencyMs: 0,
      activeHsmNodeId: 'HSM-PRIMARY-01',
      totalStakeCollateralXlm: 50000,
    };
  }

  recordCycle(successCount: number, failureCount: number, latencyMs: number) {
    this.metrics.totalCycles += 1;
    this.metrics.successfulSubmissions += successCount;
    this.metrics.failedSubmissions += failureCount;
    this.metrics.lastRunTimestamp = Date.now();
    this.metrics.lastLatencyMs = latencyMs;
  }

  setHsmStatus(nodeId: string) {
    this.metrics.activeHsmNodeId = nodeId;
  }

  setCollateralStake(xlmAmount: number) {
    this.metrics.totalStakeCollateralXlm = xlmAmount;
  }

  getMetrics(): RelayerMetrics {
    return {
      ...this.metrics,
      uptimeSeconds: Math.round((Date.now() - this.startTime) / 1000),
    };
  }

  exportPrometheusText(): string {
    const m = this.getMetrics();
    const lines = [
      '# HELP agriflow_oracle_cycles_total Total number of oracle aggregation cycles executed',
      '# TYPE agriflow_oracle_cycles_total counter',
      `agriflow_oracle_cycles_total ${m.totalCycles}`,
      '',
      '# HELP agriflow_oracle_submissions_successful_total Successful Soroban oracle price & weather submissions',
      '# TYPE agriflow_oracle_submissions_successful_total counter',
      `agriflow_oracle_submissions_successful_total ${m.successfulSubmissions}`,
      '',
      '# HELP agriflow_oracle_submissions_failed_total Failed oracle submissions to Soroban RPC',
      '# TYPE agriflow_oracle_submissions_failed_total counter',
      `agriflow_oracle_submissions_failed_total ${m.failedSubmissions}`,
      '',
      '# HELP agriflow_oracle_latency_milliseconds Latency of the most recent oracle consensus relay in ms',
      '# TYPE agriflow_oracle_latency_milliseconds gauge',
      `agriflow_oracle_latency_milliseconds ${m.lastLatencyMs}`,
      '',
      '# HELP agriflow_oracle_uptime_seconds Total runtime uptime in seconds',
      '# TYPE agriflow_oracle_uptime_seconds counter',
      `agriflow_oracle_uptime_seconds ${m.uptimeSeconds}`,
      '',
      '# HELP agriflow_oracle_stake_collateral_xlm Total protocol collateral securing oracle reports in XLM',
      '# TYPE agriflow_oracle_stake_collateral_xlm gauge',
      `agriflow_oracle_stake_collateral_xlm ${m.totalStakeCollateralXlm || 0}`,
      '',
    ];
    return lines.join('\n');
  }

  startServer(port: number = 8080): Promise<void> {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        if (req.url === '/health' || req.url === '/healthz' || req.url === '/ready') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok', uptime: this.getMetrics().uptimeSeconds, timestamp: Date.now() }));
        } else if (req.url === '/metrics') {
          res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' });
          res.end(this.exportPrometheusText());
        } else if (req.url === '/status') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(this.getMetrics(), null, 2));
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      });

      this.server.listen(port, () => {
        resolve();
      });
    });
  }

  stopServer(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }
}
