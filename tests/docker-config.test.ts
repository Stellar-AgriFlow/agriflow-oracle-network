import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Docker & Container Orchestration Suite', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('validates docker-compose.yml defines relayer, dashboard, and prometheus services', () => {
    const composePath = path.join(rootDir, 'docker-compose.yml');
    expect(fs.existsSync(composePath)).toBe(true);

    const content = fs.readFileSync(composePath, 'utf8');
    expect(content).toContain('oracle-relayer:');
    expect(content).toContain('oracle-dashboard:');
    expect(content).toContain('prometheus:');
    expect(content).toContain('CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7');
    expect(content).toContain('CCFDDSJPQS3IKRT553NDGTQDLFIIR4TAF7JU6MFYCEELPGTSBG7YQODN');
  });

  it('validates Dockerfile.relayer and Dockerfile.dashboard exist', () => {
    const relayerDocker = path.join(rootDir, 'docker/Dockerfile.relayer');
    const dashboardDocker = path.join(rootDir, 'docker/Dockerfile.dashboard');
    const promConfig = path.join(rootDir, 'docker/prometheus.yml');

    expect(fs.existsSync(relayerDocker)).toBe(true);
    expect(fs.existsSync(dashboardDocker)).toBe(true);
    expect(fs.existsSync(promConfig)).toBe(true);
  });
});
