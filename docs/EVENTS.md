# AgriFlow Oracle Protocol - Contract Events Reference

This document provides a comprehensive specification of all Soroban events emitted by smart contracts within the AgriFlow Oracle Network. External indexers, off-chain monitoring daemons, and dApps can ingest these events via the Soroban RPC `getEvents` method.

---

## 1. Quick Reference Matrix

| Contract | Event Symbol | Topics | Data Payload | Purpose |
|:---|:---|:---|:---|:---|
| **AgriPriceFeed** | `init` | `[Symbol("init"), Symbol(base_currency)]` | `Address(admin)` | Contract initialization |
| **AgriPriceFeed** | `rep_add` | `[Symbol("rep_add")]` | `Address(reporter)` | Reporter node authorized |
| **AgriPriceFeed** | `rep_rm` | `[Symbol("rep_rm")]` | `Address(reporter)` | Reporter node removed |
| **AgriPriceFeed** | `slash` | `[Symbol("slash"), Address(reporter)]` | `i128(penalty_amount)` | Malicious/outlier reporter slashed |
| **AgriPriceFeed** | `price_upd` | `[Symbol("price_upd"), Symbol(commodity)]` | `(i128(price), u32(decimals), u64(timestamp))` | Accepted commodity price update |
| **OracleStaking** | `stk_reg` | `[Symbol("stk_reg"), Address(operator)]` | `(i128(initial_stake), u32(current_ledger))` | Operator registration and initial stake |
| **OracleStaking** | `stk_dep` | `[Symbol("stk_dep"), Address(operator)]` | `(i128(amount), i128(total_staked))` | Additional stake deposited |
| **OracleStaking** | `unb_req` | `[Symbol("unb_req"), Address(operator)]` | `(i128(amount), u32(release_ledger))` | Unbonding request initiated |
| **OracleStaking** | `unb_wdr` | `[Symbol("unb_wdr"), Address(operator)]` | `(i128(withdrawn), u32(current_ledger))` | Mature unbonded stake withdrawn |
| **OracleStaking** | `stk_slh` | `[Symbol("stk_slh"), Address(operator)]` | `(i128(actual_slash), Symbol(reason))` | Slashing penalty applied to operator |
| **OracleStaking** | `stk_rwd` | `[Symbol("stk_rwd"), Address(operator)]` | `(i128(reward_amount), i128(total_staked))` | Staking reward distributed |
| **WeatherRiskOracle** | `w_init` | `[Symbol("w_init")]` | `Address(admin)` | Weather contract initialization |
| **WeatherRiskOracle** | `w_rep_add` | `[Symbol("w_rep_add")]` | `Address(reporter)` | Weather data reporter authorized |
| **WeatherRiskOracle** | `w_rep_rm` | `[Symbol("w_rep_rm")]` | `Address(reporter)` | Weather data reporter removed |
| **WeatherRiskOracle** | `w_base` | `[Symbol("w_base"), Symbol(region)]` | `u32(new_baseline_mm)` | Regional baseline rainfall updated |
| **WeatherRiskOracle** | `w_update` | `[Symbol("w_update"), Symbol(region)]` | `(u32(drought_index), u32(rainfall_mm), u64(timestamp))` | Regional weather telemetry committed |

---

## 2. AgriPriceFeedContract Events

### `init`
Emitted once during contract initialization by the administrator.
- **Contract Source**: `contracts/agri-price-feed/src/lib.rs`
- **Topics**: `(Symbol("init"), Symbol(base_currency))`
  - Topic 0: Event identifier `init`
  - Topic 1: Base currency symbol (e.g. `USD`)
- **Data**: `Address` of the designated administrator.

### `rep_add`
Emitted when an authorized node operator address is granted reporting privileges.
- **Contract Source**: `contracts/agri-price-feed/src/lib.rs`
- **Topics**: `(Symbol("rep_add"),)`
- **Data**: `Address` of the newly authorized reporter node.

### `rep_rm`
Emitted when reporting privileges are revoked from an operator address.
- **Contract Source**: `contracts/agri-price-feed/src/lib.rs`
- **Topics**: `(Symbol("rep_rm"),)`
- **Data**: `Address` of the de-authorized reporter.

### `slash`
Emitted when an oracle node is penalized for publishing prices exceeding maximum variance thresholds or submitting invalid attestations.
- **Contract Source**: `contracts/agri-price-feed/src/lib.rs`
- **Topics**: `(Symbol("slash"), Address(reporter))`
  - Topic 0: Event identifier `slash`
  - Topic 1: Offending reporter address
- **Data**: `i128` penalty amount in XLM (stroops).

### `price_upd`
Emitted each time a verified price point is committed on-chain.
- **Contract Source**: `contracts/agri-price-feed/src/lib.rs`
- **Topics**: `(Symbol("price_upd"), Symbol(commodity))`
  - Topic 0: Event identifier `price_upd`
  - Topic 1: Commodity ticker symbol (e.g., `MAIZE`, `WHEAT`, `SOYBEANS`, `COCOA`, `COFFEE`, `FERTILIZER`)
- **Data**: Tuple `(i128 price, u32 decimals, u64 timestamp)`
  - `price`: Integer scaled price value.
  - `decimals`: Decimal precision (e.g., 2 for cents).
  - `timestamp`: Unix epoch seconds of the oracle observation.

