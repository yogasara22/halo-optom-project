'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserGroupIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { User } from '../../types';

export interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'optometris' | 'pasien';
  phone?: string;
  date_of_birth?: string;
  gender?: 'laki-laki' | 'perempuan';
  address?: string;
  bio?: string;
  experience?: string;
  certifications?: string[];
  chat_commission_percentage?: number;
  video_commission_percentage?: number;
  avatarFile?: File | null;
  avatar_url?: string;
}

export interface CreateUserFormProps {
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
  initialData?: Partial<CreateUserFormData>;
  isEdit?: boolean;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onSubmit,
  isLoading = false,
  onCancel,
  initialData,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<CreateUserFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: '',
    confirmPassword: '',
    role: initialData?.role || 'pasien',
    phone: initialData?.phone || '',
    date_of_birth: initialData?.date_of_birth || '',
    gender: initialData?.gender || 'laki-laki',
    address: initialData?.address || '',
    bio: initialData?.bio || '',
    experience: initialData?.experience || '',
    certifications: initialData?.certifications || [],
    chat_commission_percentage: initialData?.chat_commission_percentage || 0,
    video_commission_percentage: initialData?.video_commission_percentage || 0,
    avatarFile: null,
    avatar_url: initialData?.avatar_url || '',
  });

  const [errors, setErrors] = useState<Partial<CreateUserFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUserFormData> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nama minimal 2 karakter';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Password validation (only required for new users)
    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = 'Password wajib diisi';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password minimal 6 karakter';
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Password tidak cocok';
      }
    } else {
      // For edit mode, only validate if password is provided
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password minimal 6 karakter';
      }
      if (formData.password && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Password tidak cocok';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Clean up empty fields before submitting
      const cleanedData = { ...formData };

      // Remove empty date_of_birth
      if (!cleanedData.date_of_birth || cleanedData.date_of_birth.trim() === '') {
        delete cleanedData.date_of_birth;
      }

      // Remove empty phone
      if (!cleanedData.phone || cleanedData.phone.trim() === '') {
        delete cleanedData.phone;
      }

      // Remove empty address
      if (!cleanedData.address || cleanedData.address.trim() === '') {
        delete cleanedData.address;
      }

      // Remove empty bio
      if (!cleanedData.bio || cleanedData.bio.trim() === '') {
        delete cleanedData.bio;
      }

      // Remove empty experience
      if (!cleanedData.experience || cleanedData.experience.trim() === '') {
        delete cleanedData.experience;
      }

      // Ensure commission values are numbers
      if (cleanedData.role === 'optometris') {
        cleanedData.chat_commission_percentage = Number(cleanedData.chat_commission_percentage);
        cleanedData.video_commission_percentage = Number(cleanedData.video_commission_percentage);
      } else {
        delete cleanedData.chat_commission_percentage;
        delete cleanedData.video_commission_percentage;
      }

      await onSubmit(cleanedData);
      // Reset form on success (only for create mode)
      if (!isEdit) {
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'pasien',
          phone: '',
          date_of_birth: '',
          gender: 'laki-laki',
          address: '',
          bio: '',
          experience: '',
          certifications: [],
          chat_commission_percentage: 0,
          video_commission_percentage: 0,
        });
        setErrors({});
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleInputChange = (field: keyof CreateUserFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
          {formData.avatarFile ? (
            // @ts-ignore
            <img src={URL.createObjectURL(formData.avatarFile)} alt="Avatar Preview" className="h-full w-full object-cover" />
          ) : formData.avatar_url ? (
            <img src={formData.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400">No Photo</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Foto Pengguna</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setFormData(prev => ({ ...prev, avatarFile: file }));
            }}
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">Format: JPG, PNG, WEBP. Maks 2MB</p>
        </div>
      </div>
      {/* Basic Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Masukkan nama lengkap"
              className={clsx(
                'pl-10',
                errors.name && 'border-red-500 focus:border-red-500 focus:ring-red-500'
              )}
              disabled={isLoading}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Masukkan alamat email"
              className={clsx(
                'pl-10',
                errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500'
              )}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Role and Personal Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Field */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Peran
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserGroupIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className={clsx(
                'w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl',
                'focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]',
                'bg-white text-gray-900 placeholder-gray-500',
                'transition-colors duration-200',
                'hover:border-gray-400',
                'appearance-none cursor-pointer',
                'disabled:bg-gray-50 disabled:text-gray-500'
              )}
              disabled={isLoading}
            >
              <option value="pasien">👤 Pasien</option>
              <option value="optometris">👨‍⚕️ Optometris</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Nomor Telepon (Opsional)
          </label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Masukkan nomor telepon"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Personal Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date of Birth Field */}
        <div>
          <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Lahir (Opsional)
          </label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth || ''}
            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Gender Field */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
            Jenis Kelamin (Opsional)
          </label>
          <div className="relative">
            <select
              id="gender"
              value={formData.gender || ''}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className={clsx(
                'w-full px-4 pr-10 py-3 border border-gray-300 rounded-xl',
                'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'bg-white text-gray-900',
                'transition-colors duration-200',
                'hover:border-gray-400',
                'appearance-none cursor-pointer',
                'disabled:bg-gray-50 disabled:text-gray-500'
              )}
              disabled={isLoading}
            >
              <option value="" disabled className="text-gray-500">🔽 Pilih jenis kelamin</option>
              <option value="laki-laki">👨 Laki-laki</option>
              <option value="perempuan">👩 Perempuan</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Address Field */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          Alamat (Opsional)
        </label>
        <textarea
          id="address"
          value={formData.address || ''}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Masukkan alamat lengkap"
          rows={3}
          className={clsx(
            'w-full px-4 py-3 border border-gray-300 rounded-xl',
            'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'bg-white text-gray-900 placeholder-gray-500',
            'transition-all duration-200',
            'disabled:bg-gray-50 disabled:text-gray-500',
            'resize-none'
          )}
          disabled={isLoading}
        />
      </div>

      {/* Conditional fields for Optometris */}
      {formData.role === 'optometris' && (
        <>
          {/* Bio Field */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio/Deskripsi (Opsional)
            </label>
            <textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Ceritakan tentang diri Anda sebagai optometris"
              rows={3}
              className={clsx(
                'w-full px-4 py-3 border border-gray-300 rounded-xl',
                'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'bg-white text-gray-900 placeholder-gray-500',
                'transition-all duration-200',
                'disabled:bg-gray-50 disabled:text-gray-500',
                'resize-none'
              )}
              disabled={isLoading}
            />
          </div>

          {/* Experience Field */}
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
              Pengalaman (Opsional)
            </label>
            <textarea
              id="experience"
              value={formData.experience || ''}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              placeholder="Deskripsikan pengalaman kerja Anda"
              rows={3}
              className={clsx(
                'w-full px-4 py-3 border border-gray-300 rounded-xl',
                'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'bg-white text-gray-900 placeholder-gray-500',
                'transition-all duration-200',
                'disabled:bg-gray-50 disabled:text-gray-500',
                'resize-none'
              )}
              disabled={isLoading}
            />
          </div>

          {/* Commission Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Chat Commission Field */}
            <div>
              <label htmlFor="chat_commission_percentage" className="block text-sm font-medium text-gray-700 mb-2">
                Komisi Chat (%)
              </label>
              <Input
                id="chat_commission_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.chat_commission_percentage || 0}
                onChange={(e) => handleInputChange('chat_commission_percentage', Number(e.target.value))}
                placeholder="0"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">Persentase komisi untuk layanan chat</p>
            </div>

            {/* Video Commission Field */}
            <div>
              <label htmlFor="video_commission_percentage" className="block text-sm font-medium text-gray-700 mb-2">
                Komisi Video Call (%)
              </label>
              <Input
                id="video_commission_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.video_commission_percentage || 0}
                onChange={(e) => handleInputChange('video_commission_percentage', Number(e.target.value))}
                placeholder="0"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">Persentase komisi untuk layanan video call</p>
            </div>
          </div>
        </>
      )}

      {/* Password Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password {isEdit ? '(Opsional - kosongkan jika tidak ingin mengubah)' : ''}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder={isEdit ? "Kosongkan jika tidak ingin mengubah password" : "Masukkan password"}
              className={clsx(
                'pl-10 pr-10',
                errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500'
              )}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Konfirmasi Password {isEdit ? '(Jika mengubah password)' : ''}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder={isEdit ? "Konfirmasi password baru" : "Konfirmasi password"}
              className={clsx(
                'pl-10 pr-10',
                errors.confirmPassword && 'border-red-500 focus:border-red-500 focus:ring-red-500'
              )}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Batal
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (isEdit ? 'Memperbarui...' : 'Membuat...') : (isEdit ? 'Perbarui Pengguna' : 'Buat Pengguna')}
        </Button>
      </div>
    </form>
  );
};

export default CreateUserForm;
