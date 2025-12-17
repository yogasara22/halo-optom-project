'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB]/5 to-[#3DBD61]/5"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2563EB]/10 to-[#3DBD61]/10 rounded-full -translate-y-16 translate-x-16"></div>
      
      <div className="relative flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center">
          <button
            type="button"
            className="p-3 rounded-2xl text-gray-500 hover:text-gray-700 hover:bg-white/60 hover:shadow-md transition-all duration-300 lg:hidden group"
            onClick={onMenuClick}
          >
            <Bars3Icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
          </button>
          <div className="ml-6 lg:ml-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Dashboard Admin
            </h1>
            <p className="text-sm text-gray-500 font-medium">Kelola sistem Halo Optom</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              className="p-3 rounded-2xl text-gray-500 hover:text-gray-700 hover:bg-white/60 hover:shadow-md transition-all duration-300 group relative"
            >
              <BellIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              {/* Notification badge */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></div>
            </button>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#3DBD61] rounded-2xl flex items-center justify-center shadow-lg">
                  <UserCircleIcon className="w-6 h-6 text-white" />
                </div>
                {/* Online status */}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500 font-medium">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-red-50/80 hover:border-red-200 hover:text-red-600 transition-all duration-300 rounded-2xl px-6 py-2 font-medium shadow-md hover:shadow-lg"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;