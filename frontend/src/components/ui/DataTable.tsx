'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  onSort?: (key: string) => void;
  emptyMessage?: string;
  className?: string;
  groupBy?: {
    key: keyof T | string;
    render?: (value: any) => React.ReactNode;
  };
  onRowClick?: (row: T) => void;
}

function DataTable<T extends Record<string, any>>({
  data = [],
  columns,
  isLoading = false,
  pagination,
  sortConfig,
  onSort,
  emptyMessage = 'Tidak ada data ditemukan',
  className,
  groupBy,
  onRowClick,
}: DataTableProps<T>) {
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];
  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };
  
  // Helper function to get value from an object by key
  const getValue = (row: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], row);
    }
    return row[key as keyof T];
  };
  
  // Group data if groupBy is provided
  const groupedData = groupBy
    ? safeData.reduce((groups, item) => {
        const groupValue = getValue(item, groupBy.key);
        const groupKey = String(groupValue?.id || groupValue);
        if (!groups[groupKey]) {
          groups[groupKey] = {
            value: groupValue,
            items: [],
          };
        }
        groups[groupKey].items.push(item);
        return groups;
      }, {} as Record<string, { value: any; items: T[] }>)
    : null;

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 text-blue-600" />
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-500 font-medium">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-500">Loading...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={clsx("whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-700", column.className)}
                    onClick={() => column.sortable !== false && handleSort(String(column.key))}
                    style={{ cursor: column.sortable !== false ? 'pointer' : 'default' }}
                  >
                    <div className="flex items-center">
                      <span>{column.title}</span>
                      {column.sortable !== false && getSortIcon(String(column.key))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {safeData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    {emptyMessage || 'No data available'}
                  </td>
                </tr>
              ) : groupBy ? (
                groupedData && Object.entries(groupedData).map(([key, group]) => (
                  <React.Fragment key={key}>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <td
                        colSpan={columns.length}
                        className="px-6 py-4 text-sm font-medium text-gray-900"
                      >
                        {groupBy.render ? groupBy.render(group.value) : key}
                      </td>
                    </tr>
                    {group.items.map((item, index) => (
                      <tr 
                        key={index} 
                        className={onRowClick ? "cursor-pointer" : ""}
                        onClick={() => onRowClick && onRowClick(item)}
                      >
                        {columns.map((column) => (
                          <td key={String(column.key)} className={clsx("whitespace-nowrap px-6 py-4 text-sm", column.className)}>
                            {column.render
                              ? column.render(getValue(item, column.key), item)
                              : getValue(item, column.key)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                safeData.map((item, index) => (
                  <tr 
                    key={index} 
                    className={onRowClick ? "cursor-pointer" : ""}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {columns.map((column) => (
                      <td key={String(column.key)} className={clsx("whitespace-nowrap px-6 py-4 text-sm", column.className)}>
                        {column.render
                          ? column.render(getValue(item, column.key), item)
                          : getValue(item, column.key)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                <span className="font-medium">{pagination.totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Button
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="rounded-l-md transition-all duration-200 hover:bg-blue-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </Button>

                {/* Page numbers */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current page
                  const showPage =
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - pagination.currentPage) <= 1;

                  if (!showPage && (page === 2 || page === pagination.totalPages - 1)) {
                    return (
                      <span
                        key={page}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <Button
                      key={page}
                      onClick={() => pagination.onPageChange(page)}
                      variant={pagination.currentPage === page ? "primary" : "outline"}
                      size="sm"
                      className={`transition-all duration-200 ${pagination.currentPage === page ? 'z-10' : 'hover:bg-blue-50'}`}
                    >
                      {page}
                    </Button>
                  );
                })}

                <Button
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  variant="outline"
                  size="sm"
                  className="rounded-r-md transition-all duration-200 hover:bg-blue-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;