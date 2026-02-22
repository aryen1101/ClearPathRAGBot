import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';

export const SourceCard = ({ source }) => {
  const score = (source.relevance_score * 100).toFixed(0);

  return (
    <div className="p-4 bg-white border border-slate-100 rounded-2xl mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-blue-200 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
            <FileText size={14} />
          </div>
          <span className="text-xs font-bold text-slate-700 truncate">{source.document}</span>
        </div>
        <ExternalLink size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold tracking-tighter">
          <span className="text-slate-400 uppercase">Context Match</span>
          <span className="text-blue-600">{score}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
};