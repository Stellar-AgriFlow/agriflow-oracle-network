import { createHash } from 'node:crypto';

export interface HsmNode {
  nodeId: string;
  name: string;
  priority: number; // 1 = highest
  isHealthy: boolean;
  consecutiveFailures: number;
  publicKey: string;
  signHandler: (payload: Buffer) => Promise<string>;
}

export interface FailoverEvent {
  timestamp: number;
  fromNodeId: string;
  toNodeId: string;
  reason: string;
}

export class HsmFailoverManager {
  private nodes: HsmNode[] = [];
  private failoverHistory: FailoverEvent[] = [];
  public static readonly MAX_FAILURES_BEFORE_FAILOVER = 3;

  public registerNode(node: HsmNode): void {
    const existing = this.nodes.find((n) => n.nodeId === node.nodeId);
    if (existing) {
      Object.assign(existing, node);
    } else {
      this.nodes.push(node);
      this.nodes.sort((a, b) => a.priority - b.priority);
    }
  }

  public getActiveNode(): HsmNode {
    const active = this.nodes.find((n) => n.isHealthy);
    if (!active) {
      throw new Error('All HSM signing nodes are unavailable (critical hardware failure)');
    }
    return active;
  }

  public recordFailure(nodeId: string, reason: string): void {
    const node = this.nodes.find((n) => n.nodeId === nodeId);
    if (!node) return;

    node.consecutiveFailures++;
    if (node.consecutiveFailures >= HsmFailoverManager.MAX_FAILURES_BEFORE_FAILOVER && node.isHealthy) {
      node.isHealthy = false;
      const nextActive = this.nodes.find((n) => n.isHealthy);
      this.failoverHistory.push({
        timestamp: Date.now(),
        fromNodeId: nodeId,
        toNodeId: nextActive ? nextActive.nodeId : 'NONE',
        reason,
      });
    }
  }

  public recordSuccess(nodeId: string): void {
    const node = this.nodes.find((n) => n.nodeId === nodeId);
    if (node) {
      node.consecutiveFailures = 0;
      node.isHealthy = true;
    }
  }

  public async signPayload(payload: Buffer): Promise<{ signature: string; signedByNodeId: string }> {
    const availableNodes = this.nodes.filter((n) => n.isHealthy);
    if (availableNodes.length === 0) {
      throw new Error('No healthy HSM signer available');
    }

    let lastError: Error | null = null;

    for (const node of availableNodes) {
      try {
        const signature = await node.signHandler(payload);
        this.recordSuccess(node.nodeId);
        return {
          signature,
          signedByNodeId: node.nodeId,
        };
      } catch (err: any) {
        lastError = err;
        this.recordFailure(node.nodeId, err.message || 'Signing failed');
      }
    }

    throw new Error(`Failover signing exhausted: ${lastError?.message || 'all attempts failed'}`);
  }

  public getFailoverHistory(): FailoverEvent[] {
    return [...this.failoverHistory];
  }

  public getAllNodes(): HsmNode[] {
    return [...this.nodes];
  }
}
