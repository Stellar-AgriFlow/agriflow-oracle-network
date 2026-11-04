import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('SEP-0001 stellar.toml Specification', () => {
  const tomlPath = path.resolve(__dirname, '../apps/oracle-dashboard/public/.well-known/stellar.toml');

  it('verifies stellar.toml exists and conforms to SEP-0001 structure', () => {
    expect(fs.existsSync(tomlPath)).toBe(true);
    const content = fs.readFileSync(tomlPath, 'utf8');

    expect(content).toContain('VERSION = "2.0.0"');
    expect(content).toContain('NETWORK_PASSPHRASE = "Test SDF Network ; September 2015"');
    expect(content).toContain('ORG_NAME = "AgriFlow Decentralized Oracle Network"');
  });

  it('contains all 3 deployed Soroban oracle contracts', () => {
    const content = fs.readFileSync(tomlPath, 'utf8');

    expect(content).toContain('CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7');
    expect(content).toContain('AgriPriceFeedContract');

    expect(content).toContain('CCC6PHP7LADEVOW4AOLSRXHC6WOK2LW3ZJQX4EEYKR42GR3HXNSFIPHN');
    expect(content).toContain('WeatherRiskOracleContract');

    expect(content).toContain('CCFDDSJPQS3IKRT553NDGTQDLFIIR4TAF7JU6MFYCEELPGTSBG7YQODN');
    expect(content).toContain('OracleStakingContract');
  });

  it('documents verified commodity tickers and regional weather codes', () => {
    const content = fs.readFileSync(tomlPath, 'utf8');

    expect(content).toContain('TICKER = "MAIZE"');
    expect(content).toContain('TICKER = "WHEAT"');
    expect(content).toContain('TICKER = "COCOA"');
    expect(content).toContain('CODE = "NG_KANO"');
    expect(content).toContain('CODE = "KE_RIFT"');
  });
});
