export interface RegionalWeatherObservation {
  source: string;
  rainfallMm: number;
  maxTemperatureC: number;
  soilMoistureIndex: number; // 0-100
  timestamp: number;
}

export interface ConsolidatedWeatherMetrics {
  region: string;
  rainfallMm: number;
  historicalAvgRainfallMm: number;
  droughtIndex: number; // 0-100
  extremeTempFlag: boolean;
  confidence: number;
  timestamp: number;
}

export class WeatherMetricsAggregator {
  /**
   * Consolidates weather feeds across independent meteorology sources
   */
  static consolidateRegionalWeather(
    region: string,
    historicalAvgRainfallMm: number,
    observations: RegionalWeatherObservation[]
  ): ConsolidatedWeatherMetrics {
    if (!observations || observations.length === 0) {
      throw new Error(`No weather observations available for region ${region}`);
    }

    // Average rainfall across reporting providers
    const totalRainfall = observations.reduce((acc, o) => acc + o.rainfallMm, 0);
    const avgRainfall = Math.round(totalRainfall / observations.length);

    // Peak temperature check across providers
    const maxTemp = Math.max(...observations.map((o) => o.maxTemperatureC));
    const extremeTempFlag = maxTemp >= 38.0;

    // Calculate drought index: 0 = very wet, 100 = extreme drought
    let droughtIndex = 0;
    if (historicalAvgRainfallMm > 0) {
      if (avgRainfall < historicalAvgRainfallMm) {
        const deficitPercent =
          ((historicalAvgRainfallMm - avgRainfall) / historicalAvgRainfallMm) * 100;
        droughtIndex = Math.min(100, Math.round(deficitPercent));
      }
    }

    // Boost drought severity if extreme heat accompanied deficit
    if (extremeTempFlag && droughtIndex > 50) {
      droughtIndex = Math.min(100, droughtIndex + 10);
    }

    return {
      region,
      rainfallMm: avgRainfall,
      historicalAvgRainfallMm,
      droughtIndex,
      extremeTempFlag,
      confidence: Math.min(99, 80 + observations.length * 5),
      timestamp: Date.now(),
    };
  }
}
