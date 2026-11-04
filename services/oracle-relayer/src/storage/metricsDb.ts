export interface RelayerMetricRecord {
  id?: number;
  metricName: string;
  metricValue: number;
  feedSymbol: string;
  relayerNodeId: string;
  isSuccess: boolean;
  latencyMs: number;
  timestamp: number;
}

export class MetricsStorage {
  private db: any;
  private memoryStore: RelayerMetricRecord[] = [];

  constructor(dbPath: string = ':memory:') {
    try {
      const { DatabaseSync } = require('node:sqlite');
      this.db = new DatabaseSync(dbPath);
      this.initSchema();
    } catch {
      this.db = null;
      this.memoryStore = [];
    }
  }

  private initSchema(): void {
    if (!this.db) return;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS relayer_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        feed_symbol TEXT NOT NULL,
        relayer_node_id TEXT NOT NULL,
        is_success INTEGER NOT NULL,
        latency_ms INTEGER NOT NULL,
        timestamp INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_metrics_feed_time ON relayer_metrics (feed_symbol, timestamp DESC);
    `);
  }

  recordRelayMetric(record: Omit<RelayerMetricRecord, 'id'>): RelayerMetricRecord {
    const fullRecord: RelayerMetricRecord = { ...record };

    if (this.db) {
      const stmt = this.db.prepare(`
        INSERT INTO relayer_metrics (metric_name, metric_value, feed_symbol, relayer_node_id, is_success, latency_ms, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        fullRecord.metricName,
        fullRecord.metricValue,
        fullRecord.feedSymbol,
        fullRecord.relayerNodeId,
        fullRecord.isSuccess ? 1 : 0,
        fullRecord.latencyMs,
        fullRecord.timestamp
      );
      fullRecord.id = Number(result.lastInsertRowid);
    } else {
      fullRecord.id = this.memoryStore.length + 1;
      this.memoryStore.push(fullRecord);
    }

    return fullRecord;
  }

  getSlaUptimePercent(
    feedSymbol: string,
    windowSeconds: number = 3600,
    currentTime: number = Math.floor(Date.now() / 1000)
  ): number {
    const minTimestamp = currentTime - windowSeconds;

    if (this.db) {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) as total, SUM(is_success) as successes
        FROM relayer_metrics
        WHERE feed_symbol = ? AND timestamp >= ?
      `);
      const row = stmt.get(feedSymbol, minTimestamp);
      if (!row || row.total === 0) return 100.0;
      return Number(((row.successes / row.total) * 100).toFixed(2));
    } else {
      const records = this.memoryStore.filter(
        (r) => r.feedSymbol === feedSymbol && r.timestamp >= minTimestamp
      );
      if (records.length === 0) return 100.0;
      const successes = records.filter((r) => r.isSuccess).length;
      return Number(((successes / records.length) * 100).toFixed(2));
    }
  }

  getAverageLatencyMs(
    feedSymbol: string,
    windowSeconds: number = 3600,
    currentTime: number = Math.floor(Date.now() / 1000)
  ): number {
    const minTimestamp = currentTime - windowSeconds;

    if (this.db) {
      const stmt = this.db.prepare(`
        SELECT AVG(latency_ms) as avg_lat
        FROM relayer_metrics
        WHERE feed_symbol = ? AND timestamp >= ? AND is_success = 1
      `);
      const row = stmt.get(feedSymbol, minTimestamp);
      if (!row || row.avg_lat === null) return 0;
      return Math.round(row.avg_lat);
    } else {
      const records = this.memoryStore.filter(
        (r) => r.feedSymbol === feedSymbol && r.timestamp >= minTimestamp && r.isSuccess
      );
      if (records.length === 0) return 0;
      const sum = records.reduce((acc, r) => acc + r.latencyMs, 0);
      return Math.round(sum / records.length);
    }
  }
}
