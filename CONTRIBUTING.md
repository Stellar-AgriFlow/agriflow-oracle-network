# Contributing to AgriFlow Oracle Network

Thank you for your interest in contributing to the AgriFlow Oracle Network protocol!

## Development Prerequisites

- **Rust**: `rustc` and `cargo` >= 1.79
- **Soroban CLI**: `stellar-cli` or `soroban-cli` >= 22.0
- **Node.js**: >= 18.0.0
- **pnpm**: >= 9.0.0

## Getting Started

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/Stellar-AgriFlow/agriflow-oracle-network.git
   cd agriflow-oracle-network
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run contract unit tests:
   ```bash
   pnpm contracts:test
   ```

4. Build Soroban WASM targets:
   ```bash
   pnpm contracts:build
   ```

## Development Workflow

- **Contracts**: Located under `contracts/`. Follow standard `soroban-sdk` patterns with `#[no_std]`, proper event emissions, and TTL management.
- **Relayer Service**: Located under `services/oracle-relayer/`.
- **SDK**: Located under `packages/oracle-sdk/`.
- **Dashboard**: Next.js app located under `apps/oracle-dashboard/`.

## Pull Requests

1. Create a feature branch: `git checkout -b feat/your-feature-name`
2. Ensure all tests pass: `pnpm test` and `pnpm contracts:test`
3. Commit with semantic commit messages (e.g., `feat:`, `fix:`, `docs:`)
4. Open a PR against `main`.

