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
    <div className="bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center my-4 font-sans shadow-sm">
      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 rounded-2xl text-[#6366F1] dark:text-indigo-400 mb-4 shadow-sm">
        <Database className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold rounded-xl text-xs transition shadow-md"
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
      <RefreshCw className="w-8 h-8 text-[#6366F1] dark:text-indigo-400 animate-spin mb-3" />
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{message}</span>
    </div>
  );
};
