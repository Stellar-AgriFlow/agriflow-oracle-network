import { execSync } from 'child_process';

export * from './nodeManager';

export interface VersionInfo {
  version: string;
  commit: string;
  buildTimestamp: string;
  network: string;
}

export function getGitCommitSha(): string {
  if (process.env.GIT_COMMIT_SHA) return process.env.GIT_COMMIT_SHA;
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'unknown';
  }
}

export function getVersionInfo(): VersionInfo {
  const version = '0.1.0';
  const commit = getGitCommitSha();
  const buildTimestamp = process.env.BUILD_TIMESTAMP || '2026-11-10T12:00:00Z';
  const network = process.env.STELLAR_NETWORK || 'testnet';

  return {
    version,
    commit,
    buildTimestamp,
    network,
  };
}

export function formatVersionString(info: VersionInfo = getVersionInfo()): string {
  return `agriflow-node v${info.version} (commit: ${info.commit}, built: ${info.buildTimestamp}, network: ${info.network})`;
}

export function runCli(args: string[]): string {
  const command = args[0] || 'help';

  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      return [
        'AgriFlow Oracle Node CLI',
        'Usage:',
        '  agriflow-node register --key <PUBKEY> --stake <XLM>',
        '  agriflow-node sign --symbol <MAIZE> --price <CENTS>',
        '  agriflow-node status --key <PUBKEY>',
        '  agriflow-node version [--json]',
      ].join('\n');

    case 'version':
    case '--version':
    case '-v': {
      const isJson = args.includes('--json');
      const info = getVersionInfo();
      if (isJson) {
        return JSON.stringify(info, null, 2);
      }
      return formatVersionString(info);
    }

    default:
      return `Unknown command: ${command}. Run "agriflow-node help" for available commands.`;
  }
}

