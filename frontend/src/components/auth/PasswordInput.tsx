import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string | null;
  autoComplete?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = '••••••••••••',
  required = false,
  error,
  autoComplete = 'current-password',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5 font-sans">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
        {label} {required && <span className="text-[#EF4444]">*</span>}
      </label>

      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <Lock className="w-4 h-4" />
        </div>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full bg-[#131E33] border text-sm text-white rounded-xl py-2.5 pl-10 pr-10 placeholder-slate-500 font-normal transition focus:outline-none ${
            error
              ? 'border-[#EF4444] focus:border-[#EF4444]'
              : 'border-[#1F2E4D] focus:border-[#00C2FF]'
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
          tabIndex={-1}
          title={showPassword ? 'Hide Password' : 'Show Password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error && <p className="text-xs font-normal text-[#EF4444] mt-1">{error}</p>}
    </div>
  );
};
