'use client';

import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div className="h-5 bg-gray-200 rounded-md w-24"></div>
          <div className="h-8 bg-gray-200 rounded-md w-16"></div>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="h-10 bg-gray-200 rounded-md w-full mb-4"></div>
      {[...Array(5)].map((_, index) => (
        <div key={index} className="h-16 bg-gray-200 rounded-md w-full mb-2"></div>
      ))}
    </div>
  );
}

export default Skeleton;