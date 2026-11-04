# Contributing to AgriFlow Oracle Network

Thank you for your interest in contributing to the **AgriFlow Oracle Network**! As part of the broader **Stellar-AgriFlow** decentralized ecosystem, our mission is to build institutional-grade, tamper-proof commodity benchmarks, parametric climate risk telemetry, and decentralized staking on Stellar and Soroban.

---

## 🛠️ Development Prerequisites

Ensure you have the following toolchains installed:

- **Rust**: `rustc` and `cargo` >= 1.79.0 with target `wasm32-unknown-unknown`
- **Soroban CLI**: `stellar-cli` or `soroban-cli` >= 22.0.0
- **Node.js**: >= 20.0.0 (LTS recommended)
- **pnpm**: >= 9.0.0
- **Docker & Docker Compose**: v2.20+ (for local multi-service testing)

---

## 🚀 Getting Started

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/Stellar-AgriFlow/agriflow-oracle-network.git
   cd agriflow-oracle-network
   ```

2. **Install Workspace Dependencies**:
   ```bash
   pnpm install
   ```

3. **Run Soroban Contract Unit Tests**:
   ```bash
   pnpm contracts:test
   ```

4. **Build Soroban WASM Artifacts**:
   ```bash
   pnpm contracts:build
   ```

5. **Run TypeScript / Workspace Vitest Tests**:
   ```bash
   pnpm test
   ```

6. **Build Full Monorepo**:
   ```bash
   pnpm run build
   ```

---

## 📁 Repository Structure

```
agriflow-oracle-network/
├── apps/
│   └── oracle-dashboard/       # Next.js 14 interactive UI & SEP-0001 stellar.toml
├── contracts/
│   ├── agri-price-feed/        # Soroban commodity price feed benchmark contract
│   ├── weather-risk-oracle/    # Soroban parametric climate & drought risk contract
│   └── oracle-staking/         # Soroban decentralized validator staking & slashing
├── packages/
│   ├── node-cli/               # @agriflow/node-cli validator management tool
│   ├── oracle-sdk/             # TypeScript client, Bollinger bands, and risk analytics
│   └── types/                  # Shared TypeScript interfaces & types
├── services/
│   └── oracle-relayer/         # Off-chain relayer daemon, Prometheus server, HSM failover
├── docker/                     # Dockerfiles & Prometheus scraping configuration
├── docs/                       # Architecture, Security Model, Deployment Playbook
└── scripts/                    # Oracle cycle simulation & Soroban cost benchmarking
```

---

## 📐 Code Style & Conventions

- **Rust Smart Contracts**:
  - Follow `#![no_std]` convention.
  - Emit structured native Soroban events via `env.events().publish(...)`.
  - Ensure persistent storage entries maintain automated TTL extensions.
  - Run `cargo fmt` and `cargo clippy` before committing.
- **TypeScript**:
  - Use strict TypeScript with `NodeNext` or `Bundler` module resolution.
  - Keep types centralized in `packages/types` when shared across multiple services.
  - Use `vitest` for all unit and integration test suites.
- **Commit Messages**:
  - Follow Conventional Commits: `feat:`, `fix:`, `docs:`, `ci:`, `test:`, `refactor:`, `chore:`.

---

## 🔀 Pull Request Process

1. Create a descriptive feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Write unit tests for all new functions, methods, and contract invocations.
3. Verify that the entire test suite passes cleanly:
   ```bash
   pnpm test
   pnpm contracts:test
   ```
4. Verify that the Next.js dashboard builds statically without type errors:
   ```bash
   pnpm --filter oracle-dashboard build
   ```
5. Open a Pull Request against `main` with a clear summary of changes, motivation, and test coverage evidence.

---

## 🔒 Security

For security vulnerabilities, please refer to [SECURITY.md](./SECURITY.md) and do not open public GitHub issues.

Thank you for helping empower smallholder farmers and decentralized agricultural finance on Stellar!
