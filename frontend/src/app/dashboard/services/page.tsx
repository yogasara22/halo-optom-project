'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import DataTable, { Column } from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ServicePricingForm from '@/components/forms/ServicePricingForm';
import servicePricingService from '@/services/servicePricingService';
import { ServicePricing } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { TrashIcon, PencilSquareIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const ServiceManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [pricings, setPricings] = useState<ServicePricing[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<ServicePricing | null>(null);
  const [loading, setLoading] = useState(false);

  const columns: Column<ServicePricing>[] = [
    {
      key: 'type',
      title: 'Jenis Layanan',
      render: (value) => (value === 'online' ? 'Online' : 'Homecare'),
    },
    { key: 'method', title: 'Metode Konsultasi', render: (value) => (value === 'chat' ? 'Chat' : 'Video') },
    {
      key: 'base_price',
      title: 'Harga Dasar',
      render: (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`,
    },
    { key: 'is_active', title: 'Status', render: (value) => (value ? 'Aktif' : 'Tidak Aktif') },
    {
      key: 'actions',
      title: 'Aksi',
      render: (_v, row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setEditingPricing(row); setIsModalOpen(true); }}>
            <PencilSquareIcon className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={async () => {
              try {
                await servicePricingService.deletePricing(row.id);
                toast({ title: 'Berhasil', description: 'Harga layanan dihapus' });
                await refreshPricings();
              } catch (e: any) {
                toast({ title: 'Gagal', description: e?.message || 'Tidak dapat menghapus harga' });
              }
            }}
          >
            <TrashIcon className="w-4 h-4 mr-1" /> Hapus
          </Button>
        </div>
      ),
    },
  ];

  const refreshPricings = async () => {
    setLoading(true);
    try {
      const data = await servicePricingService.listPricing();
      setPricings(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast({ title: 'Gagal memuat', description: e?.message || 'Tidak dapat memuat data harga layanan' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPricings();
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#2563EB]/5 to-[#3DBD61]/10 -m-6 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Layanan & Harga</h1>
            <p className="text-gray-600">Kelola harga untuk jenis layanan dan metode konsultasi</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshPricings}>
              <ArrowPathIcon className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button onClick={() => { setEditingPricing(null); setIsModalOpen(true); }}>
              <PlusIcon className="w-4 h-4 mr-1" /> Tambah Harga Layanan
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Harga Layanan</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable data={pricings} columns={columns} isLoading={loading} />
          </CardContent>
        </Card>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPricing ? 'Edit Harga Layanan' : 'Tambah Harga Layanan'}>
          <ServicePricingForm
            pricing={editingPricing}
            onSave={refreshPricings}
            onClose={() => setIsModalOpen(false)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ServiceManagementPage;
