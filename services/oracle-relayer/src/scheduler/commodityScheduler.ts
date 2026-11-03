export interface SchedulerJobConfig {
  intervalMs: number;
  jitterMs?: number;
  symbol: string;
}

export type JobHandler = (symbol: string) => Promise<void>;

export class CommodityCronScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;
  private jobExecutions: Map<string, number> = new Map();

  constructor(private symbols: string[] = ['WHEAT', 'MAIZE', 'SOYBEAN', 'COFFEE', 'COCOA']) {}

  /**
   * Starts periodic commodity price observation pipeline
   */
  start(handler: JobHandler, intervalMs: number = 60000, jitterMs: number = 3000): void {
    if (this.isRunning) return;
    this.isRunning = true;

    for (const symbol of this.symbols) {
      this.jobExecutions.set(symbol, 0);

      const scheduleNext = () => {
        if (!this.isRunning) return;

        // Apply slight randomized jitter to prevent synchronized burst queries
        const jitter = Math.floor(Math.random() * (jitterMs * 2)) - jitterMs;
        const delay = Math.max(1000, intervalMs + jitter);

        const timer = setTimeout(async () => {
          try {
            await handler(symbol);
            const count = this.jobExecutions.get(symbol) || 0;
            this.jobExecutions.set(symbol, count + 1);
          } catch (err) {
            console.error(`Error executing scheduled job for commodity ${symbol}:`, err);
          } finally {
            scheduleNext();
          }
        }, delay);

        this.intervals.set(symbol, timer);
      };

      // Trigger initial run with slight initial stagger
      scheduleNext();
    }
  }

  /**
   * Halts all scheduled commodity observation tasks
   */
  stop(): void {
    this.isRunning = false;
    for (const [symbol, timer] of this.intervals.entries()) {
      clearTimeout(timer);
    }
    this.intervals.clear();
  }

  getJobExecutionCount(symbol: string): number {
    return this.jobExecutions.get(symbol.toUpperCase()) || 0;
  }

  getActiveSymbols(): string[] {
    return [...this.symbols];
  }

  getStatus(): { isRunning: boolean; activeTimers: number } {
    return {
      isRunning: this.isRunning,
      activeTimers: this.intervals.size,
    };
  }
}
