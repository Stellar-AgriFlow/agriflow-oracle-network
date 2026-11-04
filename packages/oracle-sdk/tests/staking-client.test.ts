import { describe, it, expect } from 'vitest';
import { Keypair } from '@stellar/stellar-sdk';
import { OracleStakingClient } from '../src/stakingClient';

describe('OracleStakingClient', () => {
  const contractId = 'C' + 'A'.repeat(55);
  const admin = Keypair.random();
  const operator = Keypair.random();

  it('registers operator with initial stake and handles deposit', () => {
    const client = new OracleStakingClient({ contractId });

    const record = client.registerOperator(operator, 10000);
    expect(record.operatorAddress).toBe(operator.publicKey());
    expect(record.stakedAmount).toBe(10000);
    expect(record.isActive).toBe(true);
    expect(client.getTotalStaked()).toBe(10000);
    expect(client.isOperatorEligible(operator.publicKey())).toBe(true);

    const updated = client.depositStake(operator, 5000);
    expect(updated.stakedAmount).toBe(15000);
    expect(client.getTotalStaked()).toBe(15000);
  });

  it('manages unbonding lifecycle and enforces delay', () => {
    const client = new OracleStakingClient({ contractId });
    client.registerOperator(operator, 12000, 100000);

    const unbond = client.requestUnbond(operator, 4000, 100000);
    expect(unbond.stakedAmount).toBe(8000);
    expect(unbond.unbondingAmount).toBe(4000);
    expect(unbond.unbondReleaseLedger).toBe(117280);

    // Try withdraw before unlock
    expect(() => {
      client.withdrawUnbonded(operator, 110000);
    }).toThrow(/Unbonding delay not matured/);

    // Withdraw after unlock
    const withdrawn = client.withdrawUnbonded(operator, 117280);
    expect(withdrawn).toBe(4000);
  });

  it('slashes operator and deactivates if below minimum threshold', () => {
    const client = new OracleStakingClient({ contractId });
    client.registerOperator(operator, 6000);

    const slashEvent = client.slashOperator(
      admin,
      operator.publicKey(),
      2000,
      'Price report deviated > 3x MAD'
    );
    expect(slashEvent.slashedAmount).toBe(2000);
    expect(slashEvent.reason).toContain('MAD');

    const op = client.getOperator(operator.publicKey());
    expect(op?.stakedAmount).toBe(4000); // 4000 < 5000 min stake
    expect(op?.isActive).toBe(false);
    expect(client.isOperatorEligible(operator.publicKey())).toBe(false);
  });

  it('rewards operator and increments report statistics', () => {
    const client = new OracleStakingClient({ contractId });
    client.registerOperator(operator, 8000);

    client.rewardOperator(admin, operator.publicKey(), 300);
    const op = client.getOperator(operator.publicKey());
    expect(op?.stakedAmount).toBe(8300);
    expect(op?.totalRewards).toBe(300);
    expect(op?.totalReports).toBe(1);
  });
});
