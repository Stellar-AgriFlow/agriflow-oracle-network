import { describe, it, expect } from 'vitest';
import { NodeManager } from '../src/nodeManager';
import { runCli } from '../src/index';

describe('NodeManager & CLI', () => {
  it('generates keypair, registers node with stake, and produces status', () => {
    const keypair = NodeManager.generateOperatorKeypair();
    const manager = new NodeManager();

    const reg = manager.registerNode({
      operatorPublicKey: keypair.publicKey(),
      initialStakeXlm: 10000,
      supportedFeeds: ['MAIZE', 'WHEAT', 'SOYBEANS'],
      regionCodes: ['KE_RIFT', 'NG_KANO'],
      hsmEndpoint: 'https://hsm1.internal:8443',
    });

    expect(reg.success).toBe(true);
    expect(reg.message).toContain('10000 XLM');

    const status = manager.getNodeStatus(keypair.publicKey());
    expect(status.status).toBe('ACTIVE');
    expect(status.uptimePercentage).toBeGreaterThan(99);
  });

  it('signs price attestation with valid cryptographic hash and signature', () => {
    const keypair = NodeManager.generateOperatorKeypair();
    const manager = new NodeManager();

    const attestation = manager.signPriceAttestation(keypair, 'COCOA', 792000, 1700000000);

    expect(attestation.symbol).toBe('COCOA');
    expect(attestation.priceCents).toBe(792000);
    expect(attestation.reporterPublicKey).toBe(keypair.publicKey());
    expect(attestation.payloadHash).toHaveLength(64);
    expect(attestation.signatureHex).toBeDefined();
  });

  it('rejects registration with insufficient stake', () => {
    const keypair = NodeManager.generateOperatorKeypair();
    const manager = new NodeManager();

    expect(() => {
      manager.registerNode({
        operatorPublicKey: keypair.publicKey(),
        initialStakeXlm: 2000, // < 5000 min
        supportedFeeds: ['MAIZE'],
        regionCodes: ['KE_RIFT'],
      });
    }).toThrow(/below minimum required/);
  });

  it('handles basic CLI help and version output', () => {
    const help = runCli(['help']);
    expect(help).toContain('AgriFlow Oracle Node CLI');

    const version = runCli(['version']);
    expect(version).toContain('agriflow-node v0.1.0');
  });
});
