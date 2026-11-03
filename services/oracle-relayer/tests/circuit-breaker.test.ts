import { describe, it, expect } from 'vitest';
import { OracleCircuitBreaker } from '../src/circuitBreaker';

describe('Oracle Circuit Breaker', () => {
  const baseTime = 1700000000;

  it('allows price changes within volatility limits', () => {
    const breaker = new OracleCircuitBreaker({ maxDeltaPercent: 15, windowSeconds: 60 });

    const first = breaker.evaluatePrice('WHEAT', 200, baseTime);
    expect(first.allowed).toBe(true);

    // 5% increase in 30s -> allowed
    const second = breaker.evaluatePrice('WHEAT', 210, baseTime + 30);
    expect(second.allowed).toBe(true);
  });

  it('trips when price spike exceeds delta threshold within window', () => {
    const breaker = new OracleCircuitBreaker({
      maxDeltaPercent: 15,
      windowSeconds: 60,
      cooldownSeconds: 180,
    });

    breaker.evaluatePrice('MAIZE', 100, baseTime);

    // 25% spike in 10s -> trips!
    const res = breaker.evaluatePrice('MAIZE', 125, baseTime + 10);
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('25.0% in 10s');

    const state = breaker.getBreakerState('MAIZE');
    expect(state?.status).toBe('TRIPPED');
    expect(state?.trippedUntil).toBe(baseTime + 10 + 180);
  });

  it('blocks submissions during cooldown and resets once cooldown has passed', () => {
    const breaker = new OracleCircuitBreaker({
      maxDeltaPercent: 15,
      windowSeconds: 60,
      cooldownSeconds: 180,
    });

    breaker.evaluatePrice('SOY', 100, baseTime);
    breaker.evaluatePrice('SOY', 130, baseTime + 10); // Trips!

    // During cooldown at t = baseTime + 100
    const blocked = breaker.evaluatePrice('SOY', 105, baseTime + 100);
    expect(blocked.allowed).toBe(false);

    // After cooldown at t = baseTime + 200
    const allowed = breaker.evaluatePrice('SOY', 105, baseTime + 200);
    expect(allowed.allowed).toBe(true);
  });
});
