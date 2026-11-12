import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Oracle Consensus & Operator Documentation', () => {
  const docsDir = path.resolve(__dirname, '../docs');

  it('validates ORACLE_CONSENSUS.md specifies 10% outlier variance and TWAP math', () => {
    const filePath = path.join(docsDir, 'ORACLE_CONSENSUS.md');
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('10% allowable maximum variance');
    expect(content).toContain('Time-Weighted Average Price (TWAP)');
    expect(content).toContain('Drought Stress Index');
  });

  it('validates OPERATOR_GUIDE.md specifies Prometheus metrics and health endpoints', () => {
    const filePath = path.join(docsDir, 'OPERATOR_GUIDE.md');
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('GET /health');
    expect(content).toContain('GET /metrics');
    expect(content).toContain('docker run -d --name oracle-node');
  });

  it('validates ARCHITECTURE.md defines system layers and all 3 Soroban contracts', () => {
    const filePath = path.join(docsDir, 'ARCHITECTURE.md');
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('AgriPriceFeedContract');
    expect(content).toContain('WeatherRiskOracleContract');
    expect(content).toContain('OracleStakingContract');
  });

  it('validates SECURITY_MODEL.md details threat taxonomy and mitigations', () => {
    const filePath = path.join(docsDir, 'SECURITY_MODEL.md');
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('Flash Crash / Feed Spoofing');
    expect(content).toContain('Sybil Node Quorum Hijack');
    expect(content).toContain('17,280-ledger unbonding queue');
  });

  it('validates DEPLOYMENT_PLAYBOOK.md provides Docker and CLI commands', () => {
    const filePath = path.join(docsDir, 'DEPLOYMENT_PLAYBOOK.md');
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('docker compose up -d');
    expect(content).toContain('agriflow-node register');
    expect(content).toContain('http://localhost:9090/healthz');
  });

  it('validates EVENTS.md documents all emitted contract event symbols and topics', () => {
    const filePath = path.join(docsDir, 'EVENTS.md');
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('stk_reg');
    expect(content).toContain('stk_dep');
    expect(content).toContain('unb_req');
    expect(content).toContain('price_upd');
    expect(content).toContain('w_update');
    expect(content).toContain('w_init');
    expect(content).toContain('stk_slh');
    expect(content).toContain('AgriPriceFeedContract Events');
  });
});
