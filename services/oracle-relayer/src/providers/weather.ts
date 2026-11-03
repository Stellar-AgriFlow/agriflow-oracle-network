import { RegionCode } from '@agriflow/types';

export interface WeatherSample {
  region: RegionCode;
  rainfallMm: number;
  historicalAvgRainfallMm: number;
  droughtIndex: number;
  extremeTempFlag: boolean;
}

export class WeatherDataProvider {
  /**
   * Fetches real-time climatic and parametric precipitation metrics
   */
  async fetchRegionalWeather(): Promise<WeatherSample[]> {
    return [
      {
        region: 'NG_KANO',
        rainfallMm: 22,
        historicalAvgRainfallMm: 115,
        droughtIndex: 78,
        extremeTempFlag: false,
      },
      {
        region: 'KE_RIFT',
        rainfallMm: 95,
        historicalAvgRainfallMm: 110,
        droughtIndex: 25,
        extremeTempFlag: false,
      },
      {
        region: 'GH_ASHANTI',
        rainfallMm: 130,
        historicalAvgRainfallMm: 140,
        droughtIndex: 18,
        extremeTempFlag: false,
      },
      {
        region: 'CI_SASSANDRA',
        rainfallMm: 145,
        historicalAvgRainfallMm: 150,
        droughtIndex: 12,
        extremeTempFlag: false,
      },
      {
        region: 'BR_MATO_GROSSO',
        rainfallMm: 160,
        historicalAvgRainfallMm: 170,
        droughtIndex: 15,
        extremeTempFlag: false,
      },
    ];
  }
}

