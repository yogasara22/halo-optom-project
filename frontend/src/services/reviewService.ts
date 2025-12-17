import api from '@/lib/api';
import { Review, ReviewStats } from '@/types/review';

// Mendapatkan semua review untuk optometris tertentu
export const getReviewsForOptometrist = async (optometristId: string): Promise<Review[]> => {
  const response = await api.get<Review[]>(`/reviews/optometrist/${optometristId}`);
  return response.data;
};

// Mendapatkan semua review yang dibuat oleh pasien yang login
export const getMyReviews = async (): Promise<Review[]> => {
  const response = await api.get<Review[]>('/reviews/me');
  return response.data;
};

// Membuat atau mengupdate review
export const createReview = async (optometristId: string, rating: number, comment: string): Promise<Review> => {
  const response = await api.post<Review>('/reviews', {
    optometrist_id: optometristId,
    rating,
    comment
  });
  return response.data;
};

// Menghapus review
export const deleteReview = async (reviewId: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/reviews/${reviewId}`);
  return response.data;
};

// Mendapatkan semua review untuk admin (akan dibuat endpoint baru di backend)
export const getAllReviews = async (): Promise<Review[]> => {
  try {
    // Sementara menggunakan mock data karena endpoint belum tersedia
    const mockReviews: Review[] = [
      // Mock data akan diganti dengan API call setelah endpoint tersedia
    ];
    return mockReviews;
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    throw error;
  }
};

// Mendapatkan statistik review untuk admin (akan dibuat endpoint baru di backend)
export const getReviewStats = async (): Promise<ReviewStats> => {
  try {
    // TODO: Ganti dengan API call ke endpoint yang sebenarnya
    // Endpoint ini akan mengambil data review dari mobile app Halo Optom
    // const response = await api.get<ReviewStats>('/admin/reviews/stats');
    // return response.data;
    
    // Sementara menggunakan nilai default (0) untuk semua statistik
    // Data ini akan otomatis diperbarui ketika endpoint API tersedia
    const mockStats: ReviewStats = {
      totalReviews: 0,
      pendingReviews: 0,
      approvedReviews: 0,
      rejectedReviews: 0,
      averageRating: 0,
      reportedReviews: 0
    };
    return mockStats;
  } catch (error) {
    console.error('Error fetching review stats:', error);
    throw error;
  }
};

// Update status review (akan dibuat endpoint baru di backend)
export const updateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected'): Promise<Review> => {
  try {
    // Sementara menggunakan mock response karena endpoint belum tersedia
    // Akan diganti dengan API call setelah endpoint tersedia
    return {
      id: reviewId,
      status
    } as Review;
  } catch (error) {
    console.error('Error updating review status:', error);
    throw error;
  }
};