import http from 'http';

export interface RelayerMetrics {
  totalCycles: number;
  successfulSubmissions: number;
  failedSubmissions: number;
  lastRunTimestamp: number;
  uptimeSeconds: number;
  lastLatencyMs: number;
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
    };
  }

  recordCycle(successCount: number, failureCount: number, latencyMs: number) {
    this.metrics.totalCycles += 1;
    this.metrics.successfulSubmissions += successCount;
    this.metrics.failedSubmissions += failureCount;
    this.metrics.lastRunTimestamp = Date.now();
    this.metrics.lastLatencyMs = latencyMs;
  }

  getMetrics(): RelayerMetrics {
    return {
      ...this.metrics,
      uptimeSeconds: Math.round((Date.now() - this.startTime) / 1000),
    };
  }

  startServer(port: number = 8080): Promise<void> {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        if (req.url === '/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
        } else if (req.url === '/metrics' || req.url === '/status') {
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

  stopServer() {
    if (this.server) {
      this.server.close();
    }
  }
}
