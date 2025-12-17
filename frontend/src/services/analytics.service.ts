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
      const response = await api.get(`/analytics/dashboard?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  }

  // Revenue Analytics
  async getRevenueAnalytics(period: string = '30', type: string = 'daily'): Promise<RevenueAnalytics> {
    try {
      const response = await api.get(`/analytics/revenue?period=${period}&type=${type}`);
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

  // Mock data generators for development
  generateMockDashboardAnalytics(): DashboardAnalytics {
    // Menghasilkan data dinamis setiap kali dipanggil
    const totalUsers = Math.floor(Math.random() * 500) + 1000;
    const totalOrders = Math.floor(Math.random() * 300) + 700;
    const totalAppointments = Math.floor(Math.random() * 200) + 300;
    const totalRevenue = Math.floor(Math.random() * 50000000) + 100000000;
    const totalReviews = Math.floor(Math.random() * 100) + 150;
    
    const usersCurrent = Math.floor(Math.random() * 20) + 30;
    const usersPrevious = Math.floor(Math.random() * 20) + 25;
    const usersPercentage = parseFloat(((usersCurrent - usersPrevious) / usersPrevious * 100).toFixed(1));
    
    const ordersCurrent = Math.floor(Math.random() * 50) + 100;
    const ordersPrevious = Math.floor(Math.random() * 40) + 80;
    const ordersPercentage = parseFloat(((ordersCurrent - ordersPrevious) / ordersPrevious * 100).toFixed(1));
    
    const appointmentsCurrent = Math.floor(Math.random() * 30) + 50;
    const appointmentsPrevious = Math.floor(Math.random() * 30) + 50;
    const appointmentsPercentage = parseFloat(((appointmentsCurrent - appointmentsPrevious) / appointmentsPrevious * 100).toFixed(1));
    
    const revenueCurrent = Math.floor(Math.random() * 5000000) + 12000000;
    const revenuePrevious = Math.floor(Math.random() * 4000000) + 10000000;
    const revenuePercentage = parseFloat(((revenueCurrent - revenuePrevious) / revenuePrevious * 100).toFixed(1));
    
    return {
      overview: {
        totalUsers,
        totalOrders,
        totalAppointments,
        totalRevenue,
        totalReviews
      },
      growth: {
        users: { current: usersCurrent, previous: usersPrevious, percentage: usersPercentage },
        orders: { current: ordersCurrent, previous: ordersPrevious, percentage: ordersPercentage },
        appointments: { current: appointmentsCurrent, previous: appointmentsPrevious, percentage: appointmentsPercentage },
        revenue: { current: revenueCurrent, previous: revenuePrevious, percentage: revenuePercentage }
      }
    };
  }

  generateMockRevenueAnalytics(): RevenueAnalytics {
    const timeline: RevenueTimelineItem[] = [];
    const today = new Date();
    
    // Menghasilkan data timeline yang dinamis
    let totalRevenue = 0;
    let totalTransactions = 0;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dailyRevenue = Math.floor(Math.random() * 5000000) + 1000000;
      const dailyTransactions = Math.floor(Math.random() * 50) + 10;
      
      totalRevenue += dailyRevenue;
      totalTransactions += dailyTransactions;
      
      timeline.push({
        period: date.toISOString().split('T')[0],
        revenue: dailyRevenue,
        transactions: dailyTransactions
      });
    }
    
    // Menghasilkan data sumber pendapatan yang dinamis
    const appointmentsRevenue = Math.floor(Math.random() * 30000000) + 30000000;
    const appointmentsTransactions = Math.floor(Math.random() * 100) + 100;
    
    const ordersRevenue = Math.floor(Math.random() * 50000000) + 50000000;
    const ordersTransactions = Math.floor(Math.random() * 200) + 200;
    
    // Menghitung rata-rata transaksi
    const totalSourceTransactions = appointmentsTransactions + ordersTransactions;
    const totalSourceRevenue = appointmentsRevenue + ordersRevenue;
    const averageTransaction = Math.floor(totalSourceRevenue / totalSourceTransactions);
    
    return {
      timeline,
      bySource: [
        { source: 'appointments', revenue: appointmentsRevenue, transactions: appointmentsTransactions },
        { source: 'orders', revenue: ordersRevenue, transactions: ordersTransactions }
      ],
      summary: {
        totalRevenue: totalSourceRevenue,
        totalTransactions: totalSourceTransactions,
        averageTransaction
      }
    };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;