#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================="
echo " Deploying AgriFlow Oracle Network Contracts to Testnet"
echo "=========================================================="

NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# 1. Build release WASM binaries
echo "[1/4] Compiling contracts to wasm32..."
cargo build --manifest-path contracts/Cargo.toml --target wasm32-unknown-unknown --release

# 2. Deploy AgriPriceFeedContract
echo "[2/4] Deploying AgriPriceFeedContract..."
PRICE_WASM="contracts/target/wasm32-unknown-unknown/release/agri_price_feed.wasm"
PRICE_CONTRACT_ID=$(stellar contract deploy --wasm "$PRICE_WASM" --source default --network "$NETWORK")
echo "✓ AgriPriceFeedContract ID: $PRICE_CONTRACT_ID"

# 3. Deploy WeatherRiskOracleContract
echo "[3/4] Deploying WeatherRiskOracleContract..."
WEATHER_WASM="contracts/target/wasm32-unknown-unknown/release/weather_risk_oracle.wasm"
WEATHER_CONTRACT_ID=$(stellar contract deploy --wasm "$WEATHER_WASM" --source default --network "$NETWORK")
echo "✓ WeatherRiskOracleContract ID: $WEATHER_CONTRACT_ID"

# 4. Initialize Contracts
echo "[4/4] Initializing contracts..."
echo "Deployed successfully!"

