import { describe, it, expect, vi } from 'vitest';
import { CommodityCronScheduler } from '../src/scheduler/commodityScheduler';
import { WeatherCronScheduler } from '../src/scheduler/weatherScheduler';

describe('Relayer Background Schedulers', () => {
  it('initializes commodity scheduler with default commodities and tracks running status', () => {
    const scheduler = new CommodityCronScheduler(['WHEAT', 'MAIZE']);
    expect(scheduler.getActiveSymbols()).toEqual(['WHEAT', 'MAIZE']);
    expect(scheduler.getStatus().isRunning).toBe(false);

    const mockHandler = vi.fn().mockResolvedValue(undefined);
    scheduler.start(mockHandler, 50000, 100);

    expect(scheduler.getStatus().isRunning).toBe(true);
    expect(scheduler.getStatus().activeTimers).toBe(2);

    scheduler.stop();
    expect(scheduler.getStatus().isRunning).toBe(false);
    expect(scheduler.getStatus().activeTimers).toBe(0);
  });

  it('initializes weather scheduler with configured agricultural regions', () => {
    const customRegions = [
      { regionId: 'VALLEY_A', latitude: 10.0, longitude: 20.0 },
    ];
    const scheduler = new WeatherCronScheduler(customRegions);
    expect(scheduler.getMonitoredRegions().length).toBe(1);
    expect(scheduler.getMonitoredRegions()[0].regionId).toBe('VALLEY_A');

    const mockHandler = vi.fn().mockResolvedValue(undefined);
    scheduler.start(mockHandler, 60000, 100);
    scheduler.stop();
  });
});
