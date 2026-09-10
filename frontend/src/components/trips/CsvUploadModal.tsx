import React, { useState, useEffect } from 'react';
import { X, UploadCloud, AlertCircle, Sparkles } from 'lucide-react';
import { uploadTripCsv } from '../../services/api';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripUploaded: () => void;
}

const SAMPLE_COMMUTE = `timestamp,speed,acceleration,idle_seconds,distance_km
2026-09-10T08:00:00,0.0,0.0,5,0.00
2026-09-10T08:01:00,28.5,1.2,0,0.48
2026-09-10T08:02:00,42.0,0.8,0,1.18
2026-09-10T08:03:00,50.4,0.4,0,2.02
2026-09-10T08:04:00,55.0,0.2,0,2.94
2026-09-10T08:05:00,56.5,0.1,0,3.88
2026-09-10T08:06:00,58.0,0.1,0,4.85
2026-09-10T08:07:00,60.2,0.2,0,5.85
2026-09-10T08:08:00,59.0,-0.2,0,6.84
2026-09-10T08:09:00,62.0,0.4,0,7.87
2026-09-10T08:10:00,61.5,-0.1,0,8.90
2026-09-10T08:11:00,58.0,-0.5,0,9.87
2026-09-10T08:12:00,54.0,-0.6,0,10.77
2026-09-10T08:13:00,48.0,-0.8,0,11.57
2026-09-10T08:14:00,32.0,-1.1,0,12.10
2026-09-10T08:15:00,0.0,-1.4,12,12.10
2026-09-10T08:16:00,24.0,1.0,0,12.50
2026-09-10T08:17:00,45.0,0.9,0,13.25
2026-09-10T08:18:00,52.0,0.3,0,14.12
2026-09-10T08:19:00,38.0,-0.9,0,14.75
2026-09-10T08:20:00,15.0,-1.2,0,15.00
2026-09-10T08:21:00,0.0,-0.8,10,15.00`;

const SAMPLE_AGGRESSIVE = `timestamp,speed,acceleration,idle_seconds,distance_km
2026-09-10T14:00:00,0.0,0.0,4,0.00
2026-09-10T14:01:00,45.0,3.2,0,0.75
2026-09-10T14:02:00,80.0,3.1,0,2.08
2026-09-10T14:03:00,115.0,2.8,0,4.00
2026-09-10T14:04:00,126.0,1.2,0,6.10
2026-09-10T14:05:00,60.0,-3.5,0,7.10
2026-09-10T14:06:00,110.0,3.4,0,8.93
2026-09-10T14:07:00,124.0,1.5,0,11.00
2026-09-10T14:08:00,40.0,-3.8,0,11.67
2026-09-10T14:09:00,95.0,3.1,0,13.25
2026-09-10T14:10:00,30.0,-3.4,0,13.75
2026-09-10T14:11:00,0.0,-2.9,15,13.75`;

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onTripUploaded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [vehicleType, setVehicleType] = useState('Petrol');
  const [notes, setNotes] = useState('');
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset modal state on opening
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setPreviewContent(null);
      setNotes('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a valid .csv file.');
        setSelectedFile(null);
        setPreviewContent(null);
        return;
      }
      setSelectedFile(file);
      setNotes(`Imported: ${file.name}`);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setPreviewContent(text.split('\n').slice(0, 5).join('\n'));
      };
      reader.readAsText(file);
    } else {
      setSelectedFile(null);
      setPreviewContent(null);
    }
  };

  const loadSample = (type: 'commute' | 'aggressive') => {
    setError(null);
    const content = type === 'commute' ? SAMPLE_COMMUTE : SAMPLE_AGGRESSIVE;
    const blob = new Blob([content], { type: 'text/csv' });
    const filename = type === 'commute' ? 'sample_commute.csv' : 'sample_aggressive_trip.csv';
    const file = new File([blob], filename, { type: 'text/csv' });
    setSelectedFile(file);
    setNotes(type === 'commute' ? 'Sample: Smooth Suburban Commute' : 'Sample: Aggressive Driving Telemetry');
    setPreviewContent(content.split('\n').slice(0, 5).join('\n'));
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewContent(null);
    setNotes('');
    setError(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose or select a telemetry CSV file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('vehicle_type', vehicleType);
    if (notes) formData.append('notes', notes);

    try {
      setLoading(true);
      await uploadTripCsv(formData);
      onTripUploaded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload and parse telemetry CSV.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Upload Telemetry CSV</h3>
            <p className="text-xs text-slate-400">Parse time-series driving speed and acceleration data</p>
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

        <form onSubmit={handleUpload} className="mt-4 space-y-4 text-xs">
          {/* Quick preset buttons */}
          <div>
            <span className="block text-slate-400 font-medium mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-eco-400" />
              <span>Instant Test Datasets (Click to load sample)</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loadSample('commute')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left text-slate-200 transition-colors"
              >
                <p className="font-semibold text-eco-400">1. Smooth Commute</p>
                <p className="text-[10px] text-slate-400 mt-0.5">High score (low idle, 0 harsh events)</p>
              </button>
              <button
                type="button"
                onClick={() => loadSample('aggressive')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left text-slate-200 transition-colors"
              >
                <p className="font-semibold text-amber-400">2. Aggressive Run</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Harsh throttle, braking & drag</p>
              </button>
            </div>
          </div>

          {/* File Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-300 font-medium">Or Select CSV From Computer</label>
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="text-[11px] text-slate-400 hover:text-rose-400 underline"
                >
                  Clear file
                </button>
              )}
            </div>
            <div className="border-2 border-dashed border-slate-700 hover:border-eco-500/50 rounded-xl p-5 sm:p-6 text-center transition-colors bg-slate-850/40">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-file-input"
              />
              <label
                htmlFor="csv-file-input"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                <p className="font-semibold text-slate-200">
                  {selectedFile ? (
                    <span className="text-eco-400 font-mono text-xs">
                      Selected: {selectedFile.name}
                    </span>
                  ) : (
                    'Click to choose telemetry CSV'
                  )}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Expected columns: timestamp, speed, acceleration, idle_seconds, distance_km
                </p>
              </label>
            </div>
          </div>

          {previewContent && (
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">CSV Telemetry Preview:</p>
              <pre className="text-[11px] font-mono text-slate-400 whitespace-pre-wrap overflow-x-auto">
                {previewContent}
              </pre>
            </div>
          )}

          {/* Powertrain selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Vehicle Powertrain</label>
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

          <div>
            <label className="block text-slate-300 font-medium mb-1">Trip Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Morning Highway Commute"
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
              disabled={loading || !selectedFile}
              className="px-5 py-2 rounded-lg bg-eco-500 hover:bg-eco-400 text-slate-950 font-semibold flex items-center space-x-1.5 shadow-sm shadow-eco-500/20 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{loading ? 'Processing Telemetry...' : 'Upload & Compute Score'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
