import { describe, it, expect } from 'vitest';
import { HsmFailoverManager, HsmNode } from '../src/signer/hsmFailoverManager';

describe('HsmFailoverManager', () => {
  it('automatically falls over to secondary HSM node when primary fails', async () => {
    const manager = new HsmFailoverManager();

    let primaryAttempts = 0;
    const primaryNode: HsmNode = {
      nodeId: 'HSM-PRIMARY-01',
      name: 'Primary Nitro Enclave HSM',
      priority: 1,
      isHealthy: true,
      consecutiveFailures: 0,
      publicKey: 'G11111111111111111111111111111111111111111111111111111111',
      signHandler: async () => {
        primaryAttempts++;
        throw new Error('Hardware connection timeout');
      },
    };

    const secondaryNode: HsmNode = {
      nodeId: 'HSM-SECONDARY-02',
      name: 'Secondary CloudHSM',
      priority: 2,
      isHealthy: true,
      consecutiveFailures: 0,
      publicKey: 'G22222222222222222222222222222222222222222222222222222222',
      signHandler: async () => {
        return 'mock_signature_secondary_42';
      },
    };

    manager.registerNode(primaryNode);
    manager.registerNode(secondaryNode);

    // Initial signing attempt: primary fails, falls over to secondary
    const payload = Buffer.from('oracle_price_data');
    const result = await manager.signPayload(payload);

    expect(result.signedByNodeId).toBe('HSM-SECONDARY-02');
    expect(result.signature).toBe('mock_signature_secondary_42');
    expect(primaryAttempts).toBe(1);
  });

  it('records failover event in history when max failures threshold exceeded', () => {
    const manager = new HsmFailoverManager();
    const nodeA: HsmNode = {
      nodeId: 'NODE-A',
      name: 'Node A',
      priority: 1,
      isHealthy: true,
      consecutiveFailures: 0,
      publicKey: 'GA',
      signHandler: async () => 'sigA',
    };
    const nodeB: HsmNode = {
      nodeId: 'NODE-B',
      name: 'Node B',
      priority: 2,
      isHealthy: true,
      consecutiveFailures: 0,
      publicKey: 'GB',
      signHandler: async () => 'sigB',
    };

    manager.registerNode(nodeA);
    manager.registerNode(nodeB);

    manager.recordFailure('NODE-A', 'Err 1');
    manager.recordFailure('NODE-A', 'Err 2');
    expect(nodeA.isHealthy).toBe(true); // 2 failures < 3 max

    manager.recordFailure('NODE-A', 'Err 3'); // 3rd failure trips failover!
    expect(nodeA.isHealthy).toBe(false);

    const history = manager.getFailoverHistory();
    expect(history).toHaveLength(1);
    expect(history[0].fromNodeId).toBe('NODE-A');
    expect(history[0].toNodeId).toBe('NODE-B');
  });
});
