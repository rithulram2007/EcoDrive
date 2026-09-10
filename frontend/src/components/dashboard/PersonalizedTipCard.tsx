import React from 'react';
import { Lightbulb, Trees } from 'lucide-react';

interface PersonalizedTipCardProps {
  tip: string;
  impactStatement: string;
}

export const PersonalizedTipCard: React.FC<PersonalizedTipCardProps> = ({
  tip,
  impactStatement,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Coaching Tip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex items-start space-x-3.5">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-slate-200 mb-1 uppercase tracking-wider">
            Personalized Driving Coaching
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">{tip}</p>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex items-start space-x-3.5">
        <div className="p-2 rounded-lg bg-eco-500/10 border border-eco-500/30 text-eco-400 shrink-0">
          <Trees className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-slate-200 mb-1 uppercase tracking-wider">
            Planetary Impact
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">{impactStatement}</p>
        </div>
      </div>
    </div>
  );
};