---

## 3. OracleStakingContract Events

### `stk_reg`
Emitted when a new node operator registers and locks their initial XLM stake.
- **Contract Source**: `contracts/oracle-staking/src/lib.rs`
- **Topics**: `(Symbol("stk_reg"), Address(operator))`
  - Topic 0: Event identifier `stk_reg`
  - Topic 1: Operator public address
- **Data**: Tuple `(i128 initial_stake, u32 current_ledger)`
  - `initial_stake`: Initial XLM amount committed (must satisfy minimum stake threshold).
  - `current_ledger`: Ledger sequence when registration was processed.

### `stk_dep`
Emitted when an active node operator adds stake to their position.
- **Contract Source**: `contracts/oracle-staking/src/lib.rs`
- **Topics**: `(Symbol("stk_dep"), Address(operator))`
- **Data**: Tuple `(i128 amount, i128 total_staked)`
  - `amount`: Incremental stake deposited.
  - `total_staked`: New cumulative staked balance.

### `unb_req`
Emitted when an operator initiates the unbonding queue to withdraw stake.
- **Contract Source**: `contracts/oracle-staking/src/lib.rs`
- **Topics**: `(Symbol("unb_req"), Address(operator))`
- **Data**: Tuple `(i128 amount, u32 release_ledger)`
  - `amount`: Amount queued for unbonding.
  - `release_ledger`: Target ledger sequence when funds become eligible for withdrawal (after the cooldown window).

### `unb_wdr`
Emitted when released unbonding funds are withdrawn back to the operator wallet.
- **Contract Source**: `contracts/oracle-staking/src/lib.rs`
- **Topics**: `(Symbol("unb_wdr"), Address(operator))`
- **Data**: Tuple `(i128 withdrawn, u32 current_ledger)`

### `stk_slh`
Emitted when the staking contract executes a slashing order requested by authorized governance or price feed slashing mechanics.
- **Contract Source**: `contracts/oracle-staking/src/lib.rs`
- **Topics**: `(Symbol("stk_slh"), Address(operator))`
- **Data**: Tuple `(i128 actual_slash, Symbol reason)`
  - `actual_slash`: Amount burned or transferred to the protocol insurance reserve.
  - `reason`: Classification tag (e.g., `dev_rep` for deviation report).

### `stk_rwd`
Emitted when epoch staking yield or attestation rewards are credited to an operator.
- **Contract Source**: `contracts/oracle-staking/src/lib.rs`
- **Topics**: `(Symbol("stk_rwd"), Address(operator))`
- **Data**: Tuple `(i128 reward_amount, i128 total_staked)`

---

## 4. WeatherRiskOracleContract Events

### `w_init`
Emitted when the parametric weather and drought index contract is initialized.
- **Contract Source**: `contracts/weather-risk-oracle/src/lib.rs`
- **Topics**: `(Symbol("w_init"),)`
- **Data**: `Address` of the contract administrator.

### `w_rep_add`
Emitted when an authorized meteorological data reporter (satellite or weather station relay) is added.
- **Contract Source**: `contracts/weather-risk-oracle/src/lib.rs`
- **Topics**: `(Symbol("w_rep_add"),)`
- **Data**: `Address` of the authorized weather reporter.

### `w_rep_rm`
Emitted when a weather data reporter is removed.
- **Contract Source**: `contracts/weather-risk-oracle/src/lib.rs`
- **Topics**: `(Symbol("w_rep_rm"),)`
- **Data**: `Address` of the removed reporter.

### `w_base`
Emitted when regional baseline rainfall expectations are updated.
- **Contract Source**: `contracts/weather-risk-oracle/src/lib.rs`
- **Topics**: `(Symbol("w_base"), Symbol(region))`
  - Topic 0: Event identifier `w_base`
  - Topic 1: Regional basin code (e.g., `NG_KANO`, `KE_RIFT`, `GH_ASHANTI`, `CI_SASSANDRA`, `BR_MATO_GROSSO`)
- **Data**: `u32` new baseline rainfall in millimeters.

### `w_update`
Emitted whenever an authorized reporter commits fresh sensor/satellite observations.
- **Contract Source**: `contracts/weather-risk-oracle/src/lib.rs`
- **Topics**: `(Symbol("w_update"), Symbol(region))`
  - Topic 0: Event identifier `w_update`
  - Topic 1: Regional basin code
- **Data**: Tuple `(u32 drought_index, u32 rainfall_mm, u64 timestamp)`
  - `drought_index`: Drought severity index (0-100 scale, where >= 75 triggers parametric insurance disbursements).
  - `rainfall_mm`: Observed cumulative rainfall in millimeters.
  - `timestamp`: Observation measurement epoch timestamp.

---

## 5. Indexing via Soroban RPC

To stream or filter these events using TypeScript and `@stellar/stellar-sdk`:

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';

const rpc = new Server('https://soroban-testnet.stellar.org');

async function fetchRecentPriceUpdates(priceFeedContractId: string, startLedger: number) {
  const response = await rpc.getEvents({
    startLedger,
    filters: [
      {
        type: 'contract',
        contractIds: [priceFeedContractId],
        topics: [['price_upd', '*']],
      },
    ],
  });

  return response.events;
}
```
