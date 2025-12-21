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

// Mendapatkan semua review untuk admin
export const getAllReviews = async (): Promise<Review[]> => {
  const response = await api.get<{ data: Review[] }>('/reviews/admin/all');
  return response.data.data;
};

// Mendapatkan statistik review untuk admin
export const getReviewStats = async (): Promise<ReviewStats> => {
  const response = await api.get<ReviewStats>('/reviews/admin/stats');
  return response.data;
};

// Update status review
export const updateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected'): Promise<Review> => {
  const response = await api.patch<{ data: Review }>(`/reviews/${reviewId}/status`, { status });
  return response.data.data;
};