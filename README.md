# AgriFlow Oracle Network

[![Network](https://img.shields.io/badge/Stellar-Testnet-blue?style=for-the-badge&logo=stellar&logoColor=white)](https://stellar.expert/explorer/testnet)
[![Soroban Smart Contracts](https://img.shields.io/badge/Soroban-Rust%20Contracts-orange?style=for-the-badge&logo=rust&logoColor=white)](https://soroban.stellar.org)
[![CI Status](https://img.shields.io/badge/CI-Passing-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/Stellar-AgriFlow/agriflow-oracle-network/actions)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)](./LICENSE)

**Decentralized agricultural commodity benchmarks and parametric weather risk oracle protocol built natively for Stellar and Soroban.**

The AgriFlow Oracle Network provides tamper-proof, low-latency, and cryptographically verified data feeds for global agricultural commerce, decentralized commodity finance, parametric crop insurance, and Real-World Asset (RWA) protocols on Stellar.

---

## 🌐 Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │ External World & Physical Data Sources   │
                      │ (CBOT, ICE, World Bank, NOAA, Met-Data) │
                      └────────────────────┬────────────────────┘
                                           │
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │    AgriFlow Relayer Nodes (Off-Chain)   │
                      │   - Cryptographic Keypair Signatures    │
                      │   - Multi-source aggregation & median   │
                      └────────────────────┬────────────────────┘
                                           │
                        Signed Soroban RPC Invocations
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          SOROBAN SMART CONTRACT RUNTIME                                │
│                                                                                        │
│  ┌────────────────────────────────────┐    ┌────────────────────────────────────────┐  │
│  │       AgriPriceFeedContract        │    │       WeatherRiskOracleContract        │  │
│  │  - Maize, Wheat, Cocoa, Coffee     │    │  - Regional Precipitation (mm)         │  │
│  │  - Soybeans, Fertilizer (DAP)      │    │  - Drought Risk Index (0-100)          │  │
│  │  - Staleness Verification SLA      │    │  - Parametric Insurance Payout Triggers│  │
│  │  - Soroban Storage TTL Auto-Bump   │    │  - Extreme Temperature Anomaly Flags   │  │
│  └─────────────────┬──────────────────┘    └───────────────────┬────────────────────┘  │
└────────────────────┼───────────────────────────────────────────┼───────────────────────┘
                     │                                           │
                     ▼                                           ▼
     ┌───────────────────────────────┐           ┌────────────────────────────────┐
     │      StellarAgriFlow          │           │   Third-Party Soroban Protocols│
     │  - Collateral Valuation       │           │   - DeFi Micro-Lending         │
     │  - eNWR Warehouse Receipts    │           │   - Parametric Crop Insurance  │
     │  - Escrow Fair-Value Locks    │           │   - Cross-Border Agri Trade    │
     └───────────────────────────────┘           └────────────────────────────────┘
```

---

## 📦 Project Structure

```text
agriflow-oracle-network/
├── contracts/
│   ├── Cargo.toml                    # Root workspace Cargo manifest
│   ├── agri-price-feed/              # Soroban contract: Agricultural commodity price benchmarks
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs                # Core price feed logic, TTL extension, reporter access control
│   │       └── test.rs               # Comprehensive Rust test suite with testutils
│   └── weather-risk-oracle/          # Soroban contract: Parametric weather & climate index
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs                # Regional precipitation, drought triggers, heat anomaly flags
│           └── test.rs               # Parametric insurance trigger tests
├── packages/
│   ├── types/                        # Shared TypeScript types for commodities, feeds, and oracles
│   └── oracle-sdk/                   # TypeScript SDK (@agriflow/oracle-sdk) for Soroban dApps
├── services/
│   └── oracle-relayer/               # Automated ingestion service syncing real-world market APIs to Soroban
├── apps/
│   └── oracle-dashboard/             # Next.js explorer & status terminal for live feeds & testnet contracts
├── scripts/
│   ├── deploy-testnet.sh             # Bash deployment script for Stellar CLI
│   └── deploy-testnet.ps1            # PowerShell deployment script
├── .github/
│   └── workflows/ci.yml              # Matrix CI for Rust contracts and TypeScript packages
├── LICENSE                           # Apache 2.0
└── README.md
```

---

## 🌾 Supported Data Feeds

### 1. Commodity Price Benchmarks
| Commodity | Ticker | Unit | Default Staleness SLA |
| :--- | :--- | :--- | :--- |
| **Maize (Corn)** | `MAIZE` | USD per bushel | 3,600s (1 hour) |
| **Wheat (Soft Red)** | `WHEAT` | USD per bushel | 3,600s (1 hour) |
| **Cocoa (Grade 1)** | `COCOA` | USD per metric ton | 3,600s (1 hour) |
| **Coffee (Arabica)** | `COFFEE` | USD per lb | 3,600s (1 hour) |
| **Soybeans (Yellow #2)** | `SOYBEANS` | USD per bushel | 3,600s (1 hour) |
| **Fertilizer (DAP)** | `FERTILIZER` | USD per metric ton | 7,200s (2 hours) |

### 2. Parametric Weather & Drought Telemetry
| Region | Region Code | Monitored Agricultural Basin |
| :--- | :--- | :--- |
| **Northern Nigeria** | `NG_KANO` | Kano / Kaduna Cereal & Grain Belt |
| **Kenya** | `KE_RIFT` | Rift Valley Maize, Wheat & Tea Zone |
| **Ghana** | `GH_ASHANTI` | Ashanti Cocoa Cooperative Basin |
| **Côte d’Ivoire** | `CI_SASSANDRA` | Bas-Sassandra Cocoa & Coffee Belt |
| **Brazil** | `BR_MATO_GROSSO` | Mato Grosso Soybean & Corn Savannah |

---

## 💻 Developer Integration

### In Soroban Smart Contracts (Rust)
Call the `AgriPriceFeedContract` directly from any other Soroban contract using cross-contract calls:

```rust
use soroban_sdk::{symbol_short, Address, Env};

pub fn calculate_crop_loan_ceiling(env: &Env, oracle_address: &Address, bushels: i128) -> i128 {
    // 1. Initialize oracle client
    let price_oracle = AgriPriceFeedContractClient::new(env, oracle_address);

    // 2. Query verified price ensuring max staleness of 1 hour (3600 seconds)
    let maize_feed = price_oracle.get_price_safe(&symbol_short!("MAIZE"), &3600);

    // 3. Compute collateral ceiling based on on-chain reference price
    (bushels * maize_feed.price) / 100
}
```

### In TypeScript / Web Applications
```bash
pnpm add @agriflow/oracle-sdk
```

```typescript
import { AgriOracleClient } from '@agriflow/oracle-sdk';

const oracle = new AgriOracleClient({
  priceFeedContractId: process.env.NEXT_PUBLIC_PRICE_FEED_CONTRACT_ID!,
  weatherOracleContractId: process.env.NEXT_PUBLIC_WEATHER_ORACLE_CONTRACT_ID!,
});

// Fetch current Maize price
const maize = await oracle.getCommodityPrice('MAIZE');
console.log(`Maize Benchmark: ${maize.formattedPrice} (${maize.confidence}% confidence)`);

// Check drought insurance conditions for Kenya Rift Valley
const weather = await oracle.getWeatherMetrics('KE_RIFT');
console.log(`Drought Index: ${weather.droughtIndex}/100, Status: ${weather.status}`);
```

---

## 🧪 Testing Suite

### Running Rust Soroban Contract Tests
```bash
cargo test --manifest-path contracts/Cargo.toml
```

### Running TypeScript Packages & Apps
```bash
pnpm install
pnpm build
```

---

## 📜 License

This project is licensed under the [Apache 2.0 License](./LICENSE). Part of the **Stellar-AgriFlow** ecosystem.

