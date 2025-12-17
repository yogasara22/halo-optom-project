'use client';

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Tambahkan styling kustom untuk memperbaiki tampilan date picker
import './date-range-picker.css';
import { useMediaQuery } from 'react-responsive';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  className?: string;
  placeholder?: string;
  onUpdate?: (range: DateRange) => void;
}

export function DateRangePicker({ className, placeholder = 'Pilih rentang tanggal', onUpdate }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Deteksi ukuran layar untuk responsif
  const isMobile = useMediaQuery({ maxWidth: 640 });

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    
    const newRange: DateRange = {};
    if (start) newRange.from = start;
    if (end) newRange.to = end;
    
    setDateRange(newRange);
    
    if (start && end && onUpdate) {
      onUpdate({ from: start, to: end });
    }
  };

  const displayValue = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'dd MMM yyyy', { locale: id })} - ${format(endDate, 'dd MMM yyyy', { locale: id })}`;
    }
    return placeholder;
  };

  return (
    <div className={clsx('relative', className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center justify-between w-full px-4 py-2 text-sm',
          'border border-gray-300 rounded-md shadow-sm',
          'bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'transition-all duration-200 ease-in-out'
        )}
      >
        <span className={clsx(!startDate && !endDate && 'text-gray-500')}>
          {displayValue()}
        </span>
        <CalendarIcon className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 date-range-container bg-white shadow-xl rounded-lg border border-gray-200 p-3">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Pilih Rentang Tanggal</h3>
              {startDate && endDate && (
                <button 
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                    setDateRange({});
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-all duration-200 ease-in-out"
                >
                  Reset
                </button>
              )}
            </div>
            
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              inline
              locale={id}
              monthsShown={isMobile ? 1 : 2}
              showWeekNumbers
              className="custom-datepicker"
              calendarClassName="custom-calendar"
              dayClassName={date => {
                // Hari ini
                if (
                  date.getDate() === new Date().getDate() && 
                  date.getMonth() === new Date().getMonth() && 
                  date.getFullYear() === new Date().getFullYear()
                ) {
                  return "current-day";
                }
                
                // Hari yang dipilih
                if (
                  startDate && 
                  date.getTime() === startDate.getTime()
                ) {
                  return "selected-day-start";
                }
                
                if (
                  endDate && 
                  date.getTime() === endDate.getTime()
                ) {
                  return "selected-day-end";
                }
                
                return "";
              }}
            />
            
            {startDate && endDate && (
              <div className="mt-3 flex justify-end">
                <button 
                  onClick={() => {
                    if (onUpdate) onUpdate({ from: startDate, to: endDate });
                    setIsOpen(false);
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-all duration-200 ease-in-out"
                >
                  Terapkan
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;