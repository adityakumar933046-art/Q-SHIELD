import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AuthenticationErrorProps {
  message: string | null;
}

export const AuthenticationError: React.FC<AuthenticationErrorProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl text-xs text-[#EF4444] font-sans flex items-start space-x-2.5 shadow-sm">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
};
