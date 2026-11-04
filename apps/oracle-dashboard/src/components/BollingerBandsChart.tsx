'use client';

import React, { useState } from 'react';
import { TrendingUp, ShieldAlert, BarChart3, Info } from 'lucide-react';

export interface PricePoint {
  period: string;
  price: number;
  sma: number;
  upperBand: number;
  lowerBand: number;
}

const SAMPLE_BOLLINGER_DATA: Record<string, PricePoint[]> = {
  MAIZE: [
    { period: 'T-6', price: 4.32, sma: 4.30, upperBand: 4.45, lowerBand: 4.15 },
    { period: 'T-5', price: 4.36, sma: 4.32, upperBand: 4.48, lowerBand: 4.16 },
    { period: 'T-4', price: 4.38, sma: 4.34, upperBand: 4.50, lowerBand: 4.18 },
    { period: 'T-3', price: 4.45, sma: 4.37, upperBand: 4.54, lowerBand: 4.20 },
    { period: 'T-2', price: 4.40, sma: 4.39, upperBand: 4.55, lowerBand: 4.23 },
    { period: 'T-1', price: 4.41, sma: 4.40, upperBand: 4.56, lowerBand: 4.24 },
    { period: 'NOW', price: 4.42, sma: 4.41, upperBand: 4.57, lowerBand: 4.25 },
  ],
  WHEAT: [
    { period: 'T-6', price: 5.95, sma: 5.92, upperBand: 6.12, lowerBand: 5.72 },
    { period: 'T-5', price: 5.90, sma: 5.91, upperBand: 6.10, lowerBand: 5.72 },
    { period: 'T-4', price: 5.86, sma: 5.90, upperBand: 6.08, lowerBand: 5.72 },
    { period: 'T-3', price: 5.82, sma: 5.88, upperBand: 6.06, lowerBand: 5.70 },
    { period: 'T-2', price: 5.85, sma: 5.87, upperBand: 6.04, lowerBand: 5.70 },
    { period: 'T-1', price: 5.87, sma: 5.87, upperBand: 6.03, lowerBand: 5.71 },
    { period: 'NOW', price: 5.88, sma: 5.87, upperBand: 6.03, lowerBand: 5.71 },
  ],
  COCOA: [
    { period: 'T-6', price: 7450, sma: 7500, upperBand: 7900, lowerBand: 7100 },
    { period: 'T-5', price: 7580, sma: 7550, upperBand: 8000, lowerBand: 7100 },
    { period: 'T-4', price: 7650, sma: 7600, upperBand: 8080, lowerBand: 7120 },
    { period: 'T-3', price: 7790, sma: 7680, upperBand: 8180, lowerBand: 7180 },
    { period: 'T-2', price: 7850, sma: 7750, upperBand: 8250, lowerBand: 7250 },
    { period: 'T-1', price: 7890, sma: 7800, upperBand: 8300, lowerBand: 7300 },
    { period: 'NOW', price: 7920, sma: 7840, upperBand: 8350, lowerBand: 7330 },
  ],
};

export const BollingerBandsChart: React.FC = () => {
  const [selectedCommodity, setSelectedCommodity] = useState<'MAIZE' | 'WHEAT' | 'COCOA'>('MAIZE');

  const data = SAMPLE_BOLLINGER_DATA[selectedCommodity];
  const latest = data[data.length - 1];

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = 40;

  const minPrice = Math.min(...data.map((d) => d.lowerBand)) * 0.98;
  const maxPrice = Math.max(...data.map((d) => d.upperBand)) * 1.02;

  const getX = (idx: number) => padding + (idx * (svgWidth - 2 * padding)) / (data.length - 1);
  const getY = (val: number) =>
    svgHeight - padding - ((val - minPrice) / (maxPrice - minPrice)) * (svgHeight - 2 * padding);

  const upperBandPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.upperBand)}`).join(' ');
  const lowerBandPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.lowerBand)}`).join(' ');
  const smaPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.sma)}`).join(' ');
  const pricePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.price)}`).join(' ');

  // Shaded area between upper and lower band
  const areaPath = `${upperBandPath} ${data
    .slice()
    .reverse()
    .map((d, i) => `L ${getX(data.length - 1 - i)} ${getY(d.lowerBand)}`)
    .join(' ')} Z`;

  const percentB = ((latest.price - latest.lowerBand) / (latest.upperBand - latest.lowerBand)) * 100;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Bollinger Volatility Bands (20-SMA, ±2σ)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical deviation boundaries for circuit breaker activation and outlier filtering
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['MAIZE', 'WHEAT', 'COCOA'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCommodity(c)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedCommodity === c
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[500px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Volatility Channel Fill */}
          <path d={areaPath} fill="rgba(16, 185, 129, 0.08)" />

          {/* Grid lines */}
          <line
            x1={padding}
            y1={getY(latest.upperBand)}
            x2={svgWidth - padding}
            y2={getY(latest.upperBand)}
            stroke="#334155"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={getY(latest.lowerBand)}
            x2={svgWidth - padding}
            y2={getY(latest.lowerBand)}
            stroke="#334155"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Upper Band */}
          <path d={upperBandPath} stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />

          {/* Lower Band */}
          <path d={lowerBandPath} stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />

          {/* 20-SMA Line */}
          <path d={smaPath} stroke="#64748b" strokeWidth="1.5" />

          {/* Spot Price Line */}
          <path d={pricePath} stroke="#38bdf8" strokeWidth="2.5" />

          {/* Data Points */}
          {data.map((d, i) => (
            <g key={i}>
              <circle cx={getX(i)} cy={getY(d.price)} r="4" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
              <text
                x={getX(i)}
                y={svgHeight - 12}
                textAnchor="middle"
                fontSize="10"
                fill="#94a3b8"
                fontFamily="monospace"
              >
                {d.period}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Key Metric Stats Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="bg-slate-800/50 p-2.5 rounded-lg">
          <span className="text-slate-400 block mb-0.5">Current Spot</span>
          <span className="font-mono font-bold text-white text-sm">
            ${selectedCommodity === 'COCOA' ? latest.price.toLocaleString() : latest.price.toFixed(2)}
          </span>
        </div>
        <div className="bg-slate-800/50 p-2.5 rounded-lg">
          <span className="text-slate-400 block mb-0.5">Upper Band (+2σ)</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            ${selectedCommodity === 'COCOA' ? latest.upperBand.toLocaleString() : latest.upperBand.toFixed(2)}
          </span>
        </div>
        <div className="bg-slate-800/50 p-2.5 rounded-lg">
          <span className="text-slate-400 block mb-0.5">Lower Band (-2σ)</span>
          <span className="font-mono font-bold text-rose-400 text-sm">
            ${selectedCommodity === 'COCOA' ? latest.lowerBand.toLocaleString() : latest.lowerBand.toFixed(2)}
          </span>
        </div>
        <div className="bg-slate-800/50 p-2.5 rounded-lg">
          <span className="text-slate-400 block mb-0.5">%B Channel Position</span>
          <span className="font-mono font-bold text-blue-400 text-sm">{percentB.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};
