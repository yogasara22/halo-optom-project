'use client';

import React, { useEffect, useState } from 'react';
import Select from '@/components/ui/Select';
import CurrencyInput from '@/components/ui/CurrencyInput';
import Button from '@/components/ui/Button';
import { ServicePricing } from '@/types';
import servicePricingService, { CreateServicePricingPayload, UpdateServicePricingPayload } from '@/services/servicePricingService';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  pricing?: ServicePricing | null;
  onSave?: () => void;
  onClose?: () => void;
}

const ServicePricingForm: React.FC<Props> = ({ pricing, onSave, onClose }) => {
  const { toast } = useToast();
  const [type, setType] = useState<'online' | 'homecare'>(pricing?.type || 'online');
  const [method, setMethod] = useState<'chat' | 'video'>(pricing?.method || 'chat');
  const [basePrice, setBasePrice] = useState<number>(pricing?.base_price || 0);
  const [isActive, setIsActive] = useState<boolean>(pricing?.is_active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isHomecare = type === 'homecare';

  useEffect(() => {
    if (pricing) {
      setType(pricing.type);
      setMethod(pricing.method);
      setBasePrice(pricing.base_price);
      setIsActive(pricing.is_active);
    }
  }, [pricing]);

  const typeOptions = [
    { value: 'online', label: 'Online' },
    { value: 'homecare', label: 'Homecare' },
  ];

  const methodOptions = [
    { value: 'chat', label: 'Chat' },
    { value: 'video', label: 'Video' },
  ];

  const validate = (): string | null => {
    if (!type) return 'Jenis layanan wajib dipilih';
    if (isHomecare) return 'Homecare tidak memerlukan setup harga di platform';
    if (!method) return 'Metode konsultasi wajib dipilih';
    if (!basePrice || basePrice <= 0) return 'Harga dasar harus lebih dari 0';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast({ title: 'Validasi gagal', description: error });
      return;
    }
    setIsSubmitting(true);
    try {
      if (isHomecare) {
        toast({ title: 'Kebijakan Homecare', description: 'Homecare dibayar langsung di luar platform. Tidak perlu setup harga.' });
      } else if (pricing?.id) {
        const payload: UpdateServicePricingPayload = { base_price: basePrice, is_active: isActive };
        await servicePricingService.updatePricing(pricing.id, payload);
        toast({ title: 'Berhasil', description: 'Harga layanan diperbarui' });
      } else {
        const payload: CreateServicePricingPayload = { type, method, base_price: basePrice, is_active: isActive };
        await servicePricingService.createPricing(payload);
        toast({ title: 'Berhasil', description: 'Harga layanan ditambahkan' });
      }
      onSave && onSave();
      onClose && onClose();
    } catch (err: any) {
      toast({ title: 'Gagal menyimpan', description: err?.message || 'Terjadi kesalahan' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1">Jenis Layanan</label>
          <Select
            value={type}
            onChange={(v) => setType(v as 'online' | 'homecare')}
            options={typeOptions}
            placeholder="Pilih jenis layanan"
            disabled={Boolean(pricing)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1">Metode Konsultasi</label>
          <Select
            value={method}
            onChange={(v) => setMethod(v as 'chat' | 'video')}
            options={methodOptions}
            placeholder="Pilih metode"
            disabled={Boolean(pricing) || isHomecare}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1">Harga Dasar (Rp)</label>
        <CurrencyInput value={basePrice} onChange={(v) => { if (!isHomecare) setBasePrice(v); }} placeholder="0" disabled={isHomecare} />
        {isHomecare && (
          <p className="mt-2 text-sm text-gray-500">Homecare: pembayaran langsung ke optometris di luar platform, harga tidak diatur di sini.</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="is_active" className="text-sm text-gray-700">Aktif</label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
        <Button type="submit" isLoading={isSubmitting}>{pricing ? 'Simpan Perubahan' : 'Tambah Harga'}</Button>
      </div>
    </form>
  );
};

export default ServicePricingForm;
