import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface WeeklyTrendChartProps {
  data: {
    date: string;
    full_date: string;
    score: number;
    has_trips: boolean;
    distance_km: number;
    co2_kg: number;
  }[];
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ data }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">7-Day Performance Trend</h3>
          <p className="text-xs text-slate-400">Daily Eco Score progression and consistency</p>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-eco-500 inline-block" />
            <span className="text-slate-300">Eco Score</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[40, 100]}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              ticks={[40, 60, 80, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#f8fafc',
              }}
              formatter={(val: any, name: any) => [
                `${val} ${name === 'score' ? 'pts' : 'km'}`,
                name === 'score' ? 'Eco Score' : 'Distance'
              ]}
              labelFormatter={(lbl, payload) => {
                const item = payload?.[0]?.payload;
                return item ? `${item.date} (${item.distance_km} km driven)` : lbl;
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#22c55e"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
