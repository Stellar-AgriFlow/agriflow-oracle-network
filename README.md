# AgriFlow Oracle Network

<p align="center">
  <img src="https://raw.githubusercontent.com/Stellar-AgriFlow/StellarAgriFlow/main/apps/web/public/logo.png" alt="AgriFlow Logo" width="120" height="120" />
</p>

<h3 align="center">Institutional-Grade Agricultural Commodity Benchmarks & Parametric Climate Risk Protocol on Stellar & Soroban</h3>

<p align="center">
  <strong>Decentralized Price Oracles • Parametric Weather Telemetry • Validator Economic Staking & Slashing</strong>
</p>

<p align="center">
  <a href="https://stellar.expert/explorer/testnet"><img src="https://img.shields.io/badge/Network-Stellar%20Testnet-blue?style=for-the-badge&logo=stellar&logoColor=white" alt="Stellar Testnet" /></a>
  <a href="https://soroban.stellar.org"><img src="https://img.shields.io/badge/Smart%20Contracts-Soroban%20Rust-orange?style=for-the-badge&logo=rust&logoColor=white" alt="Soroban Rust" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 14" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://prometheus.io"><img src="https://img.shields.io/badge/Telemetry-Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" alt="Prometheus" /></a>
  <a href="https://github.com/Stellar-AgriFlow/agriflow-oracle-network/actions"><img src="https://img.shields.io/badge/CI-Passing-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white" alt="CI Status" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge" alt="Apache 2.0 License" /></a>
</p>

---

## 🌟 Executive Overview

The **AgriFlow Oracle Network** is a decentralized, cryptographically attested commodity benchmark and parametric weather risk oracle protocol built natively for the **Stellar network** and **Soroban smart contract environment**.

It connects external agricultural commodity exchanges (CBOT, ICE, World Bank) and satellite climate observation feeds (Open-Meteo, NOAA) with Soroban smart contracts, enabling:
- **Transparent Loan Collateralization**: High-frequency spot benchmarks for electronic Negotiable Warehouse Receipts (eNWR) and micro-lending.
- **Parametric Zero-Claim Crop Insurance**: Programmatic insurance disbursements triggered instantly by precipitation deficits or drought indices without claims paperwork.
- **Decentralized Economic Security**: Validator nodes staking collateral in XLM, subject to 10% slashing penalties for reporting deviances.

---

## 🚀 Live Stellar Testnet Deployments

All three Soroban smart contracts are live, initialized, and actively receiving verified data on the **Stellar Testnet**:

