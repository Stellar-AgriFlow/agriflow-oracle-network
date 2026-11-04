export * from './nodeManager';

export function runCli(args: string[]): string {
  const command = args[0] || 'help';

  switch (command) {
    case 'help':
      return [
        'AgriFlow Oracle Node CLI',
        'Usage:',
        '  agriflow-node register --key <PUBKEY> --stake <XLM>',
        '  agriflow-node sign --symbol <MAIZE> --price <CENTS>',
        '  agriflow-node status --key <PUBKEY>',
      ].join('\n');

    case 'version':
      return 'agriflow-node v0.1.0';

    default:
      return `Unknown command: ${command}. Run "agriflow-node help" for available commands.`;
  }
}
