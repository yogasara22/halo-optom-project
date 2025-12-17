'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { DayOfWeek } from '@/types';
import { CreateScheduleData } from '@/services/scheduleService';

export interface CreateScheduleFormData {
  optometrist_id?: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

interface CreateScheduleFormProps {
  onSubmit: (data: CreateScheduleFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CreateScheduleFormData>;
  optometrists?: Array<{ id: string; name: string; email: string }>;
}

const CreateScheduleForm: React.FC<CreateScheduleFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
  optometrists = []
}) => {
  const [formData, setFormData] = useState<CreateScheduleFormData>({
    optometrist_id: initialData?.optometrist_id || '',
    day_of_week: initialData?.day_of_week || 'monday',
    start_time: initialData?.start_time || '',
    end_time: initialData?.end_time || '',
    is_active: initialData?.is_active ?? true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateScheduleFormData, string>>>({});

  const dayOptions = [
    { value: 'monday', label: 'Senin' },
    { value: 'tuesday', label: 'Selasa' },
    { value: 'wednesday', label: 'Rabu' },
    { value: 'thursday', label: 'Kamis' },
    { value: 'friday', label: 'Jumat' },
    { value: 'saturday', label: 'Sabtu' },
    { value: 'sunday', label: 'Minggu' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateScheduleFormData, string>> = {};

    if (!formData.optometrist_id) {
      newErrors.optometrist_id = 'Optometris harus dipilih';
    }

    if (!formData.day_of_week) {
      newErrors.day_of_week = 'Hari harus dipilih';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Jam mulai harus diisi';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'Jam selesai harus diisi';
    }

    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = 'Jam selesai harus lebih besar dari jam mulai';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Mohon periksa kembali data yang diisi');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (field: keyof CreateScheduleFormData, value: string | boolean | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Optometrist */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Optometris <span className="text-red-500">*</span>
        </label>
        <SearchableSelect
          value={formData.optometrist_id || ''}
          onChange={(value: string) => handleInputChange('optometrist_id', value)}
          options={optometrists.map(opt => ({ value: opt.id, label: opt.name }))}
          placeholder="Pilih optometris"
          searchPlaceholder="Cari optometris..."
          error={errors.optometrist_id}
          allowClear
        />
      </div>

      {/* Day of Week */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hari <span className="text-red-500">*</span>
        </label>
        <Select
          value={formData.day_of_week}
          onChange={(value) => handleInputChange('day_of_week', value)}
          options={dayOptions}
          placeholder="Pilih hari"
          error={errors.day_of_week}
        />
      </div>

      {/* Time Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jam Mulai <span className="text-red-500">*</span>
          </label>
          <Input
            type="time"
            value={formData.start_time}
            onChange={(e) => handleInputChange('start_time', e.target.value)}
            error={errors.start_time}
            placeholder="09:00"
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jam Selesai <span className="text-red-500">*</span>
          </label>
          <Input
            type="time"
            value={formData.end_time}
            onChange={(e) => handleInputChange('end_time', e.target.value)}
            error={errors.end_time}
            placeholder="17:00"
          />
        </div>
      </div>



      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => handleInputChange('is_active', e.target.checked)}
          className="h-4 w-4 text-[#2563EB] focus:ring-[#2563EB] border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
          Jadwal aktif
        </label>
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
            'Simpan'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateScheduleForm;