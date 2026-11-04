import { Keypair } from '@stellar/stellar-sdk';
import { OracleOperatorStakeRecord, OracleSlashEvent } from '@agriflow/types';

export interface OracleStakingConfig {
  contractId: string;
  rpcUrl?: string;
  networkPassphrase?: string;
}

export class OracleStakingClient {
  private config: OracleStakingConfig;
  private mockOperators: Map<string, OracleOperatorStakeRecord> = new Map();
  private totalStaked: number = 0;
  private minStake: number = 5000;
  private unbondingDelayLedgers: number = 17280;

  constructor(config: OracleStakingConfig) {
    if (!config.contractId || config.contractId.length < 56) {
      throw new Error(`Invalid Soroban contract ID: ${config.contractId}`);
    }
    this.config = config;
  }

  public registerOperator(
    operatorKeypair: Keypair,
    initialStake: number,
    currentLedger: number = 100000
  ): OracleOperatorStakeRecord {
    const address = operatorKeypair.publicKey();
    if (this.mockOperators.has(address)) {
      throw new Error(`Operator ${address} is already registered`);
    }
    if (initialStake < this.minStake) {
      throw new Error(`Initial stake ${initialStake} is below minimum requirement of ${this.minStake}`);
    }

    const record: OracleOperatorStakeRecord = {
      operatorAddress: address,
      stakedAmount: initialStake,
      unbondingAmount: 0,
      unbondReleaseLedger: 0,
      totalReports: 0,
      totalSlashed: 0,
      totalRewards: 0,
      isActive: true,
      registeredAtLedger: currentLedger,
    };

    this.mockOperators.set(address, record);
    this.totalStaked += initialStake;
    return record;
  }

  public depositStake(operatorKeypair: Keypair, amount: number): OracleOperatorStakeRecord {
    const address = operatorKeypair.publicKey();
    const op = this.mockOperators.get(address);
    if (!op) throw new Error(`Operator ${address} not found`);
    if (amount <= 0) throw new Error('Deposit amount must be positive');

    op.stakedAmount += amount;
    op.isActive = true;
    this.totalStaked += amount;
    return op;
  }

  public requestUnbond(
    operatorKeypair: Keypair,
    amount: number,
    currentLedger: number = 100000
  ): OracleOperatorStakeRecord {
    const address = operatorKeypair.publicKey();
    const op = this.mockOperators.get(address);
    if (!op) throw new Error(`Operator ${address} not found`);
    if (amount <= 0 || amount > op.stakedAmount) {
      throw new Error(`Invalid unbond amount: requested ${amount}, available ${op.stakedAmount}`);
    }

    op.stakedAmount -= amount;
    op.unbondingAmount += amount;
    op.unbondReleaseLedger = currentLedger + this.unbondingDelayLedgers;
    if (op.stakedAmount < this.minStake) {
      op.isActive = false;
    }
    this.totalStaked -= amount;
    return op;
  }

  public withdrawUnbonded(operatorKeypair: Keypair, currentLedger: number): number {
    const address = operatorKeypair.publicKey();
    const op = this.mockOperators.get(address);
    if (!op) throw new Error(`Operator ${address} not found`);
    if (op.unbondingAmount <= 0) throw new Error('No unbonding stake available');
    if (currentLedger < op.unbondReleaseLedger) {
      throw new Error(
        `Unbonding delay not matured: current ${currentLedger} < unlock ledger ${op.unbondReleaseLedger}`
      );
    }

    const withdrawn = op.unbondingAmount;
    op.unbondingAmount = 0;
    op.unbondReleaseLedger = 0;
    return withdrawn;
  }

  public slashOperator(
    adminKeypair: Keypair,
    operatorAddress: string,
    slashAmount: number,
    reason: string,
    currentLedger: number = 100000
  ): OracleSlashEvent {
    const op = this.mockOperators.get(operatorAddress);
    if (!op) throw new Error(`Operator ${operatorAddress} not found`);
    if (slashAmount <= 0) throw new Error('Slash amount must be positive');

    const actualSlash = Math.min(op.stakedAmount, slashAmount);
    op.stakedAmount -= actualSlash;
    op.totalSlashed += actualSlash;
    if (op.stakedAmount < this.minStake) {
      op.isActive = false;
    }
    this.totalStaked -= actualSlash;

    return {
      operatorAddress,
      slashedAmount: actualSlash,
      reason,
      ledger: currentLedger,
      timestamp: Date.now(),
    };
  }

  public rewardOperator(
    adminKeypair: Keypair,
    operatorAddress: string,
    rewardAmount: number
  ): OracleOperatorStakeRecord {
    const op = this.mockOperators.get(operatorAddress);
    if (!op) throw new Error(`Operator ${operatorAddress} not found`);
    if (rewardAmount <= 0) throw new Error('Reward amount must be positive');

    op.stakedAmount += rewardAmount;
    op.totalRewards += rewardAmount;
    op.totalReports += 1;
    this.totalStaked += rewardAmount;
    return op;
  }

  public getOperator(operatorAddress: string): OracleOperatorStakeRecord | undefined {
    return this.mockOperators.get(operatorAddress);
  }

  public getTotalStaked(): number {
    return this.totalStaked;
  }

  public isOperatorEligible(operatorAddress: string): boolean {
    const op = this.mockOperators.get(operatorAddress);
    return !!op && op.isActive && op.stakedAmount >= this.minStake;
  }
}
