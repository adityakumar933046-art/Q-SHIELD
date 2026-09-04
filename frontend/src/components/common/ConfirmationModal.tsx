import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  loading = false,
}) => {
  if (!isOpen) return null;

  const buttonColors =
    confirmVariant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white'
      : confirmVariant === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 text-white'
      : 'bg-[#6366F1] hover:bg-[#4F46E5] text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800/40 rounded-xl text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-xs text-slate-400">Platform Admin Confirmation</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
          {message}
        </p>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 font-semibold text-xs rounded-xl shadow-sm transition flex items-center space-x-2 ${buttonColors} disabled:opacity-50`}
          >
            <span>{loading ? 'Processing...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
