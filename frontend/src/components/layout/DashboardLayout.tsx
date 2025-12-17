'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useSearchParams } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const { isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Track page navigation for loading state
  useEffect(() => {
    setPageLoading(true);
    // Short timeout to prevent flash of loading state for fast navigations
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2563EB]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // This will be handled by middleware or redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#2563EB]/5 to-[#3DBD61]/10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#2563EB]/10 to-[#3DBD61]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#3DBD61]/10 to-[#2563EB]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#2563EB]/5 to-[#3DBD61]/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="flex h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto p-6 relative">
            {pageLoading && (
              <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-blue-600">Memuat halaman...</p>
                </div>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;