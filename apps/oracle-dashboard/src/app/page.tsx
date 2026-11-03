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
} from 'lucide-react';

export default function OracleDashboard() {
  const [activeTab, setActiveTab] = useState<'rust' | 'ts'>('rust');

  const commodityFeeds = [
    { name: 'Maize (Corn)', symbol: 'MAIZE', price: '$4.42', unit: 'per bushel', change: '+1.8%', confidence: '98%', status: 'Live', updated: '28s ago' },
    { name: 'Wheat (Soft Red)', symbol: 'WHEAT', price: '$5.88', unit: 'per bushel', change: '-0.4%', confidence: '97%', status: 'Live', updated: '45s ago' },
    { name: 'Cocoa (Grade 1)', symbol: 'COCOA', price: '$7,920.00', unit: 'per metric ton', change: '+3.2%', confidence: '96%', status: 'Live', updated: '12s ago' },
    { name: 'Coffee (Arabica)', symbol: 'COFFEE', price: '$2.38', unit: 'per lb', change: '+0.9%', confidence: '95%', status: 'Live', updated: '1m ago' },
    { name: 'Soybeans (Yellow #2)', symbol: 'SOYBEANS', price: '$10.18', unit: 'per bushel', change: '-1.1%', confidence: '99%', status: 'Live', updated: '30s ago' },
    { name: 'Fertilizer (DAP)', symbol: 'FERTILIZER', price: '$508.00', unit: 'per metric ton', change: '+0.2%', confidence: '94%', status: 'Live', updated: '2m ago' },
  ];

  const weatherIndices = [
    { region: 'Northern Nigeria (Kano)', code: 'NG_KANO', rainfall: '22mm', avgRainfall: '115mm', droughtIndex: 78, status: 'Drought Warning', triggerActive: true },
    { region: 'Kenya (Rift Valley)', code: 'KE_RIFT', rainfall: '95mm', avgRainfall: '110mm', droughtIndex: 25, status: 'Normal', triggerActive: false },
    { region: 'Ghana (Ashanti Belt)', code: 'GH_ASHANTI', rainfall: '130mm', avgRainfall: '140mm', droughtIndex: 18, status: 'Optimal', triggerActive: false },
    { region: 'Côte d’Ivoire (Sassandra)', code: 'CI_SASSANDRA', rainfall: '145mm', avgRainfall: '150mm', droughtIndex: 12, status: 'Optimal', triggerActive: false },
    { region: 'Brazil (Mato Grosso)', code: 'BR_MATO_GROSSO', rainfall: '160mm', avgRainfall: '170mm', droughtIndex: 15, status: 'Optimal', triggerActive: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                AgriFlow Oracle Network
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Stellar Testnet
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Institutional-grade commodity benchmarks & parametric weather risk indices on Soroban
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
            GitHub Repository
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-slate-950 transition"
          >
            Stellar Explorer
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      {/* Network Health Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Feeds</div>
          <div className="mt-2 text-2xl font-bold text-white">6 Commodities</div>
          <div className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> 100% Operational
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Weather Regions</div>
          <div className="mt-2 text-2xl font-bold text-white">5 Monitored</div>
          <div className="mt-1 text-xs text-amber-400 flex items-center gap-1">
            <Flame className="h-3.5 w-3.5" /> 1 Active Drought Trigger
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Update Cadence</div>
          <div className="mt-2 text-2xl font-bold text-white">~60 Seconds</div>
          <div className="mt-1 text-xs text-slate-400 flex items-center gap-1">
            <Cpu className="h-3.5 w-3.5" /> Automated Relayer Sync
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Soroban TTL</div>
          <div className="mt-2 text-2xl font-bold text-white">300,000 Ledgers</div>
          <div className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Auto-Bumped Storage
          </div>
        </div>
      </section>

      {/* Section 1: Commodity Price Feeds */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Verified Agricultural Commodity Feeds
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated from world spot exchanges, World Bank benchmarks, and validated on-chain via Soroban.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">Contract: AgriPriceFeedContract</span>
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
                <span>Updated: {feed.updated}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Parametric Weather Risk Indices */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-blue-400" />
              Parametric Weather & Drought Risk Oracle
            </h2>
            <p className="text-xs text-slate-400">
              On-chain climate telemetry powering automated crop insurance policies and micro-loan risk underwriting.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">Contract: WeatherRiskOracleContract</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Monitored Region</th>
                <th className="py-3.5 px-4">Region Code</th>
                <th className="py-3.5 px-4">Observed Rainfall</th>
                <th className="py-3.5 px-4">Seasonal Avg</th>
                <th className="py-3.5 px-4">Drought Risk Index</th>
                <th className="py-3.5 px-4">Insurance Status</th>
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
                        <Flame className="h-3 w-3" /> Payout Trigger Met
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

      {/* Section 3: Developer Integration Guide */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-emerald-400" />
              Developer Integration (How Any Soroban Contract Consumes AgriFlow)
            </h2>
            <p className="text-xs text-slate-400">
              Integrate real-time commodity prices or drought insurance triggers into your smart contracts with 3 lines of code.
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
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
          {activeTab === 'rust' ? (
            <pre>
{`// In your Soroban smart contract (e.g. AgriFlow Lending or Escrow)
use soroban_sdk::{symbol_short, Address, Env};

pub fn evaluate_loan_collateral(env: &Env, oracle_address: &Address) -> i128 {
    // 1. Invoke AgriPriceFeed cross-contract call
    let price_feed_client = AgriPriceFeedContractClient::new(env, oracle_address);
    
    // 2. Fetch latest verified price with 3600s staleness guarantee
    let maize_data = price_feed_client.get_price_safe(&symbol_short!("MAIZE"), &3600);
    
    // 3. Return verified reference price ($4.42)
    maize_data.price
}`}
            </pre>
          ) : (
            <pre>
{`import { AgriOracleClient } from '@agriflow/oracle-sdk';

const client = new AgriOracleClient({
  priceFeedContractId: process.env.PRICE_FEED_CONTRACT_ID!,
  weatherOracleContractId: process.env.WEATHER_ORACLE_CONTRACT_ID!,
});

// Fetch latest Maize benchmark
const maize = await client.getCommodityPrice('MAIZE');
console.log(maize.formattedPrice); // "$4.42"

// Fetch drought telemetry for Northern Nigeria
const weather = await client.getWeatherMetrics('NG_KANO');
console.log(weather.droughtIndex); // 78`}
            </pre>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          Part of the <span className="text-slate-300 font-medium">Stellar-AgriFlow</span> Decentralized Protocol Ecosystem.
        </div>
        <div>Apache 2.0 Open Source License • Built on Stellar & Soroban</div>
      </footer>
    </div>
  );
}

