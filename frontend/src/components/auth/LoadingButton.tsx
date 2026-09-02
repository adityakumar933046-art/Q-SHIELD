import React from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';

interface LoadingButtonProps {
  loading: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  disabled = false,
  onClick,
  children,
}) => {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-3 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-black text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Authenticating...</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
};
