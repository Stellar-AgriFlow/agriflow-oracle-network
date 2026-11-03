import { CommoditySymbol, RegionCode } from '@agriflow/types';

export interface AgriOracleConfig {
  networkPassphrase?: string;
  rpcUrl?: string;
  priceFeedContractId: string;
  weatherOracleContractId: string;
}

export interface CommodityQueryOptions {
  maxStalenessSeconds?: number;
  confidenceThreshold?: number;
}

export interface OracleQuorumStatus {
  activeReportersCount: number;
  requiredQuorum: number;
  isQuorumSatisfied: boolean;
  contractId: string;
}

export interface HistoricalPriceQuery {
  commodity: CommoditySymbol;
  startTime: number;
  endTime: number;
  limit?: number;
}

export interface ParametricTriggerQuery {
  region: RegionCode;
  peril: 'Drought' | 'Flood';
  threshold: number;
}
