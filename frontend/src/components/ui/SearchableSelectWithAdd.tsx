import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { ChevronDownIcon, PlusIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectWithAddProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  onAddOption: (newOption: string) => Promise<void> | void;
  placeholder?: string;
  searchPlaceholder?: string;
  addOptionText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  loading?: boolean;
}

const SearchableSelectWithAdd: React.FC<SearchableSelectWithAddProps> = ({
  value,
  onChange,
  options,
  onAddOption,
  placeholder = 'Pilih opsi',
  searchPlaceholder = 'Cari...',
  addOptionText = 'Tambah baru',
  error,
  disabled = false,
  className,
  allowClear = false,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newOptionValue, setNewOptionValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const newOptionInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if search term doesn't match any existing options
  const noMatchingOptions = searchTerm.trim() !== '' && filteredOptions.length === 0 && !loading;
  
  // Check if the search term exactly matches an existing option
  const exactMatchExists = options.some(option => 
    option.label.toLowerCase() === searchTerm.trim().toLowerCase() ||
    option.value.toLowerCase() === searchTerm.trim().toLowerCase()
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
        setIsAddingNew(false);
        setNewOptionValue('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current && !isAddingNew) {
      searchInputRef.current.focus();
    }
  }, [isOpen, isAddingNew]);

  // Focus new option input when adding new
  useEffect(() => {
    if (isAddingNew && newOptionInputRef.current) {
      newOptionInputRef.current.focus();
      setNewOptionValue(searchTerm);
    }
  }, [isAddingNew, searchTerm]);

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
      setIsAddingNew(false);
      setNewOptionValue('');
    }
  };

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
    setIsAddingNew(false);
    setNewOptionValue('');
  };

  const handleAddNewClick = () => {
    setIsAddingNew(true);
  };

  const handleAddNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newOptionValue.trim()) {
      try {
        // Tambahkan opsi baru ke daftar opsi lokal terlebih dahulu
        const newOptionTrimmed = newOptionValue.trim();
        const newOption = { value: newOptionTrimmed, label: newOptionTrimmed };
        
        // Panggil onAddOption untuk menambahkan ke state parent
        await onAddOption(newOptionTrimmed);
        
        // Perbarui nilai yang dipilih
        onChange(newOptionTrimmed);
      } catch (error) {
        console.error('Error adding new option:', error);
      } finally {
        // Reset state dan tutup dropdown
        setIsOpen(false);
        setSearchTerm('');
        setIsAddingNew(false);
        setNewOptionValue('');
      }
    }
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
          {!isAddingNew ? (
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
          ) : (
            <div className="p-3 border-b border-gray-100">
              <form onSubmit={handleAddNewSubmit}>
                <div className="relative">
                  <input
                    ref={newOptionInputRef}
                    type="text"
                    value={newOptionValue}
                    onChange={(e) => setNewOptionValue(e.target.value)}
                    placeholder="Masukkan nama kategori baru"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors duration-200"
                    disabled={!newOptionValue.trim()}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Proses
                      </span>
                    ) : (
                      'Tambah'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Options List */}
          {!isAddingNew && (
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                <>
                  {filteredOptions.map((option) => (
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
                  ))}
                </>
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  {noMatchingOptions && !exactMatchExists ? (
                    <button
                      type="button"
                      onClick={handleAddNewClick}
                      className="w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Menambahkan...</span>
                        </span>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4" />
                          <span>{addOptionText}: "{searchTerm}"</span>
                        </>
                      )}
                    </button>
                  ) : (
                    'Tidak ada opsi yang ditemukan'
                  )}
                </div>
              )}

              {/* Add New Option Button (when there are filtered options but user might want to add new) */}
              {filteredOptions.length > 0 && searchTerm.trim() !== '' && !exactMatchExists && (
                <div className="px-4 py-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleAddNewClick}
                    className="w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Menambahkan...</span>
                      </span>
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4" />
                        <span>{addOptionText}: "{searchTerm}"</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SearchableSelectWithAdd;