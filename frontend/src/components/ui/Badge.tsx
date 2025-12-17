'use client';

import React from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-blue-100 text-blue-800': variant === 'default',
          'bg-gray-100 text-gray-800': variant === 'secondary',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-red-100 text-red-800': variant === 'danger',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-indigo-100 text-indigo-800': variant === 'info',
          'border border-gray-200 bg-transparent': variant === 'outline',
        },
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;