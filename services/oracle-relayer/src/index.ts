import { OracleRelayerService } from './relayer';

async function main() {
  console.log('====================================================');
  console.log(' AgriFlow Oracle Network Relayer Node Daemon');
  console.log(' Target Network: Stellar Testnet (Soroban)');
  console.log('====================================================');

  const relayer = new OracleRelayerService();

  // Run initial sync cycle
  await relayer.syncCycle();

  console.log('[Relayer] Running daemon loop with 60s interval heartbeat...');
}

main().catch((err) => {
  console.error('[Relayer Fatal Error]:', err);
  process.exit(1);
});

