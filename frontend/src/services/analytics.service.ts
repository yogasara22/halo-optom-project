import { api } from '../lib/api';

export interface AnalyticsOverview {
  totalUsers: number;
  totalOrders: number;
  totalAppointments: number;
  totalRevenue: number;
  totalReviews: number;
}

export interface GrowthMetrics {
  users: { current: number; previous: number; percentage: number };
  orders: { current: number; previous: number; percentage: number };
  appointments: { current: number; previous: number; percentage: number };
  revenue: { current: number; previous: number; percentage: number };
}

export interface DashboardAnalytics {
  overview: AnalyticsOverview;
  growth: GrowthMetrics;
}

export interface RevenueTimelineItem {
  period: string;
  revenue: number;
  transactions: number;
}

export interface RevenueBySource {
  source: string;
  revenue: number;
  transactions: number;
}

export interface RevenueAnalytics {
  timeline: RevenueTimelineItem[];
  bySource: RevenueBySource[];
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    averageTransaction: number;
    growthRate: number;
  };
}

export interface UserRegistrationTrend {
  date: string;
  registrations: number;
}

export interface UserDemographic {
  role: string;
  count: number;
}

export interface UserAnalytics {
  registrationTrends: UserRegistrationTrend[];
  demographics: UserDemographic[];
  activeUsers: number;
  totalUsers: number;
}

export interface AppointmentTrend {
  date: string;
  appointments: number;
  status: string;
}

export interface AppointmentStatusDistribution {
  status: string;
  count: number;
}

export interface PeakHour {
  hour: number;
  appointments: number;
}

export interface AppointmentAnalytics {
  trends: AppointmentTrend[];
  statusDistribution: AppointmentStatusDistribution[];
  peakHours: PeakHour[];
}

export interface TopProduct {
  id: string;
  name: string;
  price: number;
  totalSold: number;
  revenue: number;
}

export interface CategoryPerformance {
  category: string;
  productCount: number;
  totalSold: number;
  revenue: number;
}

export interface ProductAnalytics {
  topProducts: TopProduct[];
  categoryPerformance: CategoryPerformance[];
}

export interface ReviewTrend {
  date: string;
  reviews: number;
  averageRating: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export interface ReviewAnalytics {
  trends: ReviewTrend[];
  ratingDistribution: RatingDistribution[];
  overallStats: {
    totalReviews: number;
    averageRating: number;
  };
}

export interface ReportData {
  id: string;
  type: string;
  title: string;
  description: string;
  generatedAt: string;
  status: 'completed' | 'processing' | 'failed';
  downloadUrl?: string;
  recordCount: number;
}

export interface ExportReportResponse {
  data: any[];
  filename: string;
}

class AnalyticsService {
  // Dashboard Analytics
  async getDashboardAnalytics(period: string = '30'): Promise<DashboardAnalytics> {
    try {
      const response = await api.get('/analytics/stats');
      const data = response.data;

      return {
        overview: {
          totalUsers: Number(data.totalUsers) || 0,
          totalOrders: Number(data.totalOrders) || 0,
          totalAppointments: Number(data.activeAppointments) || 0,
          totalRevenue: Number(data.totalRevenue) || 0,
          totalReviews: 0
        },
        growth: {
          // Backend currently doesn't provide historical data for these counters in /stats
          // Setting to 0 to reflect real data state rather than random mock
          users: { current: Number(data.totalUsers), previous: 0, percentage: 0 },
          orders: { current: Number(data.totalOrders), previous: 0, percentage: 0 },
          appointments: { current: Number(data.activeAppointments), previous: 0, percentage: 0 },

          // Revenue growth will be handled by the revenue analytics endpoint
          revenue: { current: Number(data.totalRevenue), previous: 0, percentage: 0 }
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      // Fallback to initial structure with 0s if error
      return {
        overview: { totalUsers: 0, totalOrders: 0, totalAppointments: 0, totalRevenue: 0, totalReviews: 0 },
        growth: {
          users: { current: 0, previous: 0, percentage: 0 },
          orders: { current: 0, previous: 0, percentage: 0 },
          appointments: { current: 0, previous: 0, percentage: 0 },
          revenue: { current: 0, previous: 0, percentage: 0 }
        }
      };
    }
  }

  // Revenue Analytics
  async getRevenueAnalytics(period: string = '30', type: string = 'daily'): Promise<RevenueAnalytics> {
    try {
      // Backend expects 'period' as days count (e.g., '30')
      const response = await api.get(`/analytics/revenue`, {
        params: { period, type }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  }

  // User Analytics
  async getUserAnalytics(period: string = '30'): Promise<UserAnalytics> {
    try {
      const response = await api.get(`/analytics/users?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }

  // Appointment Analytics
  async getAppointmentAnalytics(period: string = '30'): Promise<AppointmentAnalytics> {
    try {
      const response = await api.get(`/analytics/appointments?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment analytics:', error);
      throw error;
    }
  }

  // Product Analytics
  async getProductAnalytics(period: string = '30'): Promise<ProductAnalytics> {
    try {
      const response = await api.get(`/analytics/products?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      throw error;
    }
  }

  // Review Analytics
  async getReviewAnalytics(period: string = '30'): Promise<ReviewAnalytics> {
    try {
      const response = await api.get(`/analytics/reviews?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching review analytics:', error);
      throw error;
    }
  }

  // Reports
  async getReports(): Promise<ReportData[]> {
    try {
      const response = await api.get('/reports');
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  async generateReport(type: string, period: string = '30'): Promise<ReportData> {
    try {
      const response = await api.post('/reports/generate', {
        type,
        period
      });
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async downloadReport(reportId: string): Promise<Blob> {
    try {
      const response = await api.get(`/reports/download/${reportId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }

  async getReportPreview(reportId: string): Promise<{ columns: any[], data: any[] }> {
    try {
      const response = await api.get(`/reports/preview/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error previewing report:', error);
      throw error;
    }
  }

  async exportReport(type: string, format: string = 'csv', period: string = '30'): Promise<ExportReportResponse | Blob> {
    try {
      const params = new URLSearchParams({
        type,
        format,
        period
      });

      if (format === 'csv') {
        const response = await api.get(`/analytics/export?${params}`, {
          responseType: 'blob'
        });
        return response.data;
      } else {
        const response = await api.get(`/analytics/export?${params}`);
        return response.data;
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  // Utility methods
  formatCurrency(amount: number, currency: string = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatPercentage(percentage: number): string {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  }

  formatNumber(number: number): string {
    return new Intl.NumberFormat('id-ID').format(number);
  }

  calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  // Chart data formatters
  formatChartData(data: any[], xKey: string, yKey: string) {
    return data.map(item => ({
      x: item[xKey],
      y: item[yKey]
    }));
  }

  formatPieChartData(data: any[], labelKey: string, valueKey: string) {
    return data.map(item => ({
      label: item[labelKey],
      value: item[valueKey]
    }));
  }

  // Date range helpers
  getDateRange(period: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '365':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    return { startDate, endDate };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;