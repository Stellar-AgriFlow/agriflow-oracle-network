# AgriFlow Oracle Network Security Model & Threat Mitigation

## 1. Threat Taxonomy & Countermeasures

| Threat Vector | Severity | Attack Mechanism | Implemented Mitigation |
| :--- | :--- | :--- | :--- |
| **Flash Crash / Feed Spoofing** | High | Bad actor manipulates single exchange rate | **Median Absolute Deviation (MAD)** rejects values deviating >10% from cluster median. |
| **Sybil Node Quorum Hijack** | Critical | Attacker spins up numerous cheap reporter nodes | **OracleStakingContract** requires minimum **5,000 XLM** collateral stake per operator. |
| **Hit-and-Run Exploit** | High | Attacker posts bad data then withdraws capital | **17,280-ledger unbonding queue** enforces economic lockup through dispute periods. |
| **Deviant Reporting** | Medium | Faulty sensor or skewed data source | **Automated 10% Collateral Slashing** on reports deviating >5% from consensus. |
| **Soroban Rent Starvation** | High | Contract data expires and is archived off-ledger | **TTL Auto-Bump Safeguard** programmatically extends ledger TTL by 300,000 ledgers. |
| **Private Key Compromise** | Critical | Relayer server host compromised | **AWS Nitro Enclave / HSM Signer** isolations with automated failover switching. |

## 2. Cryptographic Attestation Pipeline

Each validator node executing `@agriflow/node-cli` signs payload digests within secure hardware:

1. **Payload Serialization**: Raw telemetry values (timestamp, commodity/region, numerical value) are canonicalized.
2. **Digest Hash**: SHA-256 digest is generated from canonical payload bytes.
3. **Hardware Signature**: Private key residing in non-exportable hardware enclave produces an Ed25519 signature.
4. **On-Chain Verification**: Soroban contracts verify cryptographic authorization before state commitment.

## 3. SLA Staleness Defense

All contract consumers querying prices must call `get_price_safe(commodity, max_staleness)`. If the last confirmed report timestamp exceeds the caller's allowed staleness tolerance, the transaction reverts on-chain with `Error::StalePrice`, protecting downstream loan underwriting and warehouse collateralization.
