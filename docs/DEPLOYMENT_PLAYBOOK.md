# AgriFlow Oracle Network Node Deployment Playbook

## 1. Prerequisites
- Docker & Docker Compose v2.20+
- Node.js v20.x and `pnpm` v9.15.9
- Rust v1.79+ and `soroban-cli` v22.0+
- Minimum 5,000 XLM available for validator collateral staking

## 2. Fast-Start Deployment via Docker Compose

```bash
# Clone the repository
git clone https://github.com/Stellar-AgriFlow/agriflow-oracle-network.git
cd agriflow-oracle-network

# Configure environment secrets
cp .env.example .env

# Spin up Oracle Relayer, Next.js Dashboard, and Prometheus Scraper
docker compose up -d

# Verify container health
docker compose ps
curl http://localhost:9090/healthz
```

## 3. Validator Node Registration via CLI

```bash
# Install node CLI package globally
pnpm add -g @agriflow/node-cli

# Register node with 5,000 XLM collateral on Testnet
agriflow-node register \
  --name "Kano-Basin-Validator-01" \
  --secret "SCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \
  --stake 5000 \
  --rpc-url "https://soroban-testnet.stellar.org" \
  --contract-id "CA7X2E2V5D6E7YBNZMRJ5E8WKQP4K5M4X6N3R8B2C9L1A4G5H7J3K"

# Start automated reporting daemon
agriflow-node start \
  --interval 300 \
  --telemetry-port 9100 \
  --commodities MAIZE,WHEAT,COCOA \
  --regions NG_KANO,KE_RIFT
```

## 4. Monitoring & Telemetry Inspection

- **Metrics Exposition**: `http://localhost:9090/metrics`
- **Prometheus UI**: `http://localhost:9091`
- **Live Status Snapshot**: `http://localhost:9090/status`
- **Liveness Probe**: `http://localhost:9090/healthz`
- **Readiness Probe**: `http://localhost:9090/ready`
