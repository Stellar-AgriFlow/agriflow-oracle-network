# AgriFlow Oracle Network Architecture Specification

## 1. System Overview

The AgriFlow Oracle Network is a decentralized, tamper-resistant commodity benchmark and parametric weather risk oracle designed specifically for the Stellar network and Soroban smart contract runtime.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL DATA INGESTION TIER                          │
│                                                                             │
│  ┌───────────────────────┐ ┌──────────────────────┐ ┌────────────────────┐  │
│  │  Commodity Exchanges  │ │ Open-Meteo Satellite│ │  NOAA Climate API  │  │
│  │  (CBOT, ICE, WorldBank│ │ Precipitation Feeds  │ │ Drought Basins     │  │
│  └───────────┬───────────┘ └──────────┬───────────┘ └──────────┬─────────┘  │
└──────────────┼────────────────────────┼────────────────────────┼────────────┘
               │                        │                        │
               ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OFF-CHAIN RELAYER & VALIDATOR TIER                       │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Validator Node Operators (@agriflow/node-cli)                        │  │
│  │  - Hardware Security Module (HSM) / AWS Nitro Enclave Key Signing     │  │
│  │  - Median Absolute Deviation (MAD) Outlier Filtering (>10% deviance)   │  │
│  │  - Exponentially Weighted Moving Average (EWMA) Volatility Tracking   │  │
│  │  - Prometheus Telemetry Exporter (/metrics, /healthz, /ready)         │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │ Signed Soroban Invocations
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SOROBAN SMART CONTRACT RUNTIME                         │
│                                                                             │
│  ┌────────────────────────┐ ┌────────────────────────┐ ┌─────────────────┐  │
│  │ AgriPriceFeedContract  │ │WeatherRiskOracleContract││OracleStakingCont │  │
│  │                        │ │                        │ │ract             │  │
│  │ • 6 Agricultural Feeds │ │ • 5 Monitored Basins   │ │ • 5,000 XLM Min │  │
│  │ • Staleness SLA Check  │ │ • Drought Index (0-100)│ │ • 17,280 Ledgers│  │
│  │ • Multi-Signer Median  │ │ • Parametric Trigger   │ │ • 10% Slashing  │  │
│  │ • Auto TTL Extension   │ │ • Historical Norm Base │ │ • Node Rewards  │  │
│  └───────────┬────────────┘ └───────────┬────────────┘ └────────┬────────┘  │
└──────────────┼──────────────────────────┼───────────────────────┼───────────┘
               │                          │                       │
               ▼                          ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DOWNSTREAM CONSUMERS & PROTOCOLS                      │
│                                                                             │
│  • StellarAgriFlow: Fair-Market Loan Valuation & Warehouse Receipts (eNWR)   │
│  • Parametric Insurance: Automated Zero-Claim Payout Disbursements          │
│  • Secondary Agri-DeFi: Derivatives, Hedging, and Liquidity Pools           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Core Smart Contracts

### 2.1 AgriPriceFeedContract (`CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7`)
- **Key Methods**:
  - `init(admin, base_currency)`: Establishes base accounting currency (`USD`).
  - `set_price(reporter, commodity, price, confidence)`: Submits verified benchmark rate.
  - `get_price(commodity)`: Retrieves latest on-chain rate.
  - `get_price_safe(commodity, max_staleness)`: Rejects prices older than specified SLA (e.g., 3600s).
  - `calculate_twap(commodity, window_seconds)`: Computes Time-Weighted Average Price across observations.

### 2.2 WeatherRiskOracleContract (`CCC6PHP7LADEVOW4AOLSRXHC6WOK2LW3ZJQX4EEYKR42GR3HXNSFIPHN`)
- **Key Methods**:
  - `init(admin)`: Initializes state and reporter authorization lists.
  - `update_metrics(reporter, region, rainfall, drought_index, temp)`: Commits satellite sensor telemetry.
  - `check_drought_trigger(region, threshold)`: Evaluates boolean condition for programmatic policy payout.
  - `check_flood_trigger(region, threshold)`: Evaluates excess precipitation condition.

### 2.3 OracleStakingContract (`CA7X2E2V5D6E7YBNZMRJ5E8WKQP4K5M4X6N3R8B2C9L1A4G5H7J3K`)
- **Key Methods**:
  - `register_operator(operator, amount)`: Locks initial collateral (minimum 5,000 XLM).
  - `request_unbond(operator, amount)`: Places funds in 17,280-ledger unbonding delay queue.
  - `withdraw_unbonded(operator)`: Disburses matured unbonded collateral.
  - `slash_operator(admin, operator, penalty, reason)`: Penalizes malicious or deviant nodes.
  - `reward_operator(admin, operator, reward)`: Distributes verified reporting compensation.
