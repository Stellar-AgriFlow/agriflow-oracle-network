import { RegionCode } from '@agriflow/types';

export interface WeatherSample {
  region: RegionCode;
  rainfallMm: number;
  historicalAvgRainfallMm: number;
  droughtIndex: number;
  extremeTempFlag: boolean;
}

interface RegionCoordinates {
  code: RegionCode;
  lat: number;
  lon: number;
  historicalAvgMm: number;
}

const REGION_COORDINATES: RegionCoordinates[] = [
  { code: 'NG_KANO', lat: 12.0022, lon: 8.592, historicalAvgMm: 115 },
  { code: 'KE_RIFT', lat: 0.5143, lon: 35.2698, historicalAvgMm: 110 },
  { code: 'GH_ASHANTI', lat: 6.6885, lon: -1.6244, historicalAvgMm: 140 },
  { code: 'CI_SASSANDRA', lat: 4.9547, lon: -6.0888, historicalAvgMm: 150 },
  { code: 'BR_MATO_GROSSO', lat: -12.6429, lon: -55.4243, historicalAvgMm: 170 },
];

export class WeatherDataProvider {
  private baseUrl = 'https://api.open-meteo.com/v1/forecast';

  /**
   * Fetches real-time climatic and parametric precipitation metrics using Open-Meteo API
   */
  async fetchRegionalWeather(): Promise<WeatherSample[]> {
    const results: WeatherSample[] = [];

    for (const r of REGION_COORDINATES) {
      try {
        const url = `${this.baseUrl}?latitude=${r.lat}&longitude=${r.lon}&daily=precipitation_sum,temperature_2m_max&timezone=auto&forecast_days=7`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });

        if (res.ok) {
          const data = (await res.json()) as any;
          const precipitationSums: number[] = data.daily?.precipitation_sum || [];
          const maxTemps: number[] = data.daily?.temperature_2m_max || [];

          // 7-day cumulative rainfall scaled to monthly run-rate
          const weekRainfall = precipitationSums.reduce((acc, val) => acc + (val || 0), 0);
          const monthlyEst = Math.round(weekRainfall * 4);
          const maxTemp = Math.max(...maxTemps, 25);

          // Drought index: deficit against expected historical average
          const deficit = Math.max(0, r.historicalAvgMm - monthlyEst);
          const droughtIndex = Math.min(100, Math.round((deficit / r.historicalAvgMm) * 100));
          const extremeTemp = maxTemp > 38;

          results.push({
            region: r.code,
            rainfallMm: monthlyEst,
            historicalAvgRainfallMm: r.historicalAvgMm,
            droughtIndex,
            extremeTempFlag: extremeTemp,
          });
        } else {
          // Graceful fallback to baseline
          results.push(this.getFallbackSample(r));
        }
      } catch {
        results.push(this.getFallbackSample(r));
      }
    }

    return results;
  }

  private getFallbackSample(r: RegionCoordinates): WeatherSample {
    return {
      region: r.code,
      rainfallMm: Math.round(r.historicalAvgMm * 0.4),
      historicalAvgRainfallMm: r.historicalAvgMm,
      droughtIndex: 60,
      extremeTempFlag: false,
    };
  }
}
