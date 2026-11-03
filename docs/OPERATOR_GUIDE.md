# Oracle Node Operator & Relayer Guide

## 1. Overview
An AgriFlow Oracle Reporter Node continuously gathers real-world agricultural commodity prices and regional weather telemetry, cryptographically signs the data with an Ed25519 keypair, and broadcasts updates to Soroban contracts on Stellar.

## 2. Configuration (`.env`)
```bash
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
REPORTER_SECRET_KEY=S... # Secret seed of authorized reporter account
PRICE_FEED_CONTRACT_ID=CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7
WEATHER_ORACLE_CONTRACT_ID=CCC6PHP7LADEVOW4AOLSRXHC6WOK2LW3ZJQX4EEYKR42GR3HXNSFIPHN
METRICS_PORT=9090
UPDATE_INTERVAL_MS=60000
```

## 3. Running with Docker
```bash
docker build -t agriflow-oracle-relayer -f docker/Dockerfile.relayer .
docker run -d --name oracle-node --env-file .env -p 9090:9090 agriflow-oracle-relayer
```

## 4. Health & Prometheus Telemetry
The relayer exposes standard health and Prometheus endpoints on port `9090`:
- `GET /health` -> JSON heartbeat and status
- `GET /metrics` -> Prometheus metrics (`agriflow_oracle_submissions_total`, `agriflow_oracle_failures_total`, `agriflow_oracle_last_price_cents`)
