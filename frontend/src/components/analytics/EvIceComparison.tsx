import React, { useState, useEffect } from 'react';
import { Scale, Zap, Fuel, DollarSign, Leaf, Info } from 'lucide-react';
import { getComparison } from '../../services/api';
import { EvIceComparisonData } from '../../types';

export const EvIceComparison: React.FC = () => {
  const [distanceKm, setDistanceKm] = useState<number>(50);
  const [comparison, setComparison] = useState<EvIceComparisonData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchComparisonData = async (dist: number) => {
    try {
      setLoading(true);
      const data = await getComparison(dist);
      setComparison(data);
    } catch (err) {
      console.error('Failed to load comparison data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData(distanceKm);
  }, [distanceKm]);

  const presets = [15, 30, 50, 100, 250];

  return (
    <div className="space-y-6">
      {/* Interactive Distance Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Scale className="w-4 h-4 text-eco-400" />
              <span>EV vs. Internal Combustion Engine (ICE) Calculator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate emissions and operational cost differentials across powertrains
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Quick Distance:</span>
            {presets.map((d) => (
              <button
                key={d}
                onClick={() => setDistanceKm(d)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition-all ${
                  distanceKm === d
                    ? 'bg-eco-500 text-slate-950 border-eco-500 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                {d} km
              </button>
            ))}
          </div>
        </div>

        {/* Distance Slider */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>Simulation Distance</span>
            <span className="text-white font-bold text-sm">{distanceKm} km</span>
          </div>
          <input
            type="range"
            min="5"
            max="500"
            step="5"
            value={distanceKm}
            onChange={(e) => setDistanceKm(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-eco-500"
          />
        </div>
      </div>

      {comparison && (
        <>
          {/* Key Savings Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-eco-950/40 border border-eco-500/30 rounded-xl p-4 flex items-center space-x-3.5">
              <div className="p-2.5 rounded-lg bg-eco-500/20 text-eco-400">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-eco-300/80 font-medium">Net CO₂ Reduction</span>
                <p className="text-2xl font-bold text-white tracking-tight">
                  -{comparison.co2_savings_kg} kg{' '}
                  <span className="text-xs font-normal text-eco-400">
                    ({comparison.co2_reduction_percentage}%)
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex items-center space-x-3.5">
              <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-emerald-300/80 font-medium">Energy Cost Savings</span>
                <p className="text-2xl font-bold text-white tracking-tight">
                  ${comparison.cost_savings_usd}{' '}
                  <span className="text-xs font-normal text-emerald-400">USD saved</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3.5">
              <div className="p-2.5 rounded-lg bg-sky-500/20 text-sky-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Electricity Consumption</span>
                <p className="text-2xl font-bold text-white tracking-tight font-mono">
                  {((distanceKm / 100) * 16.0).toFixed(1)} kWh
                </p>
              </div>
            </div>
          </div>

          {/* Powertrain Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Petrol ICE */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Petrol (ICE)</span>
                <Fuel className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-bold text-white tracking-tight mb-1">
                {comparison.ice_petrol_co2_kg} kg
              </p>
              <p className="text-[11px] text-slate-400 mb-4 font-mono">
                {((distanceKm / 100) * 7.5).toFixed(1)} Liters consumed
              </p>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                <span>Trip Cost</span>
                <span className="font-bold text-white font-mono">${comparison.ice_cost_usd}</span>
              </div>
            </div>

            {/* Diesel ICE */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Diesel (ICE)</span>
                <Fuel className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white tracking-tight mb-1">
                {comparison.ice_diesel_co2_kg} kg
              </p>
              <p className="text-[11px] text-slate-400 mb-4 font-mono">
                {((distanceKm / 100) * 6.2).toFixed(1)} Liters consumed
              </p>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                <span>Trip Cost</span>
                <span className="font-bold text-white font-mono">
                  ${((distanceKm / 100) * 6.2 * 1.45).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Hybrid */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Hybrid HEV</span>
                <Zap className="w-4 h-4 text-teal-400" />
              </div>
              <p className="text-2xl font-bold text-white tracking-tight mb-1">
                {comparison.hybrid_co2_kg} kg
              </p>
              <p className="text-[11px] text-slate-400 mb-4 font-mono">
                {((distanceKm / 100) * 4.5).toFixed(1)} Liters consumed
              </p>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                <span>Trip Cost</span>
                <span className="font-bold text-white font-mono">
                  ${((distanceKm / 100) * 4.5 * 1.35).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Electric Vehicle */}
            <div className="bg-slate-900 border border-eco-500/40 rounded-xl p-5 shadow-sm bg-eco-950/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-eco-400">Battery EV</span>
                <Zap className="w-4 h-4 text-eco-400" />
              </div>
              <p className="text-2xl font-bold text-eco-400 tracking-tight mb-1">
                {comparison.ev_co2_kg} kg
              </p>
              <p className="text-[11px] text-slate-400 mb-4 font-mono">
                {((distanceKm / 100) * 16.0).toFixed(1)} kWh energy
              </p>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                <span>Trip Cost</span>
                <span className="font-bold text-eco-400 font-mono">${comparison.ev_cost_usd}</span>
              </div>
            </div>
          </div>

          {/* Documented Assumptions Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Calculation Assumptions & Scientific Basis</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-400">
              <div className="p-2.5 bg-slate-850 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Petrol Benchmark</span>
                <span className="font-mono text-slate-200">{comparison.assumptions.petrol_baseline}</span>
              </div>
              <div className="p-2.5 bg-slate-850 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Diesel Benchmark</span>
                <span className="font-mono text-slate-200">{comparison.assumptions.diesel_baseline}</span>
              </div>
              <div className="p-2.5 bg-slate-850 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">EV Benchmark</span>
                <span className="font-mono text-slate-200">{comparison.assumptions.ev_baseline}</span>
              </div>
              <div className="p-2.5 bg-slate-850 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Grid Carbon Intensity</span>
                <span className="font-mono text-slate-200">{comparison.assumptions.grid_carbon_intensity}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
