import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string | null;
  icon?: LucideIcon;
  autoComplete?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  icon: Icon,
  autoComplete,
}) => {
  return (
    <div className="space-y-1.5 font-sans">
      <label htmlFor={id} className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
        {label} {required && <span className="text-[#EF4444]">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full bg-[#131E33] border text-xs text-white rounded-xl py-2.5 ${
            Icon ? 'pl-10' : 'pl-4'
          } pr-4 placeholder-slate-500 font-mono transition focus:outline-none ${
            error
              ? 'border-[#EF4444] focus:border-[#EF4444]'
              : 'border-[#1F2E4D] focus:border-[#00C2FF]'
          }`}
        />
      </div>

      {error && <p className="text-[11px] font-mono text-[#EF4444] mt-1">{error}</p>}
    </div>
  );
};
