# Changelog

All notable changes to the **AgriFlow Oracle Network** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-11-04

### Added
- **Soroban Smart Contracts**:
  - `AgriPriceFeedContract` (`CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7`):
    - Verified agricultural commodity benchmark price oracle for Maize, Wheat, Cocoa, Coffee, Soybeans, and Fertilizer on Soroban.
    - Added staleness SLA verification (`get_price_safe`).
    - Added automated 300,000-ledger Soroban Storage TTL bump.
    - Added Time-Weighted Average Price (TWAP) calculation across observation windows.
  - `WeatherRiskOracleContract` (`CCC6PHP7LADEVOW4AOLSRXHC6WOK2LW3ZJQX4EEYKR42GR3HXNSFIPHN`):
    - Parametric weather and drought risk index oracle commiting real-time satellite telemetry for 5 major global basins (Northern Nigeria, Kenya, Ghana, Côte d'Ivoire, Brazil).
    - Programmatic payout evaluation for zero-claim crop insurance policies (`check_drought_trigger`, `check_flood_trigger`).
    - Multi-reporter median consensus calculation.
  - `OracleStakingContract` (`CA7X2E2V5D6E7YBNZMRJ5E8WKQP4K5M4X6N3R8B2C9L1A4G5H7J3K`):
    - Decentralized validator economic security mechanism with mandatory 5,000 XLM collateral staking.
    - 17,280-ledger unbonding delay queue protecting against hit-and-run exploits.
    - 10% collateral slashing penalty for reporting deviances greater than 5% from quorum median.
    - Verified reporter reward accrual and administrative circuit breaker pausability.
- **Node Operator CLI (`@agriflow/node-cli`)**:
  - Command-line tool for decentralized validator node operators (`agriflow-node register`, `deposit-stake`, `start`).
  - Hardware-assisted Ed25519 attestation signing for telemetry payloads.
  - Autonomous reporting cycles with Prometheus exposition text on port 9100.
- **Oracle SDK (`@agriflow/oracle-sdk`)**:
  - TypeScript client bindings: `AgriOracleClient` and `OracleStakingClient`.
  - Quantitative risk analytics: Bollinger Bands (20-SMA ±2σ), EWMA volatility, 12-month harvest seasonality indices, Value-at-Risk (VaR), Sortino ratio, and Calmar ratio calculation engines.
  - Median Absolute Deviation (MAD) outlier filtering (>10% deviance).
- **Oracle Relayer Service (`services/oracle-relayer`)**:
  - Multi-source consensus engine integrating Open-Meteo satellite precipitation feeds and exchange spot feeds.
  - High-availability Hardware Security Module (HSM) key signing with automated secondary enclave failover.
  - Embedded Prometheus exposition text server (`/metrics`) and Kubernetes probes (`/healthz`, `/ready`, `/status`).
- **Interactive Oracle Dashboard (`apps/oracle-dashboard`)**:
  - Pure React SVG charting:
    - `BollingerBandsChart`: Interactive ±2σ volatility envelopes and %B channel positions across agricultural commodities.
    - `SeasonalHarvestChart`: 12-month agricultural seasonality index curve (baseline 100.0) illustrating peak lean seasons and harvest glut discounts.
    - `OracleStakingSection`: Live validator node table, SLA uptime scores, slash histories, and interactive node staking onboarding simulator.
  - Interactive Parametric Drought Insurance payout calculator.
- **Standards & Infrastructure**:
  - Published SEP-0001 `stellar.toml` metadata specification with contract addresses, reporter keys, feeds, and basin coordinates.
  - Docker Compose microservices stack (`docker-compose.yml`) orchestrating the relayer, Next.js dashboard, and Prometheus scraper.
  - Architecture specification (`docs/ARCHITECTURE.md`), Security model (`docs/SECURITY_MODEL.md`), and Deployment playbook (`docs/DEPLOYMENT_PLAYBOOK.md`).
  - Automated GitHub Actions CI/CD workflows for Soroban contracts, TypeScript packages, Next.js build, and security audits (`.github/workflows/security-audit.yml`).

### Fixed
- Fixed TypeScript type imports in `services/oracle-relayer/src/twapWorker.ts` ensuring clean Turborepo monorepo builds.
- Updated `docker/Dockerfile.relayer` and `docker/Dockerfile.dashboard` to copy all package manifests avoiding missing workspace package errors during container builds.
- Aligned root `package.json` test script to execute Vitest across the entire monorepo.
