import React from 'react';
import { RefreshCw } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading telemetry data...' }) => {
  return (
    <div className="p-12 flex flex-col items-center justify-center text-center font-sans">
      <RefreshCw className="w-8 h-8 text-[#00C2FF] animate-spin mb-3" />
      <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">{message}</span>
    </div>
  );
};
