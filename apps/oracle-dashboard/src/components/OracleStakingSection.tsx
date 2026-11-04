'use client';

import React, { useState } from 'react';
import { ShieldCheck, Coins, AlertTriangle, Flame, Award, Plus, CheckCircle2 } from 'lucide-react';

export interface StakedOperatorItem {
  address: string;
  name: string;
  stakedXlm: number;
  uptimePercent: number;
  totalReports: number;
  totalSlashedXlm: number;
  status: 'ACTIVE' | 'WARNING' | 'SLASHED';
}

const MOCK_OPERATORS: StakedOperatorItem[] = [
  {
    address: 'GCL7UUKY7EE3OL5ROR3V3PFPRONI7RBCJ5S5BRFF4SO5LBDUH3QEXBTY',
    name: 'Primary Nitro Enclave Validator',
    stakedXlm: 45000,
    uptimePercent: 99.98,
    totalReports: 1420,
    totalSlashedXlm: 0,
    status: 'ACTIVE',
  },
  {
    address: 'GBBCOOPFARMER89712KLSADJFOEWIRUDKL',
    name: 'Eldoret Cooperative Relay Node',
    stakedXlm: 25000,
    uptimePercent: 99.85,
    totalReports: 980,
    totalSlashedXlm: 0,
    status: 'ACTIVE',
  },
  {
    address: 'GDMILLER32491OKLNASDUFHWENLKSDFKLJ',
    name: 'Trans-Nzoia Regional Agro-Feed',
    stakedXlm: 18000,
    uptimePercent: 99.40,
    totalReports: 620,
    totalSlashedXlm: 0,
    status: 'ACTIVE',
  },
  {
    address: 'GCORGFARMER555KLSADJFOEWIRUDKL99',
    name: 'West African Cocoa Oracle Node',
    stakedXlm: 22000,
    uptimePercent: 98.90,
    totalReports: 410,
    totalSlashedXlm: 1500, // previously slashed for minor moisture discrepancy
    status: 'WARNING',
  },
];

export const OracleStakingSection: React.FC = () => {
  const [operators, setOperators] = useState<StakedOperatorItem[]>(MOCK_OPERATORS);
  const [stakeAmount, setStakeAmount] = useState<number>(5000);
  const [notice, setNotice] = useState<string | null>(null);

  const totalStakedXlm = operators.reduce((sum, o) => sum + o.stakedXlm, 0);

  const handleSimulateStake = () => {
    if (stakeAmount < 5000) return;
    setOperators((prev) => [
      ...prev,
      {
        address: `GNEWOPERATOR${Date.now().toString().substring(6)}STELLARKEY`,
        name: `Community Node #${prev.length + 1}`,
        stakedXlm: stakeAmount,
        uptimePercent: 100.0,
        totalReports: 0,
        totalSlashedXlm: 0,
        status: 'ACTIVE',
      },
    ]);
    setNotice(`Successfully registered node with ${stakeAmount.toLocaleString()} XLM staked collateral!`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Decentralized Economic Security & Oracle Staking
            </h3>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Soroban Staking Contract Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Oracle nodes stake XLM/SAC tokens into on-chain escrow to guarantee data integrity.
            Deviant reports exceeding MAD threshold trigger automated slash penalties.
          </p>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-6 text-right">
          <div>
            <span className="text-xs text-slate-400 block">Total Protocol Collateral</span>
            <span className="text-xl font-mono font-bold text-emerald-400">
              {totalStakedXlm.toLocaleString()} XLM
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-xs text-slate-400 block">Active Operators</span>
            <span className="text-xl font-mono font-bold text-white">{operators.length} Nodes</span>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-600/40 rounded-lg flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* Operator Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/60 uppercase font-mono text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-3">Operator Node</th>
              <th className="p-3">Staked Collateral</th>
              <th className="p-3">SLA Uptime</th>
              <th className="p-3">Verified Reports</th>
              <th className="p-3">Slashing History</th>
              <th className="p-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {operators.map((op) => (
              <tr key={op.address} className="hover:bg-slate-800/30 transition">
                <td className="p-3 font-sans">
                  <div className="font-semibold text-white">{op.name}</div>
                  <div className="text-slate-500 font-mono text-[11px] truncate max-w-xs">{op.address}</div>
                </td>
                <td className="p-3 font-bold text-white">
                  {op.stakedXlm.toLocaleString()} <span className="text-slate-400 font-normal">XLM</span>
                </td>
                <td className="p-3 text-emerald-400">{op.uptimePercent.toFixed(2)}%</td>
                <td className="p-3 text-slate-200">{op.totalReports.toLocaleString()}</td>
                <td className="p-3">
                  {op.totalSlashedXlm > 0 ? (
                    <span className="text-rose-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                      -{op.totalSlashedXlm.toLocaleString()} XLM
                    </span>
                  ) : (
                    <span className="text-slate-500">0 XLM (Clean)</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      op.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {op.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Operator Onboarding Simulator */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Node Operator Staking Onboarding
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Minimum required stake: <strong className="text-white">5,000 XLM</strong>. Unbonding period: 17,280 ledgers (~24h).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            min={5000}
            step={1000}
            value={stakeAmount}
            onChange={(e) => setStakeAmount(Number(e.target.value))}
            className="w-32 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleSimulateStake}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Stake & Register Node
          </button>
        </div>
      </div>
    </div>
  );
};
