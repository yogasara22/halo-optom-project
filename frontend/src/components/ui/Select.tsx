import React from 'react';
import { clsx } from 'clsx';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi',
  error,
  disabled = false,
  className
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={clsx(
          'w-full px-4 py-3 border rounded-2xl bg-white/80 backdrop-blur-sm transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent',
          'hover:bg-white/90 hover:border-gray-300',
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-200/50 focus:ring-[#2563EB]',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
          className
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;