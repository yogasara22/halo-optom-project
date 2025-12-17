'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { DayOfWeek } from '@/types';
import { BulkCreateScheduleData } from '@/services/scheduleService';
import { PlusIcon, TrashIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export interface BulkCreateScheduleFormData {
  optometrist_id?: string;
  schedules: Array<{
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    description?: string;
    location?: string;
    max_patients?: number;
    is_active?: boolean;
  }>;
}

interface BulkCreateScheduleFormProps {
  onSubmit: (data: BulkCreateScheduleFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  optometrists?: Array<{ id: string; name: string; email: string }>;
}

const BulkCreateScheduleForm: React.FC<BulkCreateScheduleFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  optometrists = []
}) => {
  const [selectedOptometrist, setSelectedOptometrist] = useState<string>('');
  const [useTemplate, setUseTemplate] = useState<boolean>(true);
  const [templateData, setTemplateData] = useState({
    start_time: '09:00',
    end_time: '17:00',
    location: '',
    max_patients: 10,
    is_active: true
  });
  
  const [customSchedules, setCustomSchedules] = useState<Array<{
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    description?: string;
    location?: string;
    max_patients?: number;
    is_active?: boolean;
  }>>([{
    day_of_week: 'monday',
    start_time: '09:00',
    end_time: '17:00',
    max_patients: 10,
    is_active: true
  }]);

  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  const [errors, setErrors] = useState<any>({});

  const dayOptions = [
    { value: 'monday', label: 'Senin' },
    { value: 'tuesday', label: 'Selasa' },
    { value: 'wednesday', label: 'Rabu' },
    { value: 'thursday', label: 'Kamis' },
    { value: 'friday', label: 'Jumat' },
    { value: 'saturday', label: 'Sabtu' },
    { value: 'sunday', label: 'Minggu' }
  ];

  const optometristOptions = optometrists.map(opt => ({
    value: opt.id,
    label: `${opt.name} (${opt.email})`
  }));

  const validateForm = () => {
    const newErrors: any = {};

    if (!selectedOptometrist) {
      newErrors.optometrist_id = 'Optometris harus dipilih';
    }

    if (useTemplate) {
      if (!templateData.start_time) {
        newErrors.start_time = 'Jam mulai harus diisi';
      }
      if (!templateData.end_time) {
        newErrors.end_time = 'Jam selesai harus diisi';
      }
      if (templateData.start_time >= templateData.end_time) {
        newErrors.time = 'Jam mulai harus lebih awal dari jam selesai';
      }
      if (selectedDays.length === 0) {
        newErrors.days = 'Minimal pilih satu hari';
      }
    } else {
      if (customSchedules.length === 0) {
        newErrors.schedules = 'Minimal buat satu jadwal';
      }
      customSchedules.forEach((schedule, index) => {
        if (!schedule.start_time || !schedule.end_time) {
          newErrors[`schedule_${index}`] = 'Jam mulai dan selesai harus diisi';
        }
        if (schedule.start_time >= schedule.end_time) {
          newErrors[`schedule_${index}`] = 'Jam mulai harus lebih awal dari jam selesai';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Mohon periksa kembali form Anda');
      return;
    }

    try {
      let schedules;
      
      if (useTemplate) {
        schedules = selectedDays.map(day => ({
          day_of_week: day,
          start_time: templateData.start_time,
          end_time: templateData.end_time,
          location: templateData.location,
          max_patients: templateData.max_patients,
          is_active: templateData.is_active
        }));
      } else {
        schedules = customSchedules;
      }

      await onSubmit({
        optometrist_id: selectedOptometrist,
        schedules
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const addCustomSchedule = () => {
    setCustomSchedules(prev => [...prev, {
      day_of_week: 'monday',
      start_time: '09:00',
      end_time: '17:00',
      max_patients: 10,
      is_active: true
    }]);
  };

  const removeCustomSchedule = (index: number) => {
    setCustomSchedules(prev => prev.filter((_, i) => i !== index));
  };

  const updateCustomSchedule = (index: number, field: string, value: any) => {
    setCustomSchedules(prev => prev.map((schedule, i) => 
      i === index ? { ...schedule, [field]: value } : schedule
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Optometrist Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pilih Optometris <span className="text-red-500">*</span>
        </label>
        <SearchableSelect
          options={optometristOptions}
          value={selectedOptometrist}
          onChange={setSelectedOptometrist}
          placeholder="Cari dan pilih optometris"
          searchPlaceholder="Ketik nama optometris..."
          allowClear
          error={errors.optometrist_id}
        />
      </div>

      {/* Template Toggle */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-4 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={useTemplate}
              onChange={() => setUseTemplate(true)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Template Jadwal Mingguan</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={!useTemplate}
              onChange={() => setUseTemplate(false)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Jadwal Kustom</span>
          </label>
        </div>

        {useTemplate ? (
          <div className="space-y-4">
            {/* Template Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Mulai <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={templateData.start_time}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, start_time: e.target.value }))}
                  error={errors.start_time}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Selesai <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={templateData.end_time}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, end_time: e.target.value }))}
                  error={errors.end_time}
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={templateData.is_active}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Jadwal aktif</span>
                </label>
              </div>
            </div>

            {/* Day Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Hari <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {dayOptions.map(day => (
                  <label key={day.value} className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day.value as DayOfWeek)}
                      onChange={() => toggleDay(day.value as DayOfWeek)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{day.label}</span>
                  </label>
                ))}
              </div>
              {errors.days && <p className="text-red-500 text-sm mt-1">{errors.days}</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Custom Schedules */}
            {customSchedules.map((schedule, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Jadwal {index + 1}
                  </h4>
                  {customSchedules.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCustomSchedule(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hari
                    </label>
                    <select
                      value={schedule.day_of_week}
                      onChange={(e) => updateCustomSchedule(index, 'day_of_week', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {dayOptions.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jam Mulai
                    </label>
                    <Input
                      type="time"
                      value={schedule.start_time}
                      onChange={(e) => updateCustomSchedule(index, 'start_time', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jam Selesai
                    </label>
                    <Input
                      type="time"
                      value={schedule.end_time}
                      onChange={(e) => updateCustomSchedule(index, 'end_time', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={schedule.is_active}
                        onChange={(e) => updateCustomSchedule(index, 'is_active', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Jadwal aktif</span>
                    </label>
                  </div>
                </div>
                
                {errors[`schedule_${index}`] && (
                  <p className="text-red-500 text-sm mt-2">{errors[`schedule_${index}`]}</p>
                )}
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addCustomSchedule}
              className="w-full flex items-center justify-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Tambah Jadwal
            </Button>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="transition-all duration-300 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="transition-all duration-300 hover:bg-blue-600 hover:shadow-lg"
        >
          {isLoading ? (
            <>
              <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Buat Jadwal Bulk'
          )}
        </Button>
      </div>
    </form>
  );
};

export default BulkCreateScheduleForm;