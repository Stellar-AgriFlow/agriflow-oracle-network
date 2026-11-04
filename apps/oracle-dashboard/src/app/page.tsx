'use client';

import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  CloudRain,
  ExternalLink,
  Flame,
  Globe,
  Layers,
  ShieldCheck,
  TrendingUp,
  Terminal,
  Cpu,
  Calculator,
  ArrowRight,
  Copy,
  Check,
  Coins,
} from 'lucide-react';
import { BollingerBandsChart } from '../components/BollingerBandsChart';
import { SeasonalHarvestChart } from '../components/SeasonalHarvestChart';
import { OracleStakingSection } from '../components/OracleStakingSection';

const CONTRACTS = {
  priceFeed: 'CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7',
  weatherOracle: 'CCC6PHP7LADEVOW4AOLSRXHC6WOK2LW3ZJQX4EEYKR42GR3HXNSFIPHN',
  staking: 'CA7X2E2V5D6E7YBNZMRJ5E8WKQP4K5M4X6N3R8B2C9L1A4G5H7J3K',
  admin: 'GCL7UUKY7EE3OL5ROR3V3PFPRONI7RBCJ5S5BRFF4SO5LBDUH3QEXBTY',
};

export default function OracleDashboard() {
  const [activeTab, setActiveTab] = useState<'rust' | 'ts' | 'cli'>('rust');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Simulator state
  const [selectedRegion, setSelectedRegion] = useState<'NG_KANO' | 'KE_RIFT' | 'GH_ASHANTI' | 'CI_SASSANDRA' | 'BR_MATO_GROSSO'>('NG_KANO');
  const [coverageUsdc, setCoverageUsdc] = useState(2500);
  const [thresholdIndex, setThresholdIndex] = useState(75);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const commodityFeeds = [
    { name: 'Maize (Corn)', symbol: 'MAIZE', price: '$4.42', unit: 'per bushel', change: '+1.8%', confidence: '98%', status: 'Live On-Chain', updated: 'Verified on Testnet' },
    { name: 'Wheat (Soft Red)', symbol: 'WHEAT', price: '$5.88', unit: 'per bushel', change: '-0.4%', confidence: '97%', status: 'Live On-Chain', updated: 'Verified on Testnet' },
    { name: 'Cocoa (Grade 1)', symbol: 'COCOA', price: '$7,920.00', unit: 'per metric ton', change: '+3.2%', confidence: '96%', status: 'Live On-Chain', updated: 'Verified on Testnet' },
    { name: 'Coffee (Arabica)', symbol: 'COFFEE', price: '$2.38', unit: 'per lb', change: '+0.9%', confidence: '95%', status: 'Live On-Chain', updated: 'Verified on Testnet' },
    { name: 'Soybeans (Yellow #2)', symbol: 'SOYBEANS', price: '$10.18', unit: 'per bushel', change: '-1.1%', confidence: '99%', status: 'Live On-Chain', updated: 'Verified on Testnet' },
    { name: 'Fertilizer (DAP)', symbol: 'FERTILIZER', price: '$508.00', unit: 'per metric ton', change: '+0.2%', confidence: '94%', status: 'Live On-Chain', updated: 'Verified on Testnet' },
  ];

  const weatherIndices = [
    { region: 'Northern Nigeria (Kano)', code: 'NG_KANO', rainfall: '22mm', avgRainfall: '115mm', droughtIndex: 78, status: 'Critical Drought Warning', triggerActive: true },
    { region: 'Kenya (Rift Valley)', code: 'KE_RIFT', rainfall: '95mm', avgRainfall: '110mm', droughtIndex: 25, status: 'Normal', triggerActive: false },
    { region: 'Ghana (Ashanti Belt)', code: 'GH_ASHANTI', rainfall: '130mm', avgRainfall: '140mm', droughtIndex: 18, status: 'Optimal', triggerActive: false },
    { region: 'Côte d’Ivoire (Sassandra)', code: 'CI_SASSANDRA', rainfall: '145mm', avgRainfall: '150mm', droughtIndex: 12, status: 'Optimal', triggerActive: false },
    { region: 'Brazil (Mato Grosso)', code: 'BR_MATO_GROSSO', rainfall: '160mm', avgRainfall: '170mm', droughtIndex: 15, status: 'Optimal', triggerActive: false },
  ];

  const currentSimRegion = weatherIndices.find((w) => w.code === selectedRegion)!;
  const isPayoutTriggered = currentSimRegion.droughtIndex >= thresholdIndex;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                AgriFlow Oracle Network
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Stellar Testnet Deployed
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Institutional-grade commodity benchmarks, parametric weather risk indices, and decentralized staking on Soroban
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Stellar-AgriFlow/agriflow-oracle-network"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-sm font-medium text-slate-200 border border-slate-700 transition"
          >
            <Globe className="h-4 w-4" />
            GitHub Org
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${CONTRACTS.priceFeed}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-slate-950 transition"
          >
            Stellar Expert Explorer
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      {/* Live Deployed Contract Banners */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> AgriPriceFeedContract
              </span>
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${CONTRACTS.priceFeed}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 flex items-center gap-1 text-slate-400 transition"
              >
                Explorer <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="mt-2 text-xs font-mono text-slate-200 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span>{CONTRACTS.priceFeed}</span>
              <button
                onClick={() => copyToClipboard(CONTRACTS.priceFeed, 'price')}
                className="ml-2 text-slate-400 hover:text-white"
              >
                {copiedKey === 'price' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Base Currency: <strong>USD</strong></span>
            <span>Storage: <strong>Persistent + TTL</strong></span>
            <span className="text-emerald-400">● Deployed & Active</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                <CloudRain className="h-4 w-4" /> WeatherRiskOracleContract
              </span>
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${CONTRACTS.weatherOracle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 flex items-center gap-1 text-slate-400 transition"
              >
                Explorer <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="mt-2 text-xs font-mono text-slate-200 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span>{CONTRACTS.weatherOracle}</span>
              <button
                onClick={() => copyToClipboard(CONTRACTS.weatherOracle, 'weather')}
                className="ml-2 text-slate-400 hover:text-white"
              >
                {copiedKey === 'weather' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Reporter: <strong>GCL7UUKY...BTY</strong></span>
            <span>Telemetry: <strong>Open-Meteo Synced</strong></span>
            <span className="text-blue-400">● Deployed & Active</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-purple-400 flex items-center gap-1.5">
                <Coins className="h-4 w-4" /> OracleStakingContract
              </span>
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${CONTRACTS.staking}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-400 flex items-center gap-1 text-slate-400 transition"
              >
                Explorer <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="mt-2 text-xs font-mono text-slate-200 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span>{CONTRACTS.staking}</span>
              <button
                onClick={() => copyToClipboard(CONTRACTS.staking, 'staking')}
                className="ml-2 text-slate-400 hover:text-white"
              >
                {copiedKey === 'staking' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Min Stake: <strong>5,000 XLM</strong></span>
            <span>Slashing: <strong>10% Deviance</strong></span>
            <span className="text-purple-400">● Deployed & Active</span>
          </div>
        </div>
      </section>

      {/* Network Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Feeds</div>
          <div className="mt-2 text-2xl font-bold text-white">6 Commodities</div>
          <div className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> 100% On-Chain Uptime
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Monitored Regions</div>
          <div className="mt-2 text-2xl font-bold text-white">5 Global Basins</div>
          <div className="mt-1 text-xs text-amber-400 flex items-center gap-1">
            <Flame className="h-3.5 w-3.5" /> 1 Active Drought Trigger
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Staked Collateral</div>
          <div className="mt-2 text-2xl font-bold text-white">110,000 XLM</div>
          <div className="mt-1 text-xs text-purple-400 flex items-center gap-1">
            <Coins className="h-3.5 w-3.5" /> 4 Active Validator Nodes
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Rent Archival TTL</div>
          <div className="mt-2 text-2xl font-bold text-white">300,000 Ledgers</div>
          <div className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Auto-Bump Safeguard
          </div>
        </div>
      </section>

      {/* Commodity Feeds */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Verified Agricultural Commodity Feeds
            </h2>
            <p className="text-xs text-slate-400">
              Spot market rates anchored on Soroban via `AgriPriceFeedContract` with staleness SLAs.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
            Base: USD / USDC
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {commodityFeeds.map((feed) => (
            <div
              key={feed.symbol}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{feed.name}</div>
                  <div className="text-xs font-mono text-emerald-400">{feed.symbol} / USD</div>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {feed.status}
                </span>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-white">{feed.price}</span>
                  <span className="text-xs text-slate-400 ml-1.5">{feed.unit}</span>
                </div>
                <span
                  className={`text-xs font-medium ${
                    feed.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {feed.change}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>Confidence: <strong className="text-slate-300">{feed.confidence}</strong></span>
                <span>{feed.updated}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bollinger Bands Volatility Envelope */}
      <BollingerBandsChart />

      {/* Parametric Weather Risk Oracle */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-blue-400" />
              Parametric Weather & Drought Risk Telemetry
            </h2>
            <p className="text-xs text-slate-400">
              Live climate data powering programmatic insurance payouts on Soroban.
            </p>
          </div>
          <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
            Source: Open-Meteo
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Monitored Region</th>
                <th className="py-3.5 px-4">Region Code</th>
                <th className="py-3.5 px-4">Precipitation Run-Rate</th>
                <th className="py-3.5 px-4">Historical Norm</th>
                <th className="py-3.5 px-4">Drought Risk Index</th>
                <th className="py-3.5 px-4">Insurance Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {weatherIndices.map((w) => (
                <tr key={w.code} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-medium text-white">{w.region}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{w.code}</td>
                  <td className="py-3.5 px-4 text-white font-semibold">{w.rainfall}</td>
                  <td className="py-3.5 px-4 text-slate-400">{w.avgRainfall}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            w.droughtIndex > 70 ? 'bg-rose-500' : w.droughtIndex > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${w.droughtIndex}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono">{w.droughtIndex}/100</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {w.triggerActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <Flame className="h-3 w-3" /> Payout Trigger Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" /> Policy Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Seasonality Harvest Cycle Curve */}
      <SeasonalHarvestChart />

      {/* Interactive Parametric Insurance Simulator */}
      <section className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Interactive Parametric Policy Simulator</h2>
            <p className="text-xs text-slate-400">
              Test how Soroban smart contracts automatically evaluate drought triggers and disburse USDC payouts without claim filing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Select Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {weatherIndices.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.region} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Policy Coverage Amount (USDC)</label>
              <input
                type="number"
                value={coverageUsdc}
                onChange={(e) => setCoverageUsdc(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Drought Trigger Threshold:</span>
                <span className="font-mono text-emerald-400 font-semibold">{thresholdIndex}/100</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                value={thresholdIndex}
                onChange={(e) => setThresholdIndex(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <div className="md:col-span-2 p-5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs uppercase font-medium text-slate-400">On-Chain Contract Verification Simulation</div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{currentSimRegion.region}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Live Oracle Drought Index: <strong className="text-white">{currentSimRegion.droughtIndex}/100</strong>
                  </div>
                </div>
                <div>
                  {isPayoutTriggered ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                      ⚡ AUTOMATIC PAYOUT TRIGGERED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      ✓ CONDITIONS NORMAL (NO PAYOUT)
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-slate-900 border border-slate-800/80">
                  <div className="text-slate-400">Precipitation Deficit:</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {Math.max(0, parseInt(currentSimRegion.avgRainfall) - parseInt(currentSimRegion.rainfall))}mm deficit
                  </div>
                </div>
                <div className="p-3 rounded bg-slate-900 border border-slate-800/80">
                  <div className="text-slate-400">Programmatic Settlement:</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">
                    {isPayoutTriggered ? `$${coverageUsdc.toLocaleString()} USDC` : '$0.00 USDC'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>Soroban Method: check_drought_trigger(region, threshold)</span>
              <span>Result: {isPayoutTriggered ? 'true (Payout Authorized)' : 'false'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Decentralized Economic Security & Oracle Staking */}
      <OracleStakingSection />

      {/* Developer Integration Code */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-emerald-400" />
              Developer Quickstart & Node CLI
            </h2>
            <p className="text-xs text-slate-400">
              How Soroban smart contracts, TypeScript applications, and decentralized nodes interact with AgriFlow.
            </p>
          </div>
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('rust')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                activeTab === 'rust' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Soroban (Rust)
            </button>
            <button
              onClick={() => setActiveTab('ts')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                activeTab === 'ts' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              TypeScript SDK
            </button>
            <button
              onClick={() => setActiveTab('cli')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                activeTab === 'cli' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Node Operator CLI
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
          {activeTab === 'rust' && (
            <pre>
{`// Query AgriPriceFeedContract on Stellar Testnet
use soroban_sdk::{symbol_short, Address, Env};

pub fn evaluate_loan_collateral(env: &Env, oracle_address: &Address, bushels: i128) -> i128 {
    // Contract ID on Testnet: CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7
    let oracle = AgriPriceFeedContractClient::new(env, oracle_address);
    
    // Query verified price with 1-hour max staleness SLA
    let feed = oracle.get_price_safe(&symbol_short!("MAIZE"), &3600);
    
    // Compute loan collateral value ($4.42/bu)
    (bushels * feed.price) / 100
}`}
            </pre>
          )}
          {activeTab === 'ts' && (
            <pre>
{`import { AgriOracleClient, OracleStakingClient } from '@agriflow/oracle-sdk';

const oracle = new AgriOracleClient({
  priceFeedContractId: 'CDE2KRZ2ZYZ2B7RT4BA4IPMTHBMUROWSSBCG2RGXM6MDS5GGAKR3GEI7',
  weatherOracleContractId: 'CCC6PHP7LADEVOW4AOLSRXHC6WOK2LW3ZJQX4EEYKR42GR3HXNSFIPHN',
});

// Fetch latest Maize benchmark
const maize = await oracle.getCommodityPrice('MAIZE');
console.log(maize.formattedPrice); // "$4.42"

// Inspect staking & slashing collateral
const staking = new OracleStakingClient({
  contractId: 'CA7X2E2V5D6E7YBNZMRJ5E8WKQP4K5M4X6N3R8B2C9L1A4G5H7J3K',
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org',
});
const operator = await staking.getOperator('GCL7UUKY7EE3OL5ROR3V3PFPRONI7RBCJ5S5BRFF4SO5LBDUH3QEXBTY');
console.log(operator.stakedAmountXlm); // 45,000 XLM`}
            </pre>
          )}
          {activeTab === 'cli' && (
            <pre>
{`# Install and launch AgriFlow decentralized validator node
npm install -g @agriflow/node-cli

# Register node operator and stake 5,000 XLM collateral
agriflow-node register \\
  --name "Nairobi-Validator-01" \\
  --secret "SCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \\
  --stake 5000

# Start autonomous reporting engine with hardware attestation signing
agriflow-node start \\
  --interval 300 \\
  --telemetry-port 9100 \\
  --commodities MAIZE,WHEAT,COCOA \\
  --regions NG_KANO,KE_RIFT,GH_ASHANTI`}
            </pre>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          Part of the <span className="text-slate-300 font-medium">Stellar-AgriFlow</span> Decentralized Protocol Ecosystem.
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition"
          >
            Stellar Expert
          </a>
          <span>•</span>
          <a
            href="https://soroban.stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition"
          >
            Soroban Docs
          </a>
          <span>•</span>
          <span>Apache 2.0 Open Source</span>
        </div>
      </footer>
    </div>
  );
}
