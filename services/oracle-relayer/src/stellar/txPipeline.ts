import {
  rpc,
  Transaction,
  Keypair,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

export interface TxPipelineConfig {
  rpcUrl: string;
  networkPassphrase: string;
}

export interface SimulationSummary {
  isSuccess: boolean;
  minResourceFee: string;
  error?: string;
}

export class SorobanTransactionPipeline {
  private server: rpc.Server;
  private networkPassphrase: string;

  constructor(config: TxPipelineConfig) {
    this.server = new rpc.Server(config.rpcUrl);
    this.networkPassphrase = config.networkPassphrase;
  }

  /**
   * Simulates a transaction against the Soroban RPC node and prepares resource fees
   */
  async simulateAndAssemble(tx: Transaction): Promise<{
    transaction: Transaction;
    simulation: SimulationSummary;
  }> {
    const simResponse = await this.server.simulateTransaction(tx);

    if (rpc.Api.isSimulationError(simResponse)) {
      return {
        transaction: tx,
        simulation: {
          isSuccess: false,
          minResourceFee: '0',
          error: simResponse.error,
        },
      };
    }

    if (!rpc.Api.isSimulationSuccess(simResponse)) {
      return {
        transaction: tx,
        simulation: {
          isSuccess: false,
          minResourceFee: '0',
          error: 'Simulation did not succeed',
        },
      };
    }

    // Assemble transaction with simulation footprint and minimum resource fee
    const assembledTx = rpc.assembleTransaction(tx, simResponse).build();

    return {
      transaction: assembledTx,
      simulation: {
        isSuccess: true,
        minResourceFee: simResponse.minResourceFee || '0',
      },
    };
  }

  /**
   * Submits a signed Soroban transaction to the network
   */
  async submitTransaction(signedTx: Transaction): Promise<rpc.Api.SendTransactionResponse> {
    return this.server.sendTransaction(signedTx);
  }

  /**
   * Polls Soroban RPC getTransaction until status is SUCCESS, FAILED, or NOT_FOUND
   */
  async pollTransactionStatus(
    txHash: string,
    maxWaitMs: number = 30000,
    pollIntervalMs: number = 1000
  ): Promise<rpc.Api.GetTransactionResponse> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const response = await this.server.getTransaction(txHash);
      if (response.status !== rpc.Api.GetTransactionStatus.NOT_FOUND) {
        return response;
      }
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error(`Timeout waiting for Soroban transaction ${txHash} confirmation`);
  }
}
