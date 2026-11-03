export interface WeatherObservationRecord {
  id?: number;
  regionId: string;
  rainfallMm: number;
  temperatureCelsius: number;
  humidityPercent: number;
  droughtIndex: number;
  timestamp: number;
  txHash?: string;
}

export class WeatherStorage {
  private db: any;

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

  private memoryStore: WeatherObservationRecord[] = [];

  private initSchema(): void {
    if (!this.db) return;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS weather_observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        region_id TEXT NOT NULL,
        rainfall_mm INTEGER NOT NULL,
        temperature_celsius INTEGER NOT NULL,
        humidity_percent INTEGER NOT NULL,
        drought_index INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        tx_hash TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_weather_region_time ON weather_observations (region_id, timestamp DESC);
    `);
  }

  saveObservation(record: WeatherObservationRecord): number {
    if (this.db) {
      const stmt = this.db.prepare(`
        INSERT INTO weather_observations (region_id, rainfall_mm, temperature_celsius, humidity_percent, drought_index, timestamp, tx_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        record.regionId.toUpperCase(),
        record.rainfallMm,
        record.temperatureCelsius,
        record.humidityPercent,
        record.droughtIndex,
        record.timestamp,
        record.txHash ?? null
      );
      return Number(result.lastInsertRowid);
    } else {
      const newRecord = { ...record, id: this.memoryStore.length + 1 };
      this.memoryStore.push(newRecord);
      return newRecord.id;
    }
  }

  getRegionalHistory(regionId: string, limit: number = 50): WeatherObservationRecord[] {
    const reg = regionId.toUpperCase();
    if (this.db) {
      const stmt = this.db.prepare(`
        SELECT id, region_id as regionId, rainfall_mm as rainfallMm, temperature_celsius as temperatureCelsius,
               humidity_percent as humidityPercent, drought_index as droughtIndex, timestamp, tx_hash as txHash
        FROM weather_observations
        WHERE region_id = ?
        ORDER BY timestamp DESC
        LIMIT ?
      `);
      return stmt.all(reg, limit);
    } else {
      return this.memoryStore
        .filter((r) => r.regionId === reg)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    }
  }

  getAverageRainfall(regionId: string, windowSeconds: number = 86400 * 7): number | null {
    const reg = regionId.toUpperCase();
    const cutoff = Math.floor(Date.now() / 1000) - windowSeconds;

    if (this.db) {
      const stmt = this.db.prepare(`
        SELECT AVG(rainfall_mm) as avgRainfall
        FROM weather_observations
        WHERE region_id = ? AND timestamp >= ?
      `);
      const row = stmt.get(reg, cutoff);
      return row && row.avgRainfall !== null ? Math.round(row.avgRainfall) : null;
    } else {
      const valid = this.memoryStore.filter((r) => r.regionId === reg && r.timestamp >= cutoff);
      if (valid.length === 0) return null;
      const sum = valid.reduce((acc, curr) => acc + curr.rainfallMm, 0);
      return Math.round(sum / valid.length);
    }
  }
}
