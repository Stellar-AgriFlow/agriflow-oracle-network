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
});
