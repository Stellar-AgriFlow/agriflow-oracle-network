import { describe, it, expect } from 'vitest';
import { SignatureAggregator, OracleAttestation } from '../src/signer/signatureAggregator';

describe('SignatureAggregator', () => {
  const payloadHash = 'hash_maize_usd_cents_2450';

  it('aggregates attestations and verifies threshold quorum', () => {
    const aggregator = new SignatureAggregator(3);

    const att1: OracleAttestation = {
      oracleId: 'node-1',
      publicKey: 'GBBCOOPFARMER89712KLSADJFOEWIRUDKL',
      payloadHash,
      signatureHex: 'deadbeef11',
      timestamp: 1700000001,
    };
    const att2: OracleAttestation = {
      oracleId: 'node-2',
      publicKey: 'GDMILLER32491OKLNASDUFHWENLKSDFKLJ',
      payloadHash,
      signatureHex: 'deadbeef22',
      timestamp: 1700000002,
    };
    const att3: OracleAttestation = {
      oracleId: 'node-3',
      publicKey: 'GCORGFARMER555KLSADJFOEWIRUDKL99',
      payloadHash,
      signatureHex: 'deadbeef33',
      timestamp: 1700000003,
    };

    aggregator.registerAttestation(att1);
    const step1 = aggregator.compileBundle(payloadHash, 2450);
    expect(step1.isThresholdMet).toBe(false);
    expect(step1.totalSignatures).toBe(1);

    aggregator.registerAttestation(att2);
    aggregator.registerAttestation(att3);

    const finalBundle = aggregator.compileBundle(payloadHash, 2450);
    expect(finalBundle.isThresholdMet).toBe(true);
    expect(finalBundle.totalSignatures).toBe(3);
    expect(finalBundle.signers).toHaveLength(3);
    expect(finalBundle.compositeProofHex).toHaveLength(64);
  });

  it('deduplicates duplicate submissions from the same oracleId', () => {
    const aggregator = new SignatureAggregator(2);
    aggregator.registerAttestation({
      oracleId: 'node-1',
      publicKey: 'G1',
      payloadHash,
      signatureHex: 'sig1',
      timestamp: 1,
    });
    aggregator.registerAttestation({
      oracleId: 'node-1',
      publicKey: 'G1',
      payloadHash,
      signatureHex: 'sig1_updated',
      timestamp: 2,
    });

    const bundle = aggregator.compileBundle(payloadHash, 2450);
    expect(bundle.totalSignatures).toBe(1);
    expect(bundle.isThresholdMet).toBe(false);
  });
});
