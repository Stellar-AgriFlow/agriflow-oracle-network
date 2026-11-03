export interface VolatilityRule {
  maxDeltaPercent: number; // e.g. 15 = 15%
  windowSeconds: number; // e.g. 60s
  cooldownSeconds: number; // e.g. 180s
}

export interface BreakerState {
  status: 'NORMAL' | 'TRIPPED';
  lastPrice: number;
  lastUpdated: number;
  trippedUntil?: number;
  tripReason?: string;
}

export class OracleCircuitBreaker {
  private states: Map<string, BreakerState> = new Map();
  private rule: VolatilityRule;

  constructor(rule?: Partial<VolatilityRule>) {
    this.rule = {
      maxDeltaPercent: rule?.maxDeltaPercent ?? 15,
      windowSeconds: rule?.windowSeconds ?? 60,
      cooldownSeconds: rule?.cooldownSeconds ?? 180,
    };
  }

  /**
   * Evaluates if an incoming commodity price report triggers the circuit breaker
   */
  evaluatePrice(
    commodity: string,
    newPrice: number,
    now: number = Math.floor(Date.now() / 1000)
  ): { allowed: boolean; reason?: string } {
    const state = this.states.get(commodity);

    if (!state) {
      // First price observation, initialize state
      this.states.set(commodity, {
        status: 'NORMAL',
        lastPrice: newPrice,
        lastUpdated: now,
      });
      return { allowed: true };
    }

    // Check if currently tripped
    if (state.status === 'TRIPPED') {
      if (now < (state.trippedUntil || 0)) {
        return {
          allowed: false,
          reason: `Circuit breaker active until timestamp ${state.trippedUntil}. ${state.tripReason}`,
        };
      } else {
        // Cooldown passed, reset
        state.status = 'NORMAL';
        state.trippedUntil = undefined;
        state.tripReason = undefined;
      }
    }

    // Check price delta within window
    const elapsed = now - state.lastUpdated;
    if (elapsed <= this.rule.windowSeconds && state.lastPrice > 0) {
      const deltaPercent = (Math.abs(newPrice - state.lastPrice) / state.lastPrice) * 100;
      if (deltaPercent > this.rule.maxDeltaPercent) {
        state.status = 'TRIPPED';
        state.trippedUntil = now + this.rule.cooldownSeconds;
        state.tripReason = `Price moved by ${deltaPercent.toFixed(1)}% in ${elapsed}s (threshold: ${this.rule.maxDeltaPercent}%)`;
        this.states.set(commodity, state);
        return { allowed: false, reason: state.tripReason };
      }
    }

    // Normal update
    state.lastPrice = newPrice;
    state.lastUpdated = now;
    this.states.set(commodity, state);
    return { allowed: true };
  }

  getBreakerState(commodity: string): BreakerState | undefined {
    return this.states.get(commodity);
  }

  reset(commodity: string): void {
    this.states.delete(commodity);
  }
}
