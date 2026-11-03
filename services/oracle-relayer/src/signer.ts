import { Keypair } from '@stellar/stellar-sdk';

export interface RelayerSignerConfig {
  secretKey?: string;
  defaultBaseFeeStroops?: number;
}

export class RelayerSigner {
  private keypair: Keypair;
  private defaultBaseFeeStroops: number;

  constructor(config?: RelayerSignerConfig) {
    if (config?.secretKey) {
      this.keypair = Keypair.fromSecret(config.secretKey);
    } else {
      // Ephemeral or test fallback keypair
      this.keypair = Keypair.random();
    }
    this.defaultBaseFeeStroops = config?.defaultBaseFeeStroops || 100;
  }

  getPublicKey(): string {
    return this.keypair.publicKey();
  }

  getKeypair(): Keypair {
    return this.keypair;
  }

  /**
   * Estimates appropriate transaction fee with optional congestion multiplier
   */
  estimateFee(multiplier: number = 1.0): number {
    return Math.max(100, Math.round(this.defaultBaseFeeStroops * multiplier));
  }

  /**
   * Signs arbitrary transaction message payload
   */
  sign(data: Buffer): Buffer {
    return this.keypair.sign(data);
  }
}
