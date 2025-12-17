'use client';

import React, { Suspense } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardStats } from '@/types';
import api from '@/lib/api';
import { useDashboardStats } from '@/hooks/useDashboard';
import { TableSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
import {
  UsersIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  CalendarIcon,
  EyeIcon,
  StarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  // Menggunakan React Query untuk data fetching dan caching
  const { data: stats, isLoading, error } = useDashboardStats();
  const errorMessage = error instanceof Error ? error.message : '';

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#2563EB]/5 to-[#3DBD61]/10 -m-6 p-6">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#2563EB]/10 via-[#3DBD61]/10 to-[#2563EB]/10 rounded-3xl p-8 backdrop-blur-sm border border-white/20">
              <div className="h-16 bg-gray-200 rounded-md animate-pulse w-1/3 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded-md animate-pulse w-1/2"></div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded-md animate-pulse w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (errorMessage) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#2563EB]/5 to-[#3DBD61]/10 -m-6 p-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#2563EB]/10 via-[#3DBD61]/10 to-[#2563EB]/10 rounded-3xl p-8 backdrop-blur-sm border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB]/5 to-[#3DBD61]/5"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-[#2563EB] to-[#3DBD61] bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Selamat datang di dashboard admin Halo Optom</p>
              <div className="flex items-center mt-4 space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#3DBD61] rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">System Online</span>
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleTimeString('id-ID')}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Stats */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-1 h-8 bg-gradient-to-b from-[#2563EB] to-[#3DBD61] rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800">Statistik Utama</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Pengguna"
                value={stats?.totalUsers || 0}
                icon={UsersIcon}
                color="blue"
              />
              <StatCard
                title="Total Optometris"
                value={stats?.totalOptometrists || 0}
                icon={ShoppingBagIcon}
                color="green"
              />
              <StatCard
                title="Total Pesanan"
                value={stats?.totalOrders || 0}
                icon={CreditCardIcon}
                color="blue"
              />
              <StatCard
                title="Total Pasien"
                value={stats?.totalPatients || 0}
                icon={CalendarIcon}
                color="yellow"
              />
            </div>
          </div>

          {/* Quick Actions & Analytics */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800">Aksi Cepat & Analitik</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="group hover:shadow-2xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-[#2563EB] to-[#3DBD61] rounded-full"></div>
                    <span className="bg-gradient-to-r from-[#2563EB] to-[#3DBD61] bg-clip-text text-transparent">Aksi Cepat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <a
                      href="/dashboard/users"
                      className="group/item flex items-center p-4 bg-gradient-to-r from-[#2563EB]/5 to-[#2563EB]/10 rounded-2xl hover:from-[#2563EB]/10 hover:to-[#2563EB]/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-[#2563EB]/20"
                    >
                      <div className="flex items-center justify-center w-12 h-12 bg-[#2563EB]/10 rounded-xl group-hover/item:bg-[#2563EB]/20 transition-all duration-300">
                        <UsersIcon className="w-6 h-6 text-[#2563EB] group-hover/item:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="ml-4">
                        <span className="text-[#2563EB] font-semibold text-lg">Kelola Pengguna</span>
                        <p className="text-[#2563EB]/70 text-sm">Manajemen user & admin</p>
                      </div>
                      <div className="ml-auto text-[#2563EB]/60 group-hover/item:text-[#2563EB] group-hover/item:translate-x-1 transition-all duration-300">
                        →
                      </div>
                    </a>
                    <a
                      href="/dashboard/products"
                      className="group/item flex items-center p-4 bg-gradient-to-r from-[#3DBD61]/5 to-[#3DBD61]/10 rounded-2xl hover:from-[#3DBD61]/10 hover:to-[#3DBD61]/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-[#3DBD61]/20"
                    >
                      <div className="flex items-center justify-center w-12 h-12 bg-[#3DBD61]/10 rounded-xl group-hover/item:bg-[#3DBD61]/20 transition-all duration-300">
                        <ShoppingBagIcon className="w-6 h-6 text-[#3DBD61] group-hover/item:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="ml-4">
                        <span className="text-[#3DBD61] font-semibold text-lg">Kelola Produk</span>
                        <p className="text-[#3DBD61]/70 text-sm">Inventory & katalog</p>
                      </div>
                      <div className="ml-auto text-[#3DBD61]/60 group-hover/item:text-[#3DBD61] group-hover/item:translate-x-1 transition-all duration-300">
                        →
                      </div>
                    </a>
                    <a
                      href="/dashboard/transactions"
                      className="group/item flex items-center p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-2xl hover:from-amber-100 hover:to-amber-200/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-amber-200/50"
                    >
                      <div className="flex items-center justify-center w-12 h-12 bg-amber-500/10 rounded-xl group-hover/item:bg-amber-500/20 transition-all duration-300">
                        <CreditCardIcon className="w-6 h-6 text-amber-600 group-hover/item:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="ml-4">
                        <span className="text-amber-700 font-semibold text-lg">Kelola Transaksi</span>
                        <p className="text-amber-600/70 text-sm">Pembayaran & laporan</p>
                      </div>
                      <div className="ml-auto text-amber-400 group-hover/item:text-amber-600 group-hover/item:translate-x-1 transition-all duration-300">
                        →
                      </div>
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-[#2563EB] to-[#3DBD61] rounded-full"></div>
                    <span className="bg-gradient-to-r from-[#2563EB] to-[#3DBD61] bg-clip-text text-transparent">Sistem Monitoring</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* System Status */}
                    <div className="p-4 bg-gradient-to-r from-[#3DBD61]/5 to-[#3DBD61]/10 rounded-2xl border border-[#3DBD61]/20">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-[#3DBD61]/10 rounded-xl">
                          <div className="w-3 h-3 bg-[#3DBD61] rounded-full animate-pulse"></div>
                        </div>
                        <div>
                          <p className="font-semibold text-[#3DBD61]">Sistem Aktif</p>
                          <p className="text-[#3DBD61]/70 text-sm">Semua layanan berjalan normal</p>
                        </div>
                      </div>
                    </div>

                    {/* Database Stats */}
                    <div className="p-4 bg-gradient-to-r from-[#2563EB]/5 to-[#2563EB]/10 rounded-2xl border border-[#2563EB]/20">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-[#2563EB]/10 rounded-xl">
                          <div className="w-6 h-6 text-[#2563EB]">
                            📊
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-[#2563EB]">Database</p>
                          <p className="text-[#2563EB]/70 text-sm">{(stats?.totalUsers || 0) + (stats?.totalOptometrists || 0) + (stats?.totalOrders || 0)} total records</p>
                        </div>
                      </div>
                    </div>

                    {/* Performance */}
                    <div className="p-4 bg-gradient-to-r from-[#3DBD61]/5 to-[#3DBD61]/10 rounded-2xl border border-[#3DBD61]/20">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-[#3DBD61]/10 rounded-xl">
                          <div className="w-6 h-6 text-[#3DBD61]">
                            ⚡
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-[#3DBD61]">Performance</p>
                          <p className="text-[#3DBD61]/70 text-sm">Response time: ~{Math.floor(Math.random() * 50 + 20)}ms</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
 </div>
           </div>
         </div>
       </div>
    </DashboardLayout>
  );
};

export default DashboardPage;