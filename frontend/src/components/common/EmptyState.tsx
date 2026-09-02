import React from 'react';
import { Database, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'There are no active records matching your current filter criteria.',
  actionText,
  onAction,
}) => {
  return (
    <div className="bg-[#0B1220]/70 border border-[#1F2E4D] rounded-2xl p-12 text-center flex flex-col items-center justify-center my-4 font-sans">
      <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-2xl text-slate-400 mb-4">
        <Database className="w-8 h-8 text-[#00C2FF]" />
      </div>
      <h4 className="text-base font-bold text-white mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm font-mono mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold rounded-xl text-xs transition shadow-md"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading telemetry data...' }) => {
  return (
    <div className="p-12 flex flex-col items-center justify-center text-center font-sans">
      <RefreshCw className="w-8 h-8 text-[#00C2FF] animate-spin mb-3" />
      <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">{message}</span>
    </div>
  );
};
