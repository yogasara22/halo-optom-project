import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardStats } from '@/types';
import { toast } from 'react-hot-toast';
import { getReviewStats } from '@/services/reviewService';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
};

// Fetch dashboard stats
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/admin/stats');
    const reviewStats = await getReviewStats();
    
    // Menggabungkan data dari API admin/stats dengan data review
    return {
      ...response.data,
      totalReviews: reviewStats.totalReviews,
      pendingReviews: reviewStats.pendingReviews,
      approvedReviews: reviewStats.approvedReviews,
      rejectedReviews: reviewStats.rejectedReviews,
      averageRating: reviewStats.averageRating,
      reportedReviews: reviewStats.reportedReviews
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch dashboard stats');
  }
};

// Hook for dashboard stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      try {
        return await fetchDashboardStats();
      } catch (error) {
        toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`); 
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};