'use client';

import React, { useState } from 'react';
import { Calendar, Sun, Snowflake, TrendingUp, AlertCircle } from 'lucide-react';

export interface SeasonalPeriod {
  month: string;
  quarter: string;
  maizeIndex: number; // 100 = neutral
  wheatIndex: number;
  cocoaIndex: number;
}

const SEASONAL_DATA: SeasonalPeriod[] = [
  { month: 'Jan', quarter: 'Q1', maizeIndex: 108.5, wheatIndex: 104.2, cocoaIndex: 96.0 },
  { month: 'Feb', quarter: 'Q1', maizeIndex: 112.0, wheatIndex: 106.5, cocoaIndex: 95.5 },
  { month: 'Mar', quarter: 'Q1', maizeIndex: 115.4, wheatIndex: 108.0, cocoaIndex: 98.2 }, // Lean season peak maize
  { month: 'Apr', quarter: 'Q2', maizeIndex: 110.2, wheatIndex: 105.1, cocoaIndex: 102.5 },
  { month: 'May', quarter: 'Q2', maizeIndex: 104.0, wheatIndex: 101.0, cocoaIndex: 106.0 },
  { month: 'Jun', quarter: 'Q2', maizeIndex: 98.5, wheatIndex: 95.4, cocoaIndex: 108.2 },
  { month: 'Jul', quarter: 'Q3', maizeIndex: 92.0, wheatIndex: 91.2, cocoaIndex: 110.5 }, // Harvest glut maize
  { month: 'Aug', quarter: 'Q3', maizeIndex: 88.5, wheatIndex: 89.0, cocoaIndex: 105.4 },
  { month: 'Sep', quarter: 'Q3', maizeIndex: 87.2, wheatIndex: 92.5, cocoaIndex: 99.0 },
  { month: 'Oct', quarter: 'Q4', maizeIndex: 94.0, wheatIndex: 97.0, cocoaIndex: 92.4 }, // Main crop harvest cocoa
  { month: 'Nov', quarter: 'Q4', maizeIndex: 99.5, wheatIndex: 100.5, cocoaIndex: 91.0 },
  { month: 'Dec', quarter: 'Q4', maizeIndex: 105.0, wheatIndex: 103.0, cocoaIndex: 94.2 },
];

export const SeasonalHarvestChart: React.FC = () => {
  const [activeCrop, setActiveCrop] = useState<'maize' | 'wheat' | 'cocoa'>('maize');

  const getCropValue = (item: SeasonalPeriod) => {
    if (activeCrop === 'maize') return item.maizeIndex;
    if (activeCrop === 'wheat') return item.wheatIndex;
    return item.cocoaIndex;
  };

  const values = SEASONAL_DATA.map(getCropValue);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const peakMonth = SEASONAL_DATA.find((d) => getCropValue(d) === maxVal)?.month;
  const troughMonth = SEASONAL_DATA.find((d) => getCropValue(d) === minVal)?.month;
  const amplitude = (maxVal - minVal).toFixed(1);

  const svgWidth = 600;
  const svgHeight = 200;
  const padding = 35;

  const getX = (idx: number) => padding + (idx * (svgWidth - 2 * padding)) / (SEASONAL_DATA.length - 1);
  const getY = (val: number) =>
    svgHeight - padding - ((val - 80) / (125 - 80)) * (svgHeight - 2 * padding);

  const curvePath = SEASONAL_DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(getCropValue(d))}`).join(' ');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Annual Harvest Cycle & Seasonality Index
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cyclical price indices (Baseline = 100.0) reflecting post-harvest supply gluts and lean-season premiums
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['maize', 'wheat', 'cocoa'] as const).map((crop) => (
            <button
              key={crop}
              onClick={() => setActiveCrop(crop)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                activeCrop === crop
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Seasonality Curve */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[500px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Baseline 100 Line */}
          <line
            x1={padding}
            y1={getY(100)}
            x2={svgWidth - padding}
            y2={getY(100)}
            stroke="#475569"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text x={svgWidth - padding - 65} y={getY(100) - 6} fontSize="10" fill="#94a3b8" fontFamily="monospace">
            Base 100.0
          </text>

          {/* Curve */}
          <path d={curvePath} stroke="#f59e0b" strokeWidth="2.5" />

          {/* Monthly Dots */}
          {SEASONAL_DATA.map((d, i) => {
            const val = getCropValue(d);
            const isPeak = val === maxVal;
            const isTrough = val === minVal;
            return (
              <g key={d.month}>
                <circle
                  cx={getX(i)}
                  cy={getY(val)}
                  r={isPeak || isTrough ? 5 : 3}
                  fill={isPeak ? '#ef4444' : isTrough ? '#10b981' : '#f59e0b'}
                  stroke="#0f172a"
                  strokeWidth="2"
                />
                <text
                  x={getX(i)}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#94a3b8"
                  fontFamily="monospace"
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="bg-slate-800/50 p-2.5 rounded-lg">
          <span className="text-slate-400 block mb-0.5">Peak Premium (Lean Season)</span>
          <span className="font-mono font-bold text-rose-400 text-sm">
            {peakMonth} ({maxVal.toFixed(1)})
          </span>
        </div>
        <div className="bg-slate-800/50 p-2.5 rounded-lg">
          <span className="text-slate-400 block mb-0.5">Trough Discount (Harvest Glut)</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {troughMonth} ({minVal.toFixed(1)})
          </span>
        </div>
        <div className="bg-slate-800/50 p-2.5 rounded-lg">
          <span className="text-slate-400 block mb-0.5">Cycle Amplitude Spread</span>
          <span className="font-mono font-bold text-amber-400 text-sm">+{amplitude}%</span>
        </div>
      </div>
    </div>
  );
};
