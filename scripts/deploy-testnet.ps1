# PowerShell Deployment Script for AgriFlow Oracle Network on Stellar Testnet
param(
    [string]$Network = "testnet",
    [string]$SourceAccount = "default"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Deploying AgriFlow Oracle Network Contracts to $Network" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Build release WASM binaries
Write-Host "[1/4] Compiling contracts to wasm32-unknown-unknown..." -ForegroundColor Yellow
cargo build --manifest-path contracts/Cargo.toml --target wasm32-unknown-unknown --release

# 2. Deploy AgriPriceFeedContract
Write-Host "[2/4] Deploying AgriPriceFeedContract..." -ForegroundColor Yellow
$PriceWasm = "contracts/target/wasm32-unknown-unknown/release/agri_price_feed.wasm"
$PriceContractId = stellar contract deploy --wasm $PriceWasm --source $SourceAccount --network $Network
Write-Host "✓ AgriPriceFeedContract ID: $PriceContractId" -ForegroundColor Green

# 3. Deploy WeatherRiskOracleContract
Write-Host "[3/4] Deploying WeatherRiskOracleContract..." -ForegroundColor Yellow
$WeatherWasm = "contracts/target/wasm32-unknown-unknown/release/weather_risk_oracle.wasm"
$WeatherContractId = stellar contract deploy --wasm $WeatherWasm --source $SourceAccount --network $Network
Write-Host "✓ WeatherRiskOracleContract ID: $WeatherContractId" -ForegroundColor Green

Write-Host "Deployment completed successfully!" -ForegroundColor Cyan

