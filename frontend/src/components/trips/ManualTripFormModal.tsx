import React, { useState } from 'react';
import { X, Plus, AlertCircle, Check } from 'lucide-react';
import { TripCreate } from '../../types';
import { createTrip } from '../../services/api';

interface ManualTripFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated: () => void;
}

export const ManualTripFormModal: React.FC<ManualTripFormModalProps> = ({
  isOpen,
  onClose,
  onTripCreated,
}) => {
  const [vehicleType, setVehicleType] = useState('Petrol');
  const [distanceKm, setDistanceKm] = useState('18.5');
  const [durationMinutes, setDurationMinutes] = useState('26.0');
  const [avgSpeedKmh, setAvgSpeedKmh] = useState('42.7');
  const [maxSpeedKmh, setMaxSpeedKmh] = useState('74.0');
  const [idleMinutes, setIdleMinutes] = useState('1.5');
  const [harshAccelCount, setHarshAccelCount] = useState('0');
  const [harshBrakeCount, setHarshBrakeCount] = useState('0');
  const [fuelConsumedLiters, setFuelConsumedLiters] = useState('');
  const [energyConsumedKwh, setEnergyConsumedKwh] = useState('');
  const [notes, setNotes] = useState('Suburban commute');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const dist = parseFloat(distanceKm);
    const dur = parseFloat(durationMinutes);
    const avgSpd = parseFloat(avgSpeedKmh);
    const maxSpd = parseFloat(maxSpeedKmh);
    const idle = parseFloat(idleMinutes) || 0;
    const hAccel = parseInt(harshAccelCount) || 0;
    const hBrake = parseInt(harshBrakeCount) || 0;

    if (isNaN(dist) || dist <= 0) {
      setError('Distance must be a positive number.');
      return;
    }
    if (isNaN(dur) || dur <= 0) {
      setError('Duration must be a positive number.');
      return;
    }
    if (maxSpd < avgSpd) {
      setError('Maximum speed cannot be less than average speed.');
      return;
    }
    if (idle > dur) {
      setError('Idle time cannot exceed total trip duration.');
      return;
    }

    const payload: TripCreate = {
      vehicle_type: vehicleType,
      distance_km: dist,
      duration_minutes: dur,
      avg_speed_kmh: avgSpd,
      max_speed_kmh: maxSpd,
      idle_minutes: idle,
      harsh_accel_count: hAccel,
      harsh_brake_count: hBrake,
      fuel_consumed_liters: fuelConsumedLiters ? parseFloat(fuelConsumedLiters) : null,
      energy_consumed_kwh: energyConsumedKwh ? parseFloat(energyConsumedKwh) : null,
      notes: notes.trim() || undefined,
    };

    try {
      setLoading(true);
      await createTrip(payload);
      onTripCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to record trip. Check your input values.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Log Driving Trip</h3>
            <p className="text-xs text-slate-400">Manual trip telemetry entry</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Vehicle Type selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Powertrain / Vehicle Type</label>
            <div className="grid grid-cols-4 gap-2">
              {['Petrol', 'Diesel', 'Hybrid', 'EV'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setVehicleType(type)}
                  className={`py-2 rounded-lg font-medium border text-center transition-all ${
                    vehicleType === type
                      ? 'bg-eco-500 text-slate-950 border-eco-500 font-semibold shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Distance (km) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-eco-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Duration (minutes) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-eco-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Avg Speed (km/h)</label>
              <input
                type="number"
                step="0.1"
                required
                value={avgSpeedKmh}
                onChange={(e) => setAvgSpeedKmh(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-eco-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Max Speed (km/h)</label>
              <input
                type="number"
                step="0.1"
                required
                value={maxSpeedKmh}
                onChange={(e) => setMaxSpeedKmh(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-eco-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Idle Time (min)</label>
              <input
                type="number"
                step="0.1"
                value={idleMinutes}
                onChange={(e) => setIdleMinutes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-eco-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Harsh Accelerations</label>
              <input
                type="number"
                min="0"
                value={harshAccelCount}
                onChange={(e) => setHarshAccelCount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-eco-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Harsh Braking Events</label>
              <input
                type="number"
                min="0"
                value={harshBrakeCount}
                onChange={(e) => setHarshBrakeCount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-eco-500 focus:outline-none"
              />
            </div>
          </div>

          {vehicleType === 'EV' ? (
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Energy Consumed (kWh) <span className="text-slate-500">(Optional — estimated if blank)</span>
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 3.2"
                value={energyConsumedKwh}
                onChange={(e) => setEnergyConsumedKwh(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-eco-500 focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Fuel Consumed (Liters) <span className="text-slate-500">(Optional — estimated if blank)</span>
              </label>
              <input
                type="number"
                step="0.05"
                placeholder="e.g. 1.25"
                value={fuelConsumedLiters}
                onChange={(e) => setFuelConsumedLiters(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-eco-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">Route / Journey Notes</label>
            <input
              type="text"
              placeholder="e.g. Morning commute via Expressway"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-eco-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-eco-500 hover:bg-eco-400 text-slate-950 font-semibold flex items-center space-x-1.5 shadow-sm shadow-eco-500/20 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Analyzing...' : 'Log & Analyze Trip'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
