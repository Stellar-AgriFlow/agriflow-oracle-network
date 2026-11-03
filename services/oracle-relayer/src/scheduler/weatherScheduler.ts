export interface RegionalWeatherTask {
  regionId: string;
  latitude: number;
  longitude: number;
}

export type WeatherJobHandler = (task: RegionalWeatherTask) => Promise<void>;

export class WeatherCronScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;
  private jobExecutions: Map<string, number> = new Map();

  constructor(
    private regions: RegionalWeatherTask[] = [
      { regionId: 'SUB_SAHARAN_A', latitude: 9.082, longitude: 8.6753 },
      { regionId: 'EAST_AFRICA_B', latitude: -1.286389, longitude: 36.817223 },
      { regionId: 'WEST_AFRICA_C', latitude: 5.6037, longitude: -0.187 },
      { regionId: 'SOUTHERN_AFRICA_D', latitude: -25.7461, longitude: 28.1881 },
      { regionId: 'LATAM_PAMPAS_E', latitude: -34.6037, longitude: -58.3816 },
    ]
  ) {}

  /**
   * Starts periodic weather observation pipeline
   */
  start(handler: WeatherJobHandler, intervalMs: number = 300000, jitterMs: number = 5000): void {
    if (this.isRunning) return;
    this.isRunning = true;

    for (const region of this.regions) {
      this.jobExecutions.set(region.regionId, 0);

      const scheduleNext = () => {
        if (!this.isRunning) return;

        const jitter = Math.floor(Math.random() * (jitterMs * 2)) - jitterMs;
        const delay = Math.max(1000, intervalMs + jitter);

        const timer = setTimeout(async () => {
          try {
            await handler(region);
            const count = this.jobExecutions.get(region.regionId) || 0;
            this.jobExecutions.set(region.regionId, count + 1);
          } catch (err) {
            console.error(`Error in scheduled weather job for region ${region.regionId}:`, err);
          } finally {
            scheduleNext();
          }
        }, delay);

        this.intervals.set(region.regionId, timer);
      };

      scheduleNext();
    }
  }

  stop(): void {
    this.isRunning = false;
    for (const [regionId, timer] of this.intervals.entries()) {
      clearTimeout(timer);
    }
    this.intervals.clear();
  }

  getJobExecutionCount(regionId: string): number {
    return this.jobExecutions.get(regionId.toUpperCase()) || 0;
  }

  getMonitoredRegions(): RegionalWeatherTask[] {
    return [...this.regions];
  }
}
