import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('GitHub Actions CI/CD Workflows', () => {
  const workflowsDir = path.resolve(__dirname, '../.github/workflows');

  it('validates ci.yml, oracle-ci.yml, and security-audit.yml exist', () => {
    expect(fs.existsSync(path.join(workflowsDir, 'ci.yml'))).toBe(true);
    expect(fs.existsSync(path.join(workflowsDir, 'oracle-ci.yml'))).toBe(true);
    expect(fs.existsSync(path.join(workflowsDir, 'security-audit.yml'))).toBe(true);
  });

  it('validates security-audit.yml runs cargo audit and pnpm audit', () => {
    const content = fs.readFileSync(path.join(workflowsDir, 'security-audit.yml'), 'utf8');
    expect(content).toContain('cargo audit');
    expect(content).toContain('pnpm audit');
    expect(content).toContain('schedule:');
  });
});
