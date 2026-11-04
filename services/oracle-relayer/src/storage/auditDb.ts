import { createHash } from 'node:crypto';

export interface AuditLogEntry {
  id?: number;
  keyId: string;
  payloadHash: string;
  signatureHex: string;
  signerPublicKey: string;
  action: 'RELAY_PRICE' | 'RELAY_WEATHER' | 'TRIGGER_PAYOUT' | 'EMERGENCY_HALT' | 'BUMP_FEE';
  prevHash: string;
  entryHash?: string;
  timestamp: number;
}

export class AuditStorage {
  private db: any;
  private memoryStore: AuditLogEntry[] = [];
  private lastHash = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor(dbPath: string = ':memory:') {
    try {
      const { DatabaseSync } = require('node:sqlite');
      this.db = new DatabaseSync(dbPath);
      this.initSchema();
      this.loadLastHash();
    } catch {
      this.db = null;
      this.memoryStore = [];
    }
  }

  private initSchema(): void {
    if (!this.db) return;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_id TEXT NOT NULL,
        payload_hash TEXT NOT NULL,
        signature_hex TEXT NOT NULL,
        signer_public_key TEXT NOT NULL,
        action TEXT NOT NULL,
        prev_hash TEXT NOT NULL,
        entry_hash TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_audit_key_time ON audit_logs (key_id, timestamp DESC);
    `);
  }

  private loadLastHash(): void {
    if (!this.db) return;
    const stmt = this.db.prepare(`SELECT entry_hash FROM audit_logs ORDER BY id DESC LIMIT 1`);
    const row = stmt.get();
    if (row && row.entry_hash) {
      this.lastHash = row.entry_hash;
    }
  }

  private computeEntryHash(entry: Omit<AuditLogEntry, 'entryHash' | 'id'>): string {
    const raw = `${entry.prevHash}:${entry.keyId}:${entry.payloadHash}:${entry.signatureHex}:${entry.action}:${entry.timestamp}`;
    return createHash('sha256').update(raw).digest('hex');
  }

  appendAuditEntry(entry: Omit<AuditLogEntry, 'entryHash' | 'prevHash' | 'id'>): AuditLogEntry {
    const prevHash = this.lastHash;
    const entryHash = this.computeEntryHash({ ...entry, prevHash });
    const fullEntry: AuditLogEntry = {
      ...entry,
      prevHash,
      entryHash,
    };

    if (this.db) {
      const stmt = this.db.prepare(`
        INSERT INTO audit_logs (key_id, payload_hash, signature_hex, signer_public_key, action, prev_hash, entry_hash, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        fullEntry.keyId,
        fullEntry.payloadHash,
        fullEntry.signatureHex,
        fullEntry.signerPublicKey,
        fullEntry.action,
        fullEntry.prevHash,
        fullEntry.entryHash,
        fullEntry.timestamp
      );
      fullEntry.id = Number(result.lastInsertRowid);
    } else {
      fullEntry.id = this.memoryStore.length + 1;
      this.memoryStore.push(fullEntry);
    }

    this.lastHash = entryHash;
    return fullEntry;
  }

  getAuditHistory(keyId?: string, limit = 50): AuditLogEntry[] {
    if (this.db) {
      let query = `SELECT * FROM audit_logs`;
      const params: any[] = [];
      if (keyId) {
        query += ` WHERE key_id = ?`;
        params.push(keyId);
      }
      query += ` ORDER BY id ASC LIMIT ?`;
      params.push(limit);

      const rows = this.db.prepare(query).all(...params);
      return rows.map((r: any) => ({
        id: r.id,
        keyId: r.key_id,
        payloadHash: r.payload_hash,
        signatureHex: r.signature_hex,
        signerPublicKey: r.signer_public_key,
        action: r.action,
        prevHash: r.prev_hash,
        entryHash: r.entry_hash,
        timestamp: r.timestamp,
      }));
    } else {
      let list = this.memoryStore;
      if (keyId) {
        list = list.filter((e) => e.keyId === keyId);
      }
      return list.slice(0, limit);
    }
  }

  verifyChainIntegrity(): { valid: boolean; invalidEntryIndex?: number } {
    const logs = this.getAuditHistory(undefined, 10000);
    let currentPrev = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < logs.length; i++) {
      const entry = logs[i];
      if (entry.prevHash !== currentPrev) {
        return { valid: false, invalidEntryIndex: i };
      }
      const expectedHash = this.computeEntryHash({
        keyId: entry.keyId,
        payloadHash: entry.payloadHash,
        signatureHex: entry.signatureHex,
        signerPublicKey: entry.signerPublicKey,
        action: entry.action,
        prevHash: entry.prevHash,
        timestamp: entry.timestamp,
      });
      if (entry.entryHash !== expectedHash) {
        return { valid: false, invalidEntryIndex: i };
      }
      currentPrev = entry.entryHash;
    }

    return { valid: true };
  }
}
