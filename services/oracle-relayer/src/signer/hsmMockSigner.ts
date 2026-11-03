import { Keypair } from '@stellar/stellar-sdk';
import * as crypto from 'crypto';

export interface AuditLogEntry {
  index: number;
  keyVersion: number;
  operation: string;
  dataHash: string;
  previousHash: string;
  entryHash: string;
  timestamp: number;
}

export class HsmMockSigner {
  private keyVersions: Map<number, Keypair> = new Map();
  private currentVersion: number = 1;
  private auditLog: AuditLogEntry[] = [];

  constructor() {
    // Initialize initial key version 1
    const initialKey = Keypair.random();
    this.keyVersions.set(1, initialKey);
    this.recordAudit('INITIALIZE_HSM', initialKey.publicKey());
  }

  getCurrentKeyVersion(): number {
    return this.currentVersion;
  }

  getPublicKey(version: number = this.currentVersion): string {
    const kp = this.keyVersions.get(version);
    if (!kp) throw new Error(`HSM Key Version ${version} not found`);
    return kp.publicKey();
  }

  /**
   * Rotates to a new random Ed25519 keypair and archives previous version
   */
  rotateKey(): { newVersion: number; newPublicKey: string } {
    this.currentVersion += 1;
    const newKey = Keypair.random();
    this.keyVersions.set(this.currentVersion, newKey);
    this.recordAudit('KEY_ROTATION', newKey.publicKey());

    return {
      newVersion: this.currentVersion,
      newPublicKey: newKey.publicKey(),
    };
  }

  /**
   * Signs payload using current or specified key version and appends to hash-chained audit log
   */
  signPayload(data: any, version: number = this.currentVersion): {
    signatureBase64: string;
    keyVersion: number;
    publicKey: string;
    dataHash: string;
  } {
    const kp = this.keyVersions.get(version);
    if (!kp) throw new Error(`Key version ${version} not found in HSM`);

    const serialized = JSON.stringify(data);
    const dataHash = crypto.createHash('sha256').update(serialized).digest();
    const signature = kp.sign(dataHash);

    this.recordAudit('SIGN_PAYLOAD', dataHash.toString('hex'));

    return {
      signatureBase64: signature.toString('base64'),
      keyVersion: version,
      publicKey: kp.publicKey(),
      dataHash: dataHash.toString('hex'),
    };
  }

  private recordAudit(operation: string, dataHash: string): void {
    const index = this.auditLog.length;
    const previousHash = index === 0 ? 'GENESIS_HSM_BLOCK' : this.auditLog[index - 1].entryHash;
    const timestamp = Math.floor(Date.now() / 1000);

    const content = `${index}:${this.currentVersion}:${operation}:${dataHash}:${previousHash}:${timestamp}`;
    const entryHash = crypto.createHash('sha256').update(content).digest('hex');

    this.auditLog.push({
      index,
      keyVersion: this.currentVersion,
      operation,
      dataHash,
      previousHash,
      entryHash,
      timestamp,
    });
  }

  getAuditLog(): AuditLogEntry[] {
    return [...this.auditLog];
  }

  /**
   * Verifies the cryptographic integrity of the audit chain
   */
  verifyAuditIntegrity(): boolean {
    for (let i = 0; i < this.auditLog.length; i++) {
      const entry = this.auditLog[i];
      const expectedPrev = i === 0 ? 'GENESIS_HSM_BLOCK' : this.auditLog[i - 1].entryHash;

      if (entry.previousHash !== expectedPrev) {
        return false;
      }

      const content = `${entry.index}:${entry.keyVersion}:${entry.operation}:${entry.dataHash}:${entry.previousHash}:${entry.timestamp}`;
      const recomputedHash = crypto.createHash('sha256').update(content).digest('hex');

      if (entry.entryHash !== recomputedHash) {
        return false;
      }
    }
    return true;
  }
}
