import { CommoditySymbol, RegionCode } from '@agriflow/types';

export interface AgriOracleConfig {
  networkPassphrase?: string;
  rpcUrl?: string;
  priceFeedContractId: string;
  weatherOracleContractId: string;
}

export interface CommodityQueryOptions {
  maxStalenessSeconds?: number;
}

