# Security Policy

The AgriFlow Oracle Network and the broader Stellar-AgriFlow decentralized ecosystem are committed to ensuring institutional security, cryptographic integrity, and tamper-resistance for agricultural Real-World Assets (RWA) and parametric climate risk settlement on Stellar and Soroban.

## Supported Versions

Security updates and critical patches are actively applied to the following release versions:

| Version | Supported | Notes |
| :--- | :---: | :--- |
| `0.1.x` | Yes | Active Testnet release & Soroban v22 protocol compatibility |
| `< 0.1.0` | No | Experimental preview releases |

## Reporting a Vulnerability

We deeply appreciate the efforts of the security research and Stellar ecosystem developer community in identifying vulnerabilities responsibly.

If you believe you have discovered a security vulnerability in:
- Soroban smart contracts (`contracts/agri-price-feed`, `contracts/weather-risk-oracle`, `contracts/oracle-staking`)
- Validator node CLI or hardware attestation protocols (`packages/node-cli`)
- Telemetry relayer daemon, TWAP workers, or consensus engines (`services/oracle-relayer`)
- Client SDKs (`packages/oracle-sdk`)

**Please DO NOT open a public issue.** Instead, submit your report securely to our security coordination team:

- **Email**: `security@stellar-agriflow.org`
- **PGP Key**: Fingerprint `9A2F 48B1 7D0C E63F 851A 42CB 7E39 01FD`
- **Lead Maintainer**: `LaPoshBaby@users.noreply.github.com`

### What to Include in Your Report
1. Detailed description of the vulnerability and attack vector.
2. Step-by-step reproduction instructions or a minimal proof-of-concept (PoC) test case.
3. Estimated exploitability and economic risk (e.g. potential for deviance manipulation, collateral drainage, or replay attacks).
4. Any proposed remediations or patches.

## Vulnerability Handling Timeline & SLAs

- **Initial Acknowledgment**: Within 24 hours of receiving the report.
- **Triage & Severity Assessment**: Within 48 hours.
- **Status Updates**: At least every 72 hours until resolution.
- **Fix & Public Disclosure**: Coordinated release within 14 days, allowing operators sufficient window to upgrade node collaterals and contract instances.

## Bug Bounty Program

High-severity vulnerabilities that identify novel economic exploits, Soroban state corruption, or cryptographic attestation bypasses are eligible for discretionary rewards sponsored through our ecosystem security fund.
