'use client';

import React, { useEffect, useState, useMemo, Suspense, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './product-description.css';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Product } from '@/types';
import productService from '@/services/productService';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { productReducer, initialProductState } from '@/reducers/productReducer';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  CubeIcon,
  TagIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

const ProductsPage: React.FC = () => {
  const router = useRouter();
  const [state, dispatch] = useReducer(productReducer, initialProductState);
  const { searchTerm, selectedCategory, currentPage, limit, isSubmitting, productStats } = state;
  
  // Menggunakan React Query untuk data fetching dan caching
  const { 
    data: productsData, 
    isLoading, 
    error: queryError,
    refetch 
  } = useProducts({
    page: currentPage,
    limit: 10,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    search: searchTerm,
    sortBy: 'name',
    sortOrder: 'ASC'
  });
  
  const products = productsData?.data || [];
  const totalPages = productsData?.totalPages || 1;
  const totalItems = productsData?.total || 0;
  const error = queryError instanceof Error ? queryError.message : '';

  const categories = ['Kacamata', 'Lensa Kontak', 'Cairan Pembersih', 'Frame', 'Aksesoris', 'Lainnya'];

  // Refetch data saat komponen dimount atau saat navigasi kembali dari halaman edit
  useEffect(() => {
    // Refetch data untuk memastikan data terbaru ditampilkan
    refetch();
  }, [refetch]);
  
  // Calculate product statistics
  useEffect(() => {
    if (products.length > 0) {
      dispatch({ type: 'UPDATE_PRODUCT_STATS', payload: products });
    }
  }, [products, dispatch]);

  // Fungsi fetchProducts telah diintegrasikan langsung ke dalam useEffect

  const handleSearch = () => {
    dispatch({ type: 'SET_PAGE', payload: 1 });
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_CATEGORY', payload: e.target.value });
    dispatch({ type: 'SET_PAGE', payload: 1 }); // Reset ke halaman pertama saat mengubah kategori
  };

  const handleEdit = (productId: string) => {
    router.push(`/dashboard/products/edit/${productId}`);
  };

  // Menggunakan React Query mutation untuk delete
  const deleteProductMutation = useDeleteProduct();
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        dispatch({ type: 'SET_SUBMITTING', payload: true });
        await deleteProductMutation.mutateAsync(id);
        // Tidak perlu refresh manual karena React Query akan invalidate cache
      } catch (error: any) {
        toast.error(error.message || 'Gagal menghapus produk');
      } finally {
        dispatch({ type: 'SET_SUBMITTING', payload: false });
      }
    }
  };

  const handleAddProduct = () => {
    router.push('/dashboard/products/create');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
            <p className="text-gray-600">Kelola produk kacamata dan aksesoris</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                dispatch({ type: 'SET_PAGE', payload: 1 }); // Reset ke halaman pertama untuk refresh data
                refetch(); // Menggunakan refetch dari React Query untuk memperbarui data
              }}
              disabled={isLoading}
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleAddProduct}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500/10 text-blue-600">
                  <CubeIcon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Total Produk</p>
                  <h3 className="text-2xl font-bold text-blue-900">{totalItems}</h3>
                  <p className="text-xs text-blue-700 mt-1">
                    {productStats.totalActive} aktif, {productStats.totalInactive} tidak aktif
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500/10 text-green-600">
                  <TagIcon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Kategori</p>
                  <h3 className="text-2xl font-bold text-green-900">{Object.keys(productStats.categoryCounts).length}</h3>
                  <p className="text-xs text-green-700 mt-1">
                    {selectedCategory !== 'all' ? `${productStats.categoryCounts[selectedCategory] || 0} produk dalam kategori ini` : 'Semua kategori ditampilkan'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-600">
                  <ShoppingCartIcon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-600">Status Stok</p>
                  <h3 className="text-2xl font-bold text-yellow-900">{productStats.lowStock}</h3>
                  <p className="text-xs text-yellow-700 mt-1">
                    Stok menipis, {productStats.outOfStock} produk habis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-500/10 text-purple-600">
                  <CurrencyDollarIcon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Diskon</p>
                  <h3 className="text-2xl font-bold text-purple-900">
                    {products.filter(p => p.discount_price && p.discount_price > 0).length}
                  </h3>
                  <p className="text-xs text-purple-700 mt-1">
                    Produk dengan harga diskon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card hover={false}>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  icon={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                />
              </div>
              <div className="w-full md:w-48">
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={handleSearch}>
                <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                Cari
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card hover={false}>
          <CardHeader>
            <CardTitle>Daftar Produk</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Harga
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stok
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 relative rounded-md overflow-hidden bg-gray-100">
                              {product.image_url ? (
                                <Image 
                                  src={product.image_url} 
                                  alt={product.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full w-full bg-gray-200 text-gray-500 text-xs">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-2 product-description-content" dangerouslySetInnerHTML={{ __html: product.description || 'Tidak ada deskripsi' }}>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.discount_price ? (
                            <div>
                              <span className="line-through text-gray-500">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0
                                }).format(product.price)}
                              </span>
                              <span className="ml-2 text-red-600 font-medium">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0
                                }).format(product.discount_price)}
                              </span>
                            </div>
                          ) : (
                            new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }).format(product.price)
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={clsx(
                            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                            product.stock > 10
                              ? 'bg-green-100 text-green-800'
                              : product.stock > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          )}>
                            {product.stock} unit
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={clsx(
                            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                            product.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          )}>
                            {product.is_active ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/products/detail/${product.id}`)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-200"
                            title="Lihat detail produk"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(product.id)}
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors duration-200"
                            title="Edit produk"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(product.id)}
                            disabled={isSubmitting}
                            className="hover:bg-red-600 transition-colors duration-200"
                            title="Hapus produk"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {products.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Tidak ada produk ditemukan
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan {products.length} dari {totalItems} produk | Halaman {currentPage} dari {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.max(currentPage - 1, 1) })}
              disabled={currentPage === 1 || isLoading}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.min(currentPage + 1, totalPages) })}
              disabled={currentPage === totalPages || totalPages === 0 || isLoading}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;