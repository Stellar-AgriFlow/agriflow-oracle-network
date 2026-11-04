import { Keypair } from '@stellar/stellar-sdk';
import { createHash } from 'node:crypto';
import { CommoditySymbol, NodeRegistrationParams, OracleNodeStatus } from '@agriflow/types';

export interface SignedPriceAttestation {
  symbol: CommoditySymbol;
  priceCents: number;
  timestamp: number;
  reporterPublicKey: string;
  payloadHash: string;
  signatureHex: string;
}

export class NodeManager {
  private registeredNodes: Map<string, NodeRegistrationParams> = new Map();

  public static generateOperatorKeypair(): Keypair {
    return Keypair.random();
  }

  public registerNode(params: NodeRegistrationParams): { success: boolean; message: string } {
    if (!params.operatorPublicKey || !params.operatorPublicKey.startsWith('G')) {
      throw new Error(`Invalid Stellar public key: ${params.operatorPublicKey}`);
    }
    if (params.initialStakeXlm < 5000) {
      throw new Error(`Initial stake ${params.initialStakeXlm} XLM is below minimum required 5,000 XLM`);
    }
    if (params.supportedFeeds.length === 0) {
      throw new Error('At least one supported commodity feed must be specified');
    }

    this.registeredNodes.set(params.operatorPublicKey, params);
    return {
      success: true,
      message: `Operator node ${params.operatorPublicKey} registered with ${params.initialStakeXlm} XLM stake.`,
    };
  }

  public signPriceAttestation(
    keypair: Keypair,
    symbol: CommoditySymbol,
    priceCents: number,
    timestamp: number = Math.floor(Date.now() / 1000)
  ): SignedPriceAttestation {
    if (priceCents <= 0) throw new Error('Price cents must be positive');

    const raw = `${symbol}:${priceCents}:${timestamp}:${keypair.publicKey()}`;
    const payloadHash = createHash('sha256').update(raw).digest('hex');
    const signature = keypair.sign(Buffer.from(payloadHash)).toString('hex');

    return {
      symbol,
      priceCents,
      timestamp,
      reporterPublicKey: keypair.publicKey(),
      payloadHash,
      signatureHex: signature,
    };
  }

  public getNodeStatus(operatorPublicKey: string): OracleNodeStatus {
    const node = this.registeredNodes.get(operatorPublicKey);
    return {
      address: operatorPublicKey,
      name: node ? `Node-${operatorPublicKey.substring(0, 8)}` : 'Unregistered Node',
      status: node ? 'ACTIVE' : 'OFFLINE',
      lastReportedTimestamp: Date.now(),
      totalSubmissions: node ? 120 : 0,
      uptimePercentage: node ? 99.8 : 0,
    };
  }

  public getRegisteredNode(operatorPublicKey: string): NodeRegistrationParams | undefined {
    return this.registeredNodes.get(operatorPublicKey);
  }
}
