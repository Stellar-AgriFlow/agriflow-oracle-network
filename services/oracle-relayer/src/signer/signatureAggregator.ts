import { createHash } from 'node:crypto';

export interface OracleAttestation {
  oracleId: string;
  publicKey: string;
  payloadHash: string;
  signatureHex: string;
  timestamp: number;
}

export interface AggregatedAttestationBundle {
  payloadHash: string;
  consensusPrice: number;
  totalSignatures: number;
  requiredSignatures: number;
  isThresholdMet: boolean;
  signers: string[];
  compositeProofHex: string;
}

export class SignatureAggregator {
  private threshold: number;
  private attestations: Map<string, OracleAttestation[]> = new Map();

  constructor(threshold: number = 3) {
    if (threshold < 1) {
      throw new Error('Threshold must be at least 1');
    }
    this.threshold = threshold;
  }

  public registerAttestation(attestation: OracleAttestation): number {
    const list = this.attestations.get(attestation.payloadHash) || [];

    // Avoid duplicate votes from same oracle for identical payload
    const existingIndex = list.findIndex((a) => a.oracleId === attestation.oracleId);
    if (existingIndex >= 0) {
      list[existingIndex] = attestation;
    } else {
      list.push(attestation);
    }

    this.attestations.set(attestation.payloadHash, list);
    return list.length;
  }

  public compileBundle(payloadHash: string, consensusPrice: number): AggregatedAttestationBundle {
    const list = this.attestations.get(payloadHash) || [];
    const isThresholdMet = list.length >= this.threshold;

    // Deterministically sort by oracleId to generate canonical proof
    const sorted = [...list].sort((a, b) => a.oracleId.localeCompare(b.oracleId));
    const signers = sorted.map((a) => a.publicKey);

    // Compute composite proof by hashing concatenation of all individual signatures
    const rawConcat = sorted.map((a) => a.signatureHex).join(':');
    const compositeProofHex = createHash('sha256').update(rawConcat).digest('hex');

    return {
      payloadHash,
      consensusPrice,
      totalSignatures: list.length,
      requiredSignatures: this.threshold,
      isThresholdMet,
      signers,
      compositeProofHex,
    };
  }

  public clear(payloadHash?: string): void {
    if (payloadHash) {
      this.attestations.delete(payloadHash);
    } else {
      this.attestations.clear();
    }
  }
}
