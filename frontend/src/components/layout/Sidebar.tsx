'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  StarIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Manajemen Pengguna', href: '/dashboard/users', icon: UsersIcon },
  { name: 'Manajemen Jadwal', href: '/dashboard/schedules', icon: CalendarIcon },
  { name: 'Rekam Medis', href: '/dashboard/medical-records', icon: DocumentTextIcon },
  { name: 'Manajemen Produk', href: '/dashboard/products', icon: ShoppingBagIcon },
  { name: 'Manajemen Transaksi', href: '/dashboard/transactions', icon: CreditCardIcon },
  { name: 'Manajemen Layanan', href: '/dashboard/services', icon: BanknotesIcon },
  { name: 'Review & Feedback', href: '/dashboard/reviews', icon: StarIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Reports & Export', href: '/dashboard/reports', icon: DocumentArrowDownIcon },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'w-64 bg-white/80 backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-in-out lg:translate-x-0 lg:block',
          'lg:relative lg:flex lg:flex-col',
          'border-r border-white/20',
          isOpen ? 'fixed inset-y-0 left-0 z-30 translate-x-0' : 'fixed inset-y-0 left-0 z-30 -translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 px-4 bg-gradient-to-r from-[#2563EB] via-[#3DBD61] to-[#2563EB] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB]/90 to-[#3DBD61]/90 backdrop-blur-sm"></div>
            <div className="relative z-10 text-center">
              <h1 className="text-xl font-bold text-white mb-1">Halo Optom</h1>
              <p className="text-white/80 text-xs font-medium tracking-wider">ADMIN PANEL</p>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/10 rounded-full"></div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 relative overflow-hidden',
                    isActive
                      ? 'bg-gradient-to-r from-[#2563EB]/10 to-[#3DBD61]/10 text-[#2563EB] shadow-lg border border-[#2563EB]/20'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-200/50 hover:text-gray-900 hover:shadow-md hover:scale-[1.02]'
                  )}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2563EB] to-[#3DBD61] rounded-r-full"></div>
                  )}
                  
                  {/* Icon container */}
                  <div className={clsx(
                    'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 mr-3',
                    isActive 
                      ? 'bg-[#2563EB]/10 group-hover:bg-[#2563EB]/20' 
                      : 'bg-gray-100/50 group-hover:bg-gray-200/80 group-hover:scale-110'
                  )}>
                    <item.icon className={clsx(
                      'w-5 h-5 transition-all duration-300',
                      isActive ? 'text-[#2563EB]' : 'text-gray-500 group-hover:text-gray-700'
                    )} />
                  </div>
                  
                  {/* Text */}
                  <span className="flex-1 font-medium">{item.name}</span>
                  
                  {/* Arrow indicator for active */}
                  {isActive && (
                    <div className="text-[#2563EB] opacity-70">
                      →
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
