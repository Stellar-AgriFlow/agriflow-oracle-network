# AgriFlow Oracle Consensus & Statistical Aggregation Methodology

## 1. Multi-Source Price Ingestion
The AgriFlow Oracle Relayer aggregates spot commodity pricing from multiple independent market sources:
- Regional Agricultural Commodity Exchanges (e.g. AFEX, EAX, B3)
- Global Benchmark Feeds (World Bank Commodity Pink Sheet, FAO, USDA)
- Decentralized Automated Market Maker Liquidity Pools

## 2. Statistical Outlier Rejection
To prevent spoofing attacks and erroneous data injection, raw incoming reporter data undergoes variance filtering:

$$\text{Median} = M(P_1, P_2, \dots, P_k)$$
$$\text{Valid Price Interval} = [M \times (1 - \delta), M \times (1 + \delta)]$$
where $\delta = 0.10$ (10% allowable maximum variance).

Any reporter price outside this interval is rejected from the consensus round.

## 3. Time-Weighted Average Price (TWAP)
Smart contracts on Soroban query TWAP over an active observation window (e.g. 1 hour or 24 hours):
$$\text{TWAP} = \frac{\sum_{i=1}^n P_i \cdot \Delta t_i}{\sum_{i=1}^n \Delta t_i}$$

## 4. Parametric Weather Risk Consensus
Regional weather telemetry aggregates precipitation ($mm$), temperature ($^\circ C$), and soil moisture from satellite providers (NOAA, ECMWF, Open-Meteo). 

Drought Stress Index ($0 - 100$) is computed via cumulative precipitation deficits against 10-year rolling regional historical baselines.
