import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { ChevronDownIcon, ChevronUpDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi',
  searchPlaceholder = 'Cari...',
  error,
  disabled = false,
  className,
  allowClear = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option label
  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Select Button */}
      <button
        type="button"
        onClick={handleToggleDropdown}
        disabled={disabled}
        className={clsx(
          'w-full px-4 py-3 border rounded-2xl bg-white/80 backdrop-blur-sm transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent',
          'hover:bg-white/90 hover:border-gray-300 hover:shadow-md',
          'flex items-center justify-between text-left',
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-200/50 focus:ring-[#2563EB]',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
          className
        )}
      >
        <span className={clsx(
          'block truncate',
          !selectedOption && 'text-gray-500'
        )}>
          {displayValue}
        </span>
        <div className="flex items-center space-x-2">
          {allowClear && value && (
            <XMarkIcon
              className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              onClick={handleClear}
            />
          )}
          <ChevronDownIcon
            className={clsx(
              'h-4 w-4 text-gray-400 transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-60 overflow-hidden animate-fadeIn">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionSelect(option.value)}
                  className={clsx(
                    'w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150',
                    'focus:outline-none focus:bg-blue-50',
                    value === option.value && 'bg-blue-100 text-blue-600 font-medium'
                  )}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                Tidak ada opsi yang ditemukan
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SearchableSelect;