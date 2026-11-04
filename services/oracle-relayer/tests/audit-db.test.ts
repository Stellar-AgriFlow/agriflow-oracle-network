import { describe, it, expect } from 'vitest';
import { AuditStorage } from '../src/storage/auditDb';

describe('AuditStorage', () => {
  it('appends audit log entries with verified hash chaining', () => {
    const storage = new AuditStorage(':memory:');

    const entry1 = storage.appendAuditEntry({
      keyId: 'HSM-KEY-PRIMARY-001',
      payloadHash: 'abc1234567890',
      signatureHex: 'deadbeef11223344',
      signerPublicKey: 'GBBCOOPFARMER89712KLSADJFOEWIRUDKL',
      action: 'RELAY_PRICE',
      timestamp: 1700000000,
    });

    expect(entry1.prevHash).toBe('0000000000000000000000000000000000000000000000000000000000000000');
    expect(entry1.entryHash).toBeDefined();

    const entry2 = storage.appendAuditEntry({
      keyId: 'HSM-KEY-PRIMARY-001',
      payloadHash: 'cde9876543210',
      signatureHex: 'feebdaed44332211',
      signerPublicKey: 'GBBCOOPFARMER89712KLSADJFOEWIRUDKL',
      action: 'TRIGGER_PAYOUT',
      timestamp: 1700000050,
    });

    expect(entry2.prevHash).toBe(entry1.entryHash);

    const check = storage.verifyChainIntegrity();
    expect(check.valid).toBe(true);
  });

  it('filters audit records by keyId', () => {
    const storage = new AuditStorage(':memory:');
    storage.appendAuditEntry({
      keyId: 'KEY-ALPHA',
      payloadHash: 'p1',
      signatureHex: 's1',
      signerPublicKey: 'G1',
      action: 'RELAY_PRICE',
      timestamp: 1700000100,
    });

    storage.appendAuditEntry({
      keyId: 'KEY-BETA',
      payloadHash: 'p2',
      signatureHex: 's2',
      signerPublicKey: 'G2',
      action: 'RELAY_WEATHER',
      timestamp: 1700000200,
    });

    const alphaHistory = storage.getAuditHistory('KEY-ALPHA');
    expect(alphaHistory).toHaveLength(1);
    expect(alphaHistory[0].action).toBe('RELAY_PRICE');
  });
});
