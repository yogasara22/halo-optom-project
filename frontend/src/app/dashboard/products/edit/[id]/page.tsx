'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FiUpload, FiX, FiPlus } from 'react-icons/fi';
import { MdCloudUpload } from 'react-icons/md';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CurrencyInput from '@/components/ui/CurrencyInput';
import WYSIWYGEditor from '@/components/ui/WYSIWYGEditor';
import SearchableSelect from '@/components/ui/SearchableSelect';
import productService from '@/services/productService';
import { useProduct, productKeys } from '@/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { Product } from '@/types';

// Default categories
const DEFAULT_CATEGORIES = [
  'Kacamata',
  'Lensa Kontak',
  'Cairan Pembersih',
  'Frame',
  'Aksesoris',
  'Lainnya'
];

interface EditProductPageProps {
  params: {
    id: string;
  };
}

const EditProductPage = ({ params }: EditProductPageProps) => {
  // Mengakses params.id langsung sesuai dengan pesan error
  // Next.js masih mendukung akses langsung untuk memfasilitasi migrasi
  const id: string = params.id;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [additionalDragActive, setAdditionalDragActive] = useState(false);
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    discount_price: 0,
    stock: '',
    category: DEFAULT_CATEGORIES[0],
    is_active: true
  });
  
  // Load categories from localStorage if available
  useEffect(() => {
    const savedCategories = localStorage.getItem('product_categories');
    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories);
        if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
          setCategories(parsedCategories);
        }
      } catch (error) {
        console.error('Error parsing saved categories:', error);
      }
    }
  }, []);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);

  // Menggunakan React Query untuk mengambil data produk
  const { data: product, isLoading: productLoading } = useProduct(id);
  
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (product) {
      setOriginalProduct(product);
      
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        discount_price: product.discount_price || 0,
        stock: product.stock.toString(),
        category: product.category,
        is_active: product.is_active
      });
      
      if (product.image_url) {
        setImagePreview(product.image_url);
      }

      if (product.additional_images && product.additional_images.length > 0) {
        setAdditionalImagePreviews(product.additional_images);
      }
      
      setLoading(false);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev: typeof formData) => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle WYSIWYG editor change
  const handleEditorChange = (value: string) => {
    setFormData((prev: typeof formData) => ({ ...prev, description: value }));
  };
  
  // Handle category change
  const handleCategoryChange = (value: string) => {
    setFormData((prev: typeof formData) => ({ ...prev, category: value }));
  };
  


  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleMainFile(file);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        handleAdditionalFile(file);
      });
    }
  };

  const handleMainFile = (file: File) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      toast.error('Hanya file gambar yang diperbolehkan');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAdditionalFile = (file: File) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      toast.error('Hanya file gambar yang diperbolehkan');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    // Limit to 5 additional images
    if (additionalImageFiles.length >= 5) {
      toast.error('Maksimal 5 gambar tambahan');
      return;
    }

    setAdditionalImageFiles(prev => [...prev, file]);
    const reader = new FileReader();
    reader.onload = () => {
      setAdditionalImagePreviews(prev => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const handleMainDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleMainDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleMainFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleAdditionalDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setAdditionalDragActive(true);
    } else if (e.type === 'dragleave') {
      setAdditionalDragActive(false);
    }
  }, []);

  const handleAdditionalDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdditionalDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => {
        handleAdditionalFile(file);
      });
    }
  }, [additionalImageFiles.length]);

  const triggerMainFileInput = () => {
    mainFileInputRef.current?.click();
  };

  const triggerAdditionalFileInput = () => {
    additionalFileInputRef.current?.click();
  };

  const removeMainImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (mainFileInputRef.current) {
      mainFileInputRef.current.value = '';
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
    setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return;
    setSubmitting(true);
    
    // Validasi form
    if (!formData.name.trim()) {
      toast.error('Nama produk harus diisi');
      setSubmitting(false);
      return;
    }
    
    if (formData.price <= 0) {
      toast.error('Harga produk harus lebih dari 0');
      setSubmitting(false);
      return;
    }
      
    // Validate required fields
    if (!formData.name || formData.price <= 0 || !formData.stock) {
      toast.error('Nama, harga, dan stok produk wajib diisi dengan benar');
      setSubmitting(false);
      return;
    }

    if (!imagePreview && !imageFile) {
      toast.error('Gambar produk wajib diupload');
      setSubmitting(false);
      return;
    }

    // Log data being sent
    console.log('Updating product data:', {
      name: formData.name,
      price: formData.price,
      discount_price: formData.discount_price,
      stock: formData.stock,
      category: formData.category,
      is_active: formData.is_active,
      mainImageFile: imageFile ? imageFile.name : null,
      additionalImageFiles: additionalImageFiles.map(f => f.name)
    });
    
    // Create FormData object
    const productFormData = new FormData();
    productFormData.append('name', formData.name);
    productFormData.append('description', formData.description);
    productFormData.append('price', formData.price.toString());
    if (formData.discount_price > 0) {
      productFormData.append('discount_price', formData.discount_price.toString());
    }
    productFormData.append('stock', formData.stock);
    productFormData.append('category', formData.category);
    productFormData.append('is_active', formData.is_active.toString());
    
    // Only append image if a new one is selected
    if (imageFile) {
      console.log('Appending main image:', imageFile.name, imageFile.type, imageFile.size);
      productFormData.append('image', imageFile);
    }

    // Append additional images if any
    if (additionalImageFiles.length > 0) {
      console.log(`Appending ${additionalImageFiles.length} additional images`);
      additionalImageFiles.forEach((file, index) => {
        console.log(`Additional image ${index}:`, file.name, file.type, file.size);
        productFormData.append('additional_images', file);
      });
    }

    try {
      // Gunakan service langsung seperti pada manajemen jadwal
      const updatedProduct = await productService.updateProduct(id, productFormData);
      
      // Perbarui state lokal
      setOriginalProduct(updatedProduct);
      setFormData({
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        discount_price: updatedProduct.discount_price || 0,
        stock: updatedProduct.stock.toString(),
        category: updatedProduct.category,
        is_active: updatedProduct.is_active
      });
      
      // Perbarui cache React Query secara manual
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      toast.success('Produk berhasil diperbarui');
      router.push('/dashboard/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Gagal memperbarui produk');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || productLoading || submitting) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Produk</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Kembali
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan nama produk"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <WYSIWYGEditor
                  value={formData.description}
                  onChange={handleEditorChange}
                  placeholder="Masukkan deskripsi produk lengkap dengan format..."
                  className="min-h-[200px]"
                />
                <p className="mt-1 text-xs text-gray-500">Gunakan editor untuk membuat deskripsi produk yang menarik dengan format yang lengkap</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Harga Normal (Rp) <span className="text-red-500">*</span>
                  </label>
                  <CurrencyInput
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={(value) => setFormData({...formData, price: value})}
                    required
                    min={0}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label htmlFor="discount_price" className="block text-sm font-medium text-gray-700 mb-1">
                    Harga Diskon (Rp)
                  </label>
                  <CurrencyInput
                    id="discount_price"
                    name="discount_price"
                    value={formData.discount_price}
                    onChange={(value) => setFormData({...formData, discount_price: value})}
                    min={0}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stok <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  value={formData.category}
                  onChange={handleCategoryChange}
                  options={categories.map(cat => ({ value: cat, label: cat }))}
                  placeholder="Pilih kategori"
                  searchPlaceholder="Cari kategori..."
                  allowClear
                />
                <p className="mt-1 text-xs text-gray-500">Pilih kategori dari daftar yang tersedia</p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Produk Aktif
                </label>
              </div>
            </div>

            {/* Right Column - Image Upload */}
            <div className="space-y-6">
              {/* Main Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar Utama <span className="text-red-500">*</span>
                </label>
                
                <div 
                  className={`relative border-2 border-dashed rounded-lg p-4 h-60 flex flex-col items-center justify-center cursor-pointer transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                  onDragEnter={handleMainDrag}
                  onDragOver={handleMainDrag}
                  onDragLeave={handleMainDrag}
                  onDrop={handleMainDrop}
                  onClick={triggerMainFileInput}
                >
                  <input
                    ref={mainFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="hidden"
                  />
                  
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <Image 
                        src={imagePreview} 
                        alt="Preview" 
                        fill
                        sizes="(max-width: 768px) 100vw, 500px"
                        className="object-contain"
                      />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMainImage();
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <MdCloudUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-900">
                          Klik atau seret gambar utama ke sini
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, JPEG (Maks. 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="mt-2 text-xs text-gray-500">
                  Gambar utama akan ditampilkan sebagai gambar utama produk
                </p>
              </div>
              
              {/* Additional Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar Tambahan (Opsional)
                </label>
                
                <div 
                  className={`relative border-2 border-dashed rounded-lg p-4 h-40 flex flex-col items-center justify-center cursor-pointer transition-all ${additionalDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                  onDragEnter={handleAdditionalDrag}
                  onDragOver={handleAdditionalDrag}
                  onDragLeave={handleAdditionalDrag}
                  onDrop={handleAdditionalDrop}
                  onClick={triggerAdditionalFileInput}
                >
                  <input
                    ref={additionalFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAdditionalImagesChange}
                    multiple
                    className="hidden"
                  />
                  
                  <div className="text-center">
                    <MdCloudUpload className="mx-auto h-10 w-10 text-gray-400" />
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-900">
                        Klik atau seret gambar tambahan ke sini
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Maksimal 5 gambar tambahan (Maks. 5MB per gambar)
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Additional Images Preview */}
                {additionalImagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Preview Gambar Tambahan
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {additionalImagePreviews.map((preview, index) => (
                        <div key={index} className="relative w-20 h-20 border rounded-md overflow-hidden">
                          <Image 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                          <button 
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md hover:bg-red-600 transition-colors"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="mt-2 text-xs text-gray-500">
                  Gambar tambahan akan ditampilkan sebagai galeri produk
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EditProductPage;