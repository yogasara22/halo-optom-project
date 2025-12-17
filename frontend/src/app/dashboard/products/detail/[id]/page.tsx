'use client';

import React, { useState, useEffect } from 'react';
import '../../product-description.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FiEdit, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ImageGallery from '@/components/ui/ImageGallery';
import productService from '@/services/productService';
import { Product } from '@/types';

interface DetailProductPageProps {
  params: {
    id: string;
  };
}

const DetailProductPage = ({ params }: DetailProductPageProps) => {
  // Mengakses params.id langsung sesuai dengan pesan error
  // Next.js masih mendukung akses langsung untuk memfasilitasi migrasi
  const id = params.id;
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    // Delay fetch slightly to prevent unnecessary fetches during rapid navigation
    const timer = setTimeout(() => {
      productService.getProductById(id)
        .then(data => {
          if (isMounted) {
            setProduct(data);
          }
        })
        .catch(error => {
          if (isMounted) {
            toast.error(error.message || 'Gagal memuat data produk');
            router.push('/dashboard/products');
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    }, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [id, router]);

  const handleEdit = () => {
    router.push(`/dashboard/products/edit/${id}`);
  };

  const handleDelete = () => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      return;
    }

    setDeleting(true);
    productService.deleteProduct(id)
      .then(() => {
        toast.success('Produk berhasil dihapus');
        router.push('/dashboard/products');
        router.refresh();
      })
      .catch(error => {
        toast.error(error.message || 'Gagal menghapus produk');
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Detail Produk</h1>
            <button
              onClick={() => router.back()}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <FiArrowLeft className="mr-2" /> Kembali
            </button>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500">Produk tidak ditemukan</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Format price to IDR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const formattedPrice = formatPrice(product.price);
  const formattedDiscountPrice = product.discount_price ? formatPrice(product.discount_price) : null;

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Detail Produk</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => router.back()}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <FiArrowLeft className="mr-2" /> Kembali
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiEdit className="mr-2" /> Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiTrash2 className="mr-2" /> {deleting ? 'Menghapus...' : 'Hapus'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Product Image */}
          {product.image_url ? (
            <ImageGallery 
              mainImage={product.image_url} 
              additionalImages={product.additional_images || []} 
              alt={product.name} 
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
              <div className="w-full h-80 flex items-center justify-center bg-gray-200 rounded-md">
                <p className="text-gray-500">Tidak ada gambar</p>
              </div>
            </div>
          )}

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">{product.name}</h2>
              <div className="flex items-center space-x-3 mb-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {product.is_active ? 'Aktif' : 'Tidak Aktif'}
                </span>
                {product.category && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {product.category}
                  </span>
                )}
              </div>
              <div className="text-gray-600 product-description-content" dangerouslySetInnerHTML={{ __html: product.description || 'Tidak ada deskripsi' }}></div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm text-gray-500">Harga</p>
                {product.discount_price ? (
                  <div>
                    <p className="text-lg line-through text-gray-500">{formattedPrice}</p>
                    <p className="text-lg font-semibold text-red-600">{formattedDiscountPrice}</p>
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{formattedPrice}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Stok</p>
                <div className="flex items-center">
                  <p className="text-lg font-semibold text-gray-900">{product.stock}</p>
                  <span className={`ml-2 w-3 h-3 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">ID Produk</p>
                <p className="text-sm text-gray-900 font-mono">{product.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DetailProductPage;