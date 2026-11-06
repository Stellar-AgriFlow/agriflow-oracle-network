import { Keypair } from '@stellar/stellar-sdk';
import * as crypto from 'crypto';

export interface SignedPayload {
  payloadHash: string;
  signatureBase64: string;
  reporterPublicKey: string;
  timestamp: number;
}

export class ReporterPayloadSigner {
  private keypair: Keypair;

  constructor(secretKey: string) {
    this.keypair = Keypair.fromSecret(secretKey);
  }

  getPublicKey(): string {
    return this.keypair.publicKey();
  }

  static canonicalize(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(ReporterPayloadSigner.canonicalize);
    }
    const sortedKeys = Object.keys(obj).sort();
    const result: Record<string, any> = {};
    for (const key of sortedKeys) {
      result[key] = ReporterPayloadSigner.canonicalize(obj[key]);
    }
    return result;
  }

  /**
   * Generates SHA-256 hash of any arbitrary JSON-serializable payload
   */
  static hashPayload(data: any): Buffer {
    const canonical = ReporterPayloadSigner.canonicalize(data);
    const serialized = JSON.stringify(canonical);
    return crypto.createHash('sha256').update(serialized).digest();
  }

  /**
   * Signs a payload with the reporter Ed25519 keypair
   */
  sign(data: any): SignedPayload {
    const hash = ReporterPayloadSigner.hashPayload(data);
    const signature = this.keypair.sign(hash);
    const timestamp = Math.floor(Date.now() / 1000);

    return {
      payloadHash: hash.toString('hex'),
      signatureBase64: signature.toString('base64'),
      reporterPublicKey: this.keypair.publicKey(),
      timestamp,
    };
  }

  /**
   * Verifies the authenticity and cryptographic signature of a payload
   */
  static verify(data: any, signedPayload: SignedPayload): boolean {
    try {
      const computedHash = ReporterPayloadSigner.hashPayload(data);
      if (computedHash.toString('hex') !== signedPayload.payloadHash) {
        return false;
      }

      const keypair = Keypair.fromPublicKey(signedPayload.reporterPublicKey);
      const signatureBuffer = Buffer.from(signedPayload.signatureBase64, 'base64');
      return keypair.verify(computedHash, signatureBuffer);
    } catch {
      return false;
    }
  }
}
