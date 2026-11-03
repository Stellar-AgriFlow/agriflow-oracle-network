export type CommoditySymbol = 'MAIZE' | 'WHEAT' | 'COCOA' | 'COFFEE' | 'SOYBEANS' | 'FERTILIZER';

export interface CommodityPriceFeed {
  commodity: CommoditySymbol;
  price: number;
  decimals: number;
  formattedPrice: string;
  currency: string;
  confidence: number;
  timestamp: number;
  reporter: string;
  isStale: boolean;
}

export type RegionCode = 'NG_KANO' | 'KE_RIFT' | 'GH_ASHANTI' | 'CI_SASSANDRA' | 'BR_MATO_GROSSO';

export interface WeatherRiskMetrics {
  region: RegionCode;
  regionName: string;
  rainfallMm: number;
  historicalAvgRainfallMm: number;
  droughtIndex: number; // 0 - 100
  extremeTempFlag: boolean;
  status: 'OPTIMAL' | 'MODERATE_RISK' | 'CRITICAL_DROUGHT' | 'EXCESS_RAINFALL';
  timestamp: number;
  reporter: string;
}

export interface OracleNodeStatus {
  address: string;
  name: string;
  status: 'ACTIVE' | 'SYNCING' | 'OFFLINE';
  lastReportedTimestamp: number;
  totalSubmissions: number;
  uptimePercentage: number;
}

