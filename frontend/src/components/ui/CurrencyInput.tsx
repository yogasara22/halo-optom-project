'use client';

import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  required = false,
  min = 0,
  className = '',
  id,
  name,
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Format the number value to a formatted string when the component mounts or value changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatNumberToRupiah(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  // Convert a number to a formatted Rupiah string without the currency symbol
  const formatNumberToRupiah = (num: number): string => {
    return num.toLocaleString('id-ID').replace(/\s/g, '');
  };

  // Convert a formatted Rupiah string to a number
  const parseRupiahToNumber = (str: string): number => {
    // Remove all non-numeric characters except decimal point
    const numericString = str.replace(/[^\d]/g, '');
    return numericString ? parseInt(numericString, 10) : 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input
    if (!inputValue) {
      setDisplayValue('');
      onChange(0);
      return;
    }

    // Remove non-numeric characters for processing
    const numericValue = inputValue.replace(/[^\d]/g, '');
    const numberValue = parseInt(numericValue, 10);
    
    if (!isNaN(numberValue)) {
      // Format for display
      const formattedValue = formatNumberToRupiah(numberValue);
      setDisplayValue(formattedValue);
      
      // Pass the numeric value to parent
      onChange(numberValue);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <span className="text-gray-500">Rp</span>
      </div>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        min={min}
        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''} ${className}`}
        id={id}
        name={name}
        disabled={disabled}
      />
    </div>
  );
};

export default CurrencyInput;
