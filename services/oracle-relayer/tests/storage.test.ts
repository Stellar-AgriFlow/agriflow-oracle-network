import { describe, it, expect, beforeEach } from 'vitest';
import { CommodityStorage } from '../src/storage/commodityDb';
import { WeatherStorage } from '../src/storage/weatherDb';

describe('Relayer SQLite Observation Storage', () => {
  let commodityDb: CommodityStorage;
  let weatherDb: WeatherStorage;

  beforeEach(() => {
    commodityDb = new CommodityStorage(':memory:');
    weatherDb = new WeatherStorage(':memory:');
  });

  describe('CommodityStorage', () => {
    it('persists and retrieves commodity price observations in descending chronological order', () => {
      const now = Math.floor(Date.now() / 1000);

      commodityDb.savePriceObservation({
        symbol: 'WHEAT',
        priceUsdCents: 65000,
        source: 'AGRI_BENCHMARK',
        timestamp: now - 100,
      });

      commodityDb.savePriceObservation({
        symbol: 'WHEAT',
        priceUsdCents: 65200,
        source: 'GLOBAL_GRAIN',
        timestamp: now,
      });

      const history = commodityDb.getHistoricalPrices('WHEAT');
      expect(history.length).toBe(2);
      expect(history[0].priceUsdCents).toBe(65200);
      expect(history[1].priceUsdCents).toBe(65000);
    });

    it('calculates historical TWAP over observation window', () => {
      const now = Math.floor(Date.now() / 1000);

      commodityDb.savePriceObservation({
        symbol: 'SOYBEAN',
        priceUsdCents: 120000,
        source: 'SRC_A',
        timestamp: now - 300,
      });

      commodityDb.savePriceObservation({
        symbol: 'SOYBEAN',
        priceUsdCents: 124000,
        source: 'SRC_B',
        timestamp: now - 100,
      });

      const twap = commodityDb.calculateHistoricalTwap('SOYBEAN', 3600);
      expect(twap).toBe(122000);
    });

    it('returns null when calculating TWAP with no records in window', () => {
      const twap = commodityDb.calculateHistoricalTwap('COFFEE', 3600);
      expect(twap).toBeNull();
    });
  });

  describe('WeatherStorage', () => {
    it('persists regional weather observations and calculates 7-day average precipitation', () => {
      const now = Math.floor(Date.now() / 1000);

      weatherDb.saveObservation({
        regionId: 'SUB_SAHARAN_A',
        rainfallMm: 45,
        temperatureCelsius: 28,
        humidityPercent: 65,
        droughtIndex: 12,
        timestamp: now - 500,
      });

      weatherDb.saveObservation({
        regionId: 'SUB_SAHARAN_A',
        rainfallMm: 55,
        temperatureCelsius: 26,
        humidityPercent: 70,
        droughtIndex: 10,
        timestamp: now,
      });

      const history = weatherDb.getRegionalHistory('SUB_SAHARAN_A');
      expect(history.length).toBe(2);
      expect(history[0].rainfallMm).toBe(55);

      const avgRainfall = weatherDb.getAverageRainfall('SUB_SAHARAN_A', 3600);
      expect(avgRainfall).toBe(50);
    });
  });
});
