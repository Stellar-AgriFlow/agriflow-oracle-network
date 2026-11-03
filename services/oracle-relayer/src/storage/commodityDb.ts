export interface CommodityPriceRecord {
  id?: number;
  symbol: string;
  priceUsdCents: number;
  source: string;
  timestamp: number;
  twap1hCents?: number;
  txHash?: string;
}

export class CommodityStorage {
  private db: any;

  constructor(dbPath: string = ':memory:') {
    try {
      // Use Node built-in SQLite engine
      const { DatabaseSync } = require('node:sqlite');
      this.db = new DatabaseSync(dbPath);
      this.initSchema();
    } catch {
      // Fallback in-memory map for environments without node:sqlite
      this.db = null;
      this.memoryStore = [];
    }
  }

  private memoryStore: CommodityPriceRecord[] = [];

  private initSchema(): void {
    if (!this.db) return;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS commodity_prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        price_usd_cents INTEGER NOT NULL,
        source TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        twap_1h_cents INTEGER,
        tx_hash TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_commodity_symbol_time ON commodity_prices (symbol, timestamp DESC);
    `);
  }

  savePriceObservation(record: CommodityPriceRecord): number {
    if (this.db) {
      const stmt = this.db.prepare(`
        INSERT INTO commodity_prices (symbol, price_usd_cents, source, timestamp, twap_1h_cents, tx_hash)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        record.symbol.toUpperCase(),
        record.priceUsdCents,
        record.source,
        record.timestamp,
        record.twap1hCents ?? null,
        record.txHash ?? null
      );
      return Number(result.lastInsertRowid);
    } else {
      const newRecord = { ...record, id: this.memoryStore.length + 1 };
      this.memoryStore.push(newRecord);
      return newRecord.id;
    }
  }

  getHistoricalPrices(symbol: string, limit: number = 50): CommodityPriceRecord[] {
    const sym = symbol.toUpperCase();
    if (this.db) {
      const stmt = this.db.prepare(`
        SELECT id, symbol, price_usd_cents as priceUsdCents, source, timestamp, twap_1h_cents as twap1hCents, tx_hash as txHash
        FROM commodity_prices
        WHERE symbol = ?
        ORDER BY timestamp DESC
        LIMIT ?
      `);
      return stmt.all(sym, limit);
    } else {
      return this.memoryStore
        .filter((r) => r.symbol === sym)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    }
  }

  getLatestPrice(symbol: string): CommodityPriceRecord | null {
    const history = this.getHistoricalPrices(symbol, 1);
    return history.length > 0 ? history[0] : null;
  }

  calculateHistoricalTwap(symbol: string, windowSeconds: number = 3600): number | null {
    const sym = symbol.toUpperCase();
    const cutoff = Math.floor(Date.now() / 1000) - windowSeconds;

    if (this.db) {
      const stmt = this.db.prepare(`
        SELECT AVG(price_usd_cents) as avgPrice
        FROM commodity_prices
        WHERE symbol = ? AND timestamp >= ?
      `);
      const row = stmt.get(sym, cutoff);
      return row && row.avgPrice ? Math.round(row.avgPrice) : null;
    } else {
      const valid = this.memoryStore.filter((r) => r.symbol === sym && r.timestamp >= cutoff);
      if (valid.length === 0) return null;
      const sum = valid.reduce((acc, curr) => acc + curr.priceUsdCents, 0);
      return Math.round(sum / valid.length);
    }
  }
}
