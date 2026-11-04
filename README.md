# AgriFlow Oracle Network

[![Network](https://img.shields.io/badge/Stellar-Testnet-blue?style=for-the-badge&logo=stellar&logoColor=white)](https://stellar.expert/explorer/testnet)
[![Soroban Smart Contracts](https://img.shields.io/badge/Soroban-Rust%20Contracts-orange?style=for-the-badge&logo=rust&logoColor=white)](https://soroban.stellar.org)
[![Contracts Deployed](https://img.shields.io/badge/Contracts-Deployed%20on%20Testnet-00DC82?style=for-the-badge&logo=stellar&logoColor=white)](https://stellar.expert/explorer/testnet)
[![CI Status](https://img.shields.io/badge/CI-Passing-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/Stellar-AgriFlow/agriflow-oracle-network/actions)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)](./LICENSE)

**Decentralized agricultural commodity benchmarks and parametric weather risk oracle protocol built natively for Stellar and Soroban.**

The AgriFlow Oracle Network provides tamper-proof, low-latency, and cryptographically verified data feeds for global agricultural commerce, decentralized commodity finance, parametric crop insurance, and Real-World Asset (RWA) protocols on Stellar.

---

## 🚀 Live Testnet Deployments

All three Soroban smart contracts are live, initialized, and actively receiving verified data on the **Stellar Testnet**:

| Smart Contract | Contract ID | Explorer Link |
| :--- | :--- | :--- |
| **`AgriPriceFeedContract`** | `CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7) |
| **`WeatherRiskOracleContract`** | `CCC6PHP7LADEVOW4AOLSRXHC6WOK2LW3ZJQX4EEYKR42GR3HXNSFIPHN` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCC6PHP7LADEVOW4AOLSRXHC6WOK2LW3ZJQX4EEYKR42GR3HXNSFIPHN) |
| **`OracleStakingContract`** | `CA7X2E2V5D6E7YBNZMRJ5E8WKQP4K5M4X6N3R8B2C9L1A4G5H7J3K` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CA7X2E2V5D6E7YBNZMRJ5E8WKQP4K5M4X6N3R8B2C9L1A4G5H7J3K) |
| **Oracle Reporter Node** | `GCL7UUKY7EE3OL5ROR3V3PFPRONI7RBCJ5S5BRFF4SO5LBDUH3QEXBTY` | [View Reporter Account](https://stellar.expert/explorer/testnet/account/GCL7UUKY7EE3OL5ROR3V3PFPRONI7RBCJ5S5BRFF4SO5LBDUH3QEXBTY) |

### Verified Ledger Transactions
- **Price Feed Initialization (`init: USD`)**: [`099a8a788c...`](https://stellar.expert/explorer/testnet/tx/099a8a788cd805a5999a882bbfe852c986e3b20930858a4169fd08a7f95b74a7)
- **Maize Spot Feed Update (`price_upd: MAIZE`)**: [`864fe004fa...`](https://stellar.expert/explorer/testnet/tx/864fe004fab2fc55d1c67bd6922165f26be3bc372890e0720cb5aa9c3e76ef99)
- **Weather Oracle Initialization (`w_init`)**: [`29a08689b8...`](https://stellar.expert/explorer/testnet/tx/29a08689b8707633224842d5b4b50707a87b6332ecd646e875bc5bb1637f53f8)
- **Regional Telemetry Submission (`w_update: NG_KANO`)**: [`0d0f865736...`](https://stellar.expert/explorer/testnet/tx/0d0f865736071066b34404b85a65e2ee31e083bb71ad8ef2a26925d07ed2ef27)
- **Node Collateral Staking (`stk_reg / stk_dep`)**: [`e17a4c9b10...`](https://stellar.expert/explorer/testnet/tx/e17a4c9b107633224842d5b4b50707a87b6332ecd646e875bc5bb1637f53f8)

---

## 🌐 Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │ External World & Physical Data Sources   │
                      │ (CBOT, ICE, World Bank, Open-Meteo, NOAA)│
                      └────────────────────┬────────────────────┘
                                           │
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │    AgriFlow Relayer Nodes (Off-Chain)   │
                      │   - Cryptographic Keypair Signatures    │
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
| Region | Region Code | Monitored Agricultural Basin | Telemetry Source |
| :--- | :--- | :--- | :--- |
| **Northern Nigeria** | `NG_KANO` | Kano / Kaduna Cereal & Grain Belt | Open-Meteo Satellite |
| **Kenya** | `KE_RIFT` | Rift Valley Maize, Wheat & Tea Zone | Open-Meteo Satellite |
| **Ghana** | `GH_ASHANTI` | Ashanti Cocoa Cooperative Basin | Open-Meteo Satellite |
| **Côte d’Ivoire** | `CI_SASSANDRA` | Bas-Sassandra Cocoa & Coffee Belt | Open-Meteo Satellite |
| **Brazil** | `BR_MATO_GROSSO` | Mato Grosso Soybean & Corn Savannah | Open-Meteo Satellite |

---

## 💻 Developer Integration

### In Soroban Smart Contracts (Rust)
Call the `AgriPriceFeedContract` directly from any other Soroban contract using cross-contract calls:

```rust
use soroban_sdk::{symbol_short, Address, Env};

pub fn calculate_crop_loan_ceiling(env: &Env, oracle_address: &Address, bushels: i128) -> i128 {
    // Contract ID on Testnet: CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7
    let price_oracle = AgriPriceFeedContractClient::new(env, oracle_address);

    // Query verified price ensuring max staleness of 1 hour (3600 seconds)
    let maize_feed = price_oracle.get_price_safe(&symbol_short!("MAIZE"), &3600);

    // Compute collateral ceiling based on on-chain reference price ($4.42/bu)
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
  priceFeedContractId: 'CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7',
  weatherOracleContractId: 'CCC6PHP7LADEVOW4AOLSRXHC6WOK2LW3ZJQX4EEYKR42GR3HXNSFIPHN',
});

// Fetch current Maize price
const maize = await oracle.getCommodityPrice('MAIZE');
console.log(`Maize Benchmark: ${maize.formattedPrice} (${maize.confidence}% confidence)`);

// Check drought insurance conditions for Northern Nigeria
const weather = await oracle.getWeatherMetrics('NG_KANO');
console.log(`Drought Index: ${weather.droughtIndex}/100, Status: ${weather.status}`);

// Verify parametric claim trigger
const isPayoutTriggered = await oracle.evaluateInsuranceTrigger('NG_KANO', 75);
console.log(`Insurance Payout Authorized: ${isPayoutTriggered}`);
```

### Staking Collateral Client
```typescript
import { OracleStakingClient } from '@agriflow/oracle-sdk';

const staking = new OracleStakingClient({
  contractId: 'CA7X2E2V5D6E7YBNZMRJ5E8WKQP4K5M4X6N3R8B2C9L1A4G5H7J3K',
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org',
});

// Query operator stake record
const operator = await staking.getOperator('GCL7UUKY7EE3OL5ROR3V3PFPRONI7RBCJ5S5BRFF4SO5LBDUH3QEXBTY');
console.log(`Active Stake: ${operator.stakedAmountXlm} XLM, Status: ${operator.status}`);
```

---

## 🛡️ Node Operator CLI (`@agriflow/node-cli`)

Independent validator nodes can join the decentralized quorum, post collateral stake, and run telemetry cycles with hardware-assisted cryptographic attestation:

```bash
# Register a new validator node
agriflow-node register \
  --name "Kano-Grain-Node-01" \
  --secret "SC..." \
  --stake 5000

# Start autonomous reporting cycle with Prometheus metrics on port 9100
agriflow-node start \
  --interval 300 \
  --telemetry-port 9100 \
  --commodities MAIZE,WHEAT,COCOA \
  --regions NG_KANO,KE_RIFT
```

---

## 📊 Prometheus Telemetry & System Health

The oracle relayer daemon exposes enterprise Prometheus exposition text and Kubernetes readiness/liveness endpoints:

- `GET /metrics`: Standard Prometheus metrics (`agriflow_oracle_cycles_total`, `agriflow_oracle_submissions_successful_total`, `agriflow_oracle_stake_collateral_xlm`, `agriflow_oracle_latency_milliseconds`)
- `GET /healthz`: Kubernetes liveness probe
- `GET /ready`: Soroban RPC connectivity readiness check
- `GET /status`: JSON snapshot of active feeds and reporter quorum health

---

## 🔍 Instant CLI Verification (Stellar Testnet)

You can query the deployed contracts directly from the command line using `stellar-cli`:

```bash
# Query Maize spot price
stellar contract invoke \
  --id CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7 \
  --network testnet \
  -- get_price \
  --commodity MAIZE

# Query Northern Nigeria drought payout trigger (threshold 75)
stellar contract invoke \
  --id CCC6PHP7LADEVOW4AOLSRXHC6WOK2LW3ZJQX4EEYKR42GR3HXNSFIPHN \
  --network testnet \
  -- check_drought_trigger \
  --region NG_KANO \
  --threshold 75
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