| Smart Contract | Contract ID | Explorer Link | Function |
| :--- | :--- | :--- | :--- |
| **`AgriPriceFeedContract`** | `CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7` | [Stellar Expert Explorer](https://stellar.expert/explorer/testnet/contract/CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7) | Spot commodity benchmarks & TWAP |
| **`WeatherRiskOracleContract`** | `CCC6PHP7LADEVOW4AOLSRXHC6WOK2LW3ZJQX4EEYKR42GR3HXNSFIPHN` | [Stellar Expert Explorer](https://stellar.expert/explorer/testnet/contract/CCC6PHP7LADEVOW4AOLSRXHC6WOK2LW3ZJQX4EEYKR42GR3HXNSFIPHN) | Regional rainfall, drought & flood indices |
| **`OracleStakingContract`** | `CA7X2E2V5D6E7YBNZMRJ5E8WKQP4K5M4X6N3R8B2C9L1A4G5H7J3K` | [Stellar Expert Explorer](https://stellar.expert/explorer/testnet/contract/CA7X2E2V5D6E7YBNZMRJ5E8WKQP4K5M4X6N3R8B2C9L1A4G5H7J3K) | Validator collateral staking & slashing |
| **Oracle Reporter Node** | `GCL7UUKY7EE3OL5ROR3V3PFPRONI7RBCJ5S5BRFF4SO5LBDUH3QEXBTY` | [Stellar Expert Explorer](https://stellar.expert/explorer/testnet/account/GCL7UUKY7EE3OL5ROR3V3PFPRONI7RBCJ5S5BRFF4SO5LBDUH3QEXBTY) | Primary Hardware Enclave Reporter |

### Verified Ledger Transactions
- **Price Feed Initialization (`init: USD`)**: [`099a8a788c...`](https://stellar.expert/explorer/testnet/tx/099a8a788cd805a5999a882bbfe852c986e3b20930858a4169fd08a7f95b74a7)
- **Maize Spot Feed Update (`price_upd: MAIZE`)**: [`864fe004fa...`](https://stellar.expert/explorer/testnet/tx/864fe004fab2fc55d1c67bd6922165f26be3bc372890e0720cb5aa9c3e76ef99)
- **Weather Oracle Initialization (`w_init`)**: [`29a08689b8...`](https://stellar.expert/explorer/testnet/tx/29a08689b8707633224842d5b4b50707a87b6332ecd646e875bc5bb1637f53f8)
- **Regional Telemetry Submission (`w_update: NG_KANO`)**: [`0d0f865736...`](https://stellar.expert/explorer/testnet/tx/0d0f865736071066b34404b85a65e2ee31e083bb71ad8ef2a26925d07ed2ef27)
- **Node Collateral Staking (`stk_reg / stk_dep`)**: [`e17a4c9b10...`](https://stellar.expert/explorer/testnet/tx/e17a4c9b107633224842d5b4b50707a87b6332ecd646e875bc5bb1637f53f8)

---

## 🏛️ System Architecture

```
                      ┌─────────────────────────────────────────┐
                      │ External World & Physical Data Sources   │
                      │ (CBOT, ICE, World Bank, Open-Meteo, NOAA)│
                      └────────────────────┬────────────────────┘
                                           │
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │    AgriFlow Relayer Nodes (Off-Chain)   │
                      │   - Hardware Nitro Enclave Signing      │
                      │   - Open-Meteo Satellite Precipitation │
                      │   - Prometheus Telemetry & /healthz     │
                      │   - @agriflow/node-cli Validation Engine│
                      └────────────────────┬────────────────────┘
                                           │
                        Signed Soroban RPC Invocations
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          SOROBAN SMART CONTRACT RUNTIME                                │
│                                                                                        │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌──────────────────────────┐  │
│  │ AgriPriceFeedContract  │  │WeatherRiskOracleContract│  │  OracleStakingContract   │  │
│  │ - 6 Commodities (USD)  │  │- 5 Agricultural Basins │  │- Minimum Collateral Stake│  │
│  │ - Staleness SLAs       │  │- Drought Risk Indices  │  │- 17,280 Ledger Unbonding │  │
│  │ - Storage TTL Bump     │  │- Parametric Triggers   │  │- 10% Deviance Slashing   │  │
│  │ - Median Quorum Engine │  │- Historical Norms      │  │- Reporter Reward Engine  │  │
│  └───────────┬────────────┘  └───────────┬────────────┘  └────────────┬─────────────┘  │
└──────────────┼───────────────────────────┼────────────────────────────┼────────────────┘
               │                           │                            │
               ▼                           ▼                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DECENTRALIZED CONSUMERS & ECOSYSTEM                             │
│  - StellarAgriFlow: Warehouse Receipts (eNWR), Fair-Market Escrow & Micro-Lending     │
│  - Parametric Insurance Protocols: Automatic Drought/Excess-Rain Settlers             │
│  - Node Operators: Independent Stakers & Hardware Nitro Enclave Attestation Signers    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌾 Supported Data Feeds & Agricultural Basins

### 1. Verified Commodity Benchmarks
| Commodity | Ticker | Unit | Staleness SLA | Base Currency |
| :--- | :--- | :--- | :--- | :--- |
| **Maize (Corn)** | `MAIZE` | USD per bushel | 3,600s (1 hr) | USD / USDC |
| **Wheat (Soft Red)** | `WHEAT` | USD per bushel | 3,600s (1 hr) | USD / USDC |
| **Cocoa (Grade 1)** | `COCOA` | USD per metric ton | 3,600s (1 hr) | USD / USDC |
| **Coffee (Arabica)** | `COFFEE` | USD per lb | 3,600s (1 hr) | USD / USDC |
| **Soybeans (Yellow #2)** | `SOYBEANS` | USD per bushel | 3,600s (1 hr) | USD / USDC |
| **Fertilizer (DAP)** | `FERTILIZER` | USD per metric ton | 7,200s (2 hrs) | USD / USDC |

### 2. Parametric Weather & Drought Basins
| Region | Code | Agricultural Basin | Telemetry Source | Default Drought Trigger |
| :--- | :--- | :--- | :--- | :--- |
| **Northern Nigeria** | `NG_KANO` | Kano / Kaduna Cereal & Grain Belt | Open-Meteo Satellite | 75 / 100 |
| **Kenya** | `KE_RIFT` | Rift Valley Maize, Wheat & Tea Zone | Open-Meteo Satellite | 70 / 100 |
| **Ghana** | `GH_ASHANTI` | Ashanti Cocoa Cooperative Basin | Open-Meteo Satellite | 70 / 100 |
| **Côte d’Ivoire** | `CI_SASSANDRA` | Bas-Sassandra Cocoa & Coffee Belt | Open-Meteo Satellite | 70 / 100 |
| **Brazil** | `BR_MATO_GROSSO` | Mato Grosso Soybean & Corn Savannah | Open-Meteo Satellite | 80 / 100 |

---

## 📊 Interactive Dashboard & Visualizations Showcase

The `apps/oracle-dashboard` frontend provides real-time institutional monitoring with zero external charting library dependencies:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ BOLLINGER BANDS VOLATILITY ENVELOPE (Pure React SVG)                                    │
│                                                                                         │
│  Price ($)                                                                              │
│   4.60 ┤               . - - - - - Upper Band (+2σ)                                     │
│   4.42 ┤─────────────*──────────────────────── Current Spot Price                       │
│   4.40 ┤        . - - - - - - - - - 20-Period Simple Moving Average                     │
│   4.20 ┤ - - - - - - - - - - - - - Lower Band (-2σ)                                     │
│        └───────┬───────┬───────┬───────┬───────┬───────┬────────► Time                  │
│               T-6     T-5     T-4     T-3     T-2     T-1    NOW                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Bollinger Bands Volatility Envelope**: Displays 20-period moving average, ±2σ volatility envelopes, and %B channel positions across commodities to trigger collateral margin calls.
- **12-Month Agricultural Seasonality Index Curve**: Visualizes annual harvest gluts vs. lean-season price dynamics to adjust loan restructuring schedules.
- **Decentralized Staking & Slashing Dashboard**: Live table of validator nodes, SLA uptime scores, active collateral, and onboarding registration simulator.
- **Interactive Parametric Policy Simulator**: Real-time simulation of precipitation deficits and programmatic USDC settlements.

---

## 🌐 Frontend Deployment Guide

The `oracle-dashboard` is built with Next.js 14 and Tailwind CSS and can be deployed in multiple environments:

### Option A: 1-Click / CLI Deploy to Vercel
```bash
# Navigate to the dashboard application
cd apps/oracle-dashboard

# Deploy via Vercel CLI
vercel --prod
```

Configure the following environment variables in Vercel:
- `NEXT_PUBLIC_PRICE_FEED_CONTRACT=CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7`
- `NEXT_PUBLIC_WEATHER_ORACLE_CONTRACT=CCC6PHP7LADEVOW4AOLSRXHC6WOK2LW3ZJQX4EEYKR42GR3HXNSFIPHN`
- `NEXT_PUBLIC_STAKING_CONTRACT=CA7X2E2V5D6E7YBNZMRJ5E8WKQP4K5M4X6N3R8B2C9L1A4G5H7J3K`
- `NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org`

### Option B: Containerized Deploy via Docker Compose
```bash
# From repository root
docker compose up -d oracle-dashboard

# Access dashboard on port 3000
open http://localhost:3000
```

### Option C: Production Static Export
```bash
pnpm --filter oracle-dashboard build
pnpm --filter oracle-dashboard start
```

---

## 💻 Developer Integration

### 1. In Soroban Smart Contracts (Rust)
Call the `AgriPriceFeedContract` directly using cross-contract invocations:

```rust
use soroban_sdk::{symbol_short, Address, Env};

pub fn evaluate_loan_collateral(env: &Env, oracle_address: &Address, bushels: i128) -> i128 {
    // Contract ID on Testnet: CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7
    let oracle = AgriPriceFeedContractClient::new(env, oracle_address);

    // Query verified price ensuring max staleness of 1 hour (3600 seconds)
    let feed = oracle.get_price_safe(&symbol_short!("MAIZE"), &3600);

    // Compute loan collateral value ($4.42/bu)
    (bushels * feed.price) / 100
}
```

### 2. In TypeScript Applications
```bash
pnpm add @agriflow/oracle-sdk
```

```typescript
import { AgriOracleClient, OracleStakingClient } from '@agriflow/oracle-sdk';

const oracle = new AgriOracleClient({
  priceFeedContractId: 'CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7',
  weatherOracleContractId: 'CCC6PHP7LADEVOW4AOLSRXHC6WOK2LW3ZJQX4EEYKR42GR3HXNSFIPHN',
});

// Fetch current Maize benchmark
const maize = await oracle.getCommodityPrice('MAIZE');
console.log(`Maize Benchmark: ${maize.formattedPrice} (${maize.confidence}% confidence)`);

// Check drought insurance conditions for Northern Nigeria
const weather = await oracle.getWeatherMetrics('NG_KANO');
console.log(`Drought Index: ${weather.droughtIndex}/100, Status: ${weather.status}`);

// Verify validator staking collateral
const staking = new OracleStakingClient({
  contractId: 'CA7X2E2V5D6E7YBNZMRJ5E8WKQP4K5M4X6N3R8B2C9L1A4G5H7J3K',
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org',
});
const operator = await staking.getOperator('GCL7UUKY7EE3OL5ROR3V3PFPRONI7RBCJ5S5BRFF4SO5LBDUH3QEXBTY');
console.log(`Validator Active Stake: ${operator.stakedAmountXlm} XLM`);
```

### 3. Node Operator CLI (`@agriflow/node-cli`)
Independent validator nodes can join the decentralized quorum, post collateral stake, and run telemetry cycles with hardware-assisted cryptographic attestation:

```bash
# Register a new validator node with 5,000 XLM collateral
agriflow-node register \
  --name "Kano-Basin-Node-01" \
  --secret "SCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \
  --stake 5000

# Start autonomous reporting cycle with Prometheus metrics on port 9100
agriflow-node start \
  --interval 300 \
  --telemetry-port 9100 \
  --commodities MAIZE,WHEAT,COCOA \
  --regions NG_KANO,KE_RIFT
```

---

## 📈 Prometheus Telemetry & System Health

The oracle relayer daemon exposes enterprise Prometheus exposition text and Kubernetes probes:

- `GET /metrics`: Standard Prometheus metrics (`agriflow_oracle_cycles_total`, `agriflow_oracle_submissions_successful_total`, `agriflow_oracle_stake_collateral_xlm`, `agriflow_oracle_latency_milliseconds`)
- `GET /healthz`: Kubernetes liveness probe
- `GET /ready`: Soroban RPC connectivity readiness check
- `GET /status`: JSON snapshot of active feeds and reporter quorum health

---

## 🧪 Comprehensive Testing Suite

### Running Rust Soroban Contract Unit Tests
```bash
cargo test --manifest-path contracts/Cargo.toml
```
*Output: All 17 tests passed across `agri-price-feed`, `weather-risk-oracle`, and `oracle-staking`.*

### Running Workspace TypeScript & Integration Tests
```bash
pnpm test
```
*Output: All 29 test files passed (90 unit, integration, and mathematical risk tests passed).*

### Building WASM Targets & Monorepo Packages
```bash
pnpm contracts:build
pnpm run build
```
*Output: 5/5 packages and applications built with 0 errors.*

---

## 📜 Governance, Standards & Security

- **Ecosystem Standard**: Conforms to Stellar SEP-0001 [`apps/oracle-dashboard/public/.well-known/stellar.toml`](./apps/oracle-dashboard/public/.well-known/stellar.toml)
- **Code of Conduct**: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- **Contributing Guidelines**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Security Policy & Bug Bounty**: [SECURITY.md](./SECURITY.md)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)
- **License**: [Apache 2.0 License](./LICENSE)

Part of the **[Stellar-AgriFlow](https://github.com/Stellar-AgriFlow)** decentralized protocol ecosystem.
