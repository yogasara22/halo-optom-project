'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Star, Eye, CheckCircle, XCircle, AlertTriangle, MessageSquare, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Review, ReviewStats, ReviewFilter } from '@/types/review';
import { getAllReviews, getReviewStats, updateReviewStatus } from '@/services/reviewService';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    averageRating: 0,
    reportedReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();

      // Format data to match UI requirements
      const formattedReviews = data.map(review => ({
        ...review,
        patientName: review.patient?.name || 'Unknown',
        patientEmail: review.patient?.email || 'Unknown',
        optometristName: review.optometrist?.name || 'Unknown',
        // Default values for fields not in backend model yet
        serviceType: review.serviceType || 'consultation',
        status: review.status || 'pending',
        createdAt: review.created_at ? new Date(review.created_at).toISOString() : new Date().toISOString(),
        reportCount: review.reportCount || 0,
        isReported: review.isReported || false
      }));

      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Gagal memuat data review');
      setReviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getReviewStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Gagal memuat statistik review');
      setStats({
        totalReviews: 0,
        pendingReviews: 0,
        approvedReviews: 0,
        rejectedReviews: 0,
        averageRating: 0,
        reportedReviews: 0
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchReviews(), fetchStats()]);
  };

  const handleStatusUpdate = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
    try {
      // Show loading toast
      const loadingToast = toast.loading(`${newStatus === 'approved' ? 'Menyetujui' : 'Menolak'} review...`);

      // Call API to update status
      const updatedReview = await updateReviewStatus(reviewId, newStatus);

      // Update local state
      setReviews(prev => prev.map(review =>
        review.id === reviewId ? { ...review, status: newStatus } : review
      ));

      // Update stats
      setStats(prev => ({
        ...prev,
        pendingReviews: prev.pendingReviews - 1,
        approvedReviews: newStatus === 'approved' ? prev.approvedReviews + 1 : prev.approvedReviews,
        rejectedReviews: newStatus === 'rejected' ? prev.rejectedReviews + 1 : prev.rejectedReviews
      }));

      // Show success toast
      toast.dismiss(loadingToast);
      toast.success(`Review berhasil ${newStatus === 'approved' ? 'disetujui' : 'ditolak'}`);
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error(`Gagal ${newStatus === 'approved' ? 'menyetujui' : 'menolak'} review`);
    }
  };

  const handleViewDetails = (review: Review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = (review.patientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (review.optometristName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (review.comment?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesService = serviceFilter === 'all' || review.serviceType === serviceFilter;
    const matchesRating = ratingFilter === 'all' ||
      (ratingFilter === '5' && review.rating === 5) ||
      (ratingFilter === '4' && review.rating === 4) ||
      (ratingFilter === '3' && review.rating === 3) ||
      (ratingFilter === '1-2' && review.rating <= 2);

    return matchesSearch && matchesStatus && matchesService && matchesRating;
  });

  // Add animation class when filtering changes
  useEffect(() => {
    if (!loading) {
      const tableBody = document.querySelector('tbody');
      if (tableBody) {
        tableBody.classList.add('animate-fade-in');
        setTimeout(() => {
          tableBody.classList.remove('animate-fade-in');
        }, 500);
      }
    }
  }, [filteredReviews, loading]);

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getServiceTypeLabel = (type?: string) => {
    switch (type) {
      case 'consultation': return 'Konsultasi';
      case 'homecare': return 'Homecare';
      case 'product': return 'Produk';
      default: return type;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review & Feedback</h1>
            <p className="text-gray-600">Kelola dan moderasi review dari pasien</p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2 self-start"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Stats Cards */}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Total Reviews */}
          <Card className="shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  {stats.totalReviews > 0 && (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      +12%
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Total Review</p>
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <p className="text-xl font-bold text-gray-800">{stats.totalReviews}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card className="shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-amber-50">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Pending</p>
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <p className="text-xl font-bold text-gray-800">{stats.pendingReviews}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approved Reviews */}
          <Card className="shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Approved</p>
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <p className="text-xl font-bold text-gray-800">{stats.approvedReviews}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rejected Reviews */}
          <Card className="shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-rose-50">
                    <XCircle className="w-5 h-5 text-rose-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Rejected</p>
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <p className="text-xl font-bold text-gray-800">{stats.rejectedReviews}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card className="shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-yellow-50">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Rata-rata Rating</p>
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <p className="text-xl font-bold text-gray-800">{stats.averageRating.toFixed(1)}</p>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reported Reviews */}
          <Card className="shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <AlertTriangle className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Reported</p>
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <p className="text-xl font-bold text-gray-800">{stats.reportedReviews}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 pb-2">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-blue-800 text-lg">Filter Review</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-4 relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Cari Review</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nama pasien, optometris, atau komentar..."
                    className="w-full h-10 px-3 pl-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 shadow-sm group-hover:border-blue-200"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Status</label>
                <div className="relative group">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-10 px-3 pl-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none transition-all duration-200 shadow-sm cursor-pointer hover:border-blue-200"
                  >
                    <option value="all">Semua</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {statusFilter === 'pending' ? <AlertTriangle className="h-4 w-4 text-amber-500" /> :
                      statusFilter === 'approved' ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                        statusFilter === 'rejected' ? <XCircle className="h-4 w-4 text-red-500" /> :
                          <div className="h-4 w-4 text-gray-400 flex items-center justify-center font-bold text-xs">•••</div>}
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Layanan</label>
                <div className="relative group">
                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="w-full h-10 px-3 pl-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none transition-all duration-200 shadow-sm cursor-pointer hover:border-blue-200"
                  >
                    <option value="all">Semua</option>
                    <option value="consultation">Konsultasi</option>
                    <option value="homecare">Homecare</option>
                    <option value="product">Produk</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Rating</label>
                <div className="relative group">
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="w-full h-10 px-3 pl-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none transition-all duration-200 shadow-sm cursor-pointer hover:border-blue-200"
                  >
                    <option value="all">Semua</option>
                    <option value="5">5 Bintang</option>
                    <option value="4">4 Bintang</option>
                    <option value="3">3 Bintang</option>
                    <option value="1-2">1-2 Bintang</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setServiceFilter('all');
                    setRatingFilter('all');
                    setCurrentPage(1);
                  }}
                  variant="outline"
                  className="w-full h-10 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 shadow-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Table */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-blue-800 text-lg">Daftar Review</CardTitle>
              </div>
              <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 px-3 py-1">
                {filteredReviews.length} Review
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Pasien</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Optometris</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Layanan</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Komentar</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    // Loading skeleton
                    Array(5).fill(0).map((_, index) => (
                      <tr key={`skeleton-${index}`} className="border-b animate-pulse">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                            <div className="ml-3">
                              <div className="h-4 w-24 bg-gray-200 rounded"></div>
                              <div className="h-3 w-16 bg-gray-200 rounded mt-1"></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-1">
                            {Array(5).fill(0).map((_, i) => (
                              <div key={i} className="h-4 w-4 bg-gray-200 rounded-full"></div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    // Actual data
                    paginatedReviews.map((review) => (
                      <tr key={review.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{review.patientName}</p>
                            <p className="text-sm text-gray-500">{review.patientEmail}</p>
                            {review.isReported && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Dilaporkan ({review.reportCount})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-900">{review.optometristName}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getServiceTypeLabel(review.serviceType)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-600 ml-2">({review.rating})</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-900 max-w-xs truncate" title={review.comment}>
                            {review.comment}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                            {review.status === 'pending' && 'Pending'}
                            {review.status === 'approved' && 'Approved'}
                            {review.status === 'rejected' && 'Rejected'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-600">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString('id-ID') : '-'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(review)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {review.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(review.id, 'approved')}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 mb-2 px-4">
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium text-blue-600">{startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredReviews.length)}</span> dari <span className="font-medium text-blue-600">{filteredReviews.length}</span> review
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || refreshing}
                    className="border-gray-200 hover-border-blue-300 hover:bg-blue-50 transition-colors duration-200 gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6" /></svg>
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-md bg-white shadow-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || refreshing}
                    className="border-gray-200 hover-border-blue-300 hover:bg-blue-50 transition-colors duration-200 gap-1"
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6" /></svg>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Details Modal */}
        {showModal && selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl p-0 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-800">Detail Review</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  className="rounded-full h-8 w-8 p-0 flex items-center justify-center hover:bg-blue-100"
                >
                  ×
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="shrink-0 h-12 w-12 rounded-full bg-linear-to-r from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-medium text-xl">
                      {selectedReview.patientName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedReview.patientName || 'Tidak diketahui'}</h3>
                      <p className="text-sm text-gray-500">{selectedReview.patientEmail || '-'}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReview.status)}`}>
                    {selectedReview.status === 'pending' && <AlertTriangle className="w-4 h-4 mr-1" />}
                    {selectedReview.status === 'approved' && <CheckCircle className="w-4 h-4 mr-1" />}
                    {selectedReview.status === 'rejected' && <XCircle className="w-4 h-4 mr-1" />}
                    {selectedReview.status === 'pending' && 'Pending'}
                    {selectedReview.status === 'approved' && 'Approved'}
                    {selectedReview.status === 'rejected' && 'Rejected'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Informasi Review</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Optometris</span>
                          <span className="text-sm font-medium text-gray-900">{selectedReview.optometristName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Layanan</span>
                          <span className="text-sm font-medium text-blue-600">{getServiceTypeLabel(selectedReview.serviceType)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Tanggal</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedReview.createdAt ? format(new Date(selectedReview.createdAt), 'PPP', { locale: id }) : '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Rating</h3>
                      <div className="flex items-center">
                        <div className="flex">
                          {renderStars(selectedReview.rating)}
                        </div>
                        <span className="ml-2 text-lg font-semibold text-gray-900">{selectedReview.rating}/5</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Komentar</h3>
                        <span className="text-xs text-gray-400">{selectedReview.comment?.length || 0} karakter</span>
                      </div>
                      <div className="p-3 bg-white rounded border border-gray-200 min-h-[100px]">
                        <p className="text-gray-900">{selectedReview.comment}</p>
                      </div>
                    </div>

                    {selectedReview.isReported && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <div className="flex">
                          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Review Dilaporkan</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>Review ini telah dilaporkan sebanyak {selectedReview.reportCount} kali oleh pengguna lain.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedReview.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-100">
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedReview.id, 'approved');
                        setShowModal(false);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Review
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleStatusUpdate(selectedReview.id, 'rejected');
                        setShowModal(false);
                      }}
                      className="flex-1 text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 transition-colors duration-200"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Review
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
