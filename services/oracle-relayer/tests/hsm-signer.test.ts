import { describe, it, expect } from 'vitest';
import { HsmMockSigner } from '../src/signer/hsmMockSigner';

describe('HsmMockSigner Key Rotation & Audit Chain', () => {
  it('manages key versioning and generates distinct keys on rotation', () => {
    const hsm = new HsmMockSigner();
    expect(hsm.getCurrentKeyVersion()).toBe(1);
    const pubV1 = hsm.getPublicKey(1);

    const rotation = hsm.rotateKey();
    expect(rotation.newVersion).toBe(2);
    expect(hsm.getCurrentKeyVersion()).toBe(2);
    expect(rotation.newPublicKey).not.toBe(pubV1);

    // Can still retrieve v1 public key
    expect(hsm.getPublicKey(1)).toBe(pubV1);
  });

  it('signs payload and creates valid tamper-evident audit log entries', () => {
    const hsm = new HsmMockSigner();
    const payload = { commodity: 'WHEAT', price: 215, timestamp: 1700000000 };

    const sig = hsm.signPayload(payload);
    expect(sig.keyVersion).toBe(1);
    expect(sig.signatureBase64.length).toBeGreaterThan(20);

    const auditLog = hsm.getAuditLog();
    expect(auditLog.length).toBeGreaterThan(1); // Genesis + Sign
    expect(hsm.verifyAuditIntegrity()).toBe(true);
  });

  it('detects tampering when an audit log entry is maliciously modified', () => {
    const hsm = new HsmMockSigner();
    hsm.signPayload({ price: 100 });
    hsm.rotateKey();
    hsm.signPayload({ price: 200 });

    expect(hsm.verifyAuditIntegrity()).toBe(true);

    // Maliciously tamper with an audit entry in the log
    const log = (hsm as any).auditLog;
    log[1].dataHash = '0000000000000000000000000000000000000000000000000000000000000000';

    expect(hsm.verifyAuditIntegrity()).toBe(false);
  });
});
