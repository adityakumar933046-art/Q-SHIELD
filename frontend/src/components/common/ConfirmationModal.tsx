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
      ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white'
      : confirmVariant === 'warning'
      ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white'
      : 'bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-100 font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#131E33] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-[#EF4444]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400 font-sans">Platform Admin Confirmation</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-6 bg-[#131E33] p-3.5 rounded-xl border border-[#1F2E4D]">
          {message}
        </p>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-[#131E33] hover:bg-[#1F2E4D] text-slate-300 text-xs font-bold rounded-xl border border-[#1F2E4D] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2 ${buttonColors} disabled:opacity-50`}
          >
            <span>{loading ? 'Processing...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
