'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Calendar, 
  DollarSign,
  Star,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import analyticsService from '@/services/analytics.service';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalOrders: number;
    totalAppointments: number;
    totalRevenue: number;
    totalReviews: number;
  };
  growth: {
    users: { current: number; previous: number; percentage: number };
    orders: { current: number; previous: number; percentage: number };
    appointments: { current: number; previous: number; percentage: number };
    revenue: { current: number; previous: number; percentage: number };
  };
}

interface RevenueData {
  timeline: Array<{ period: string; revenue: number; transactions: number }>;
  bySource: Array<{ source: string; revenue: number; transactions: number }>;
  summary: { totalRevenue: number; totalTransactions: number; averageTransaction: number };
}

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Menggunakan mock data dari analyticsService karena endpoint belum tersedia
      // Ini mencegah error 404 dan error parsing JSON
      const analytics = analyticsService.generateMockDashboardAnalytics();
      const revenue = analyticsService.generateMockRevenueAnalytics();
      
      setAnalyticsData(analytics);
      setRevenueData(revenue);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Mock data for demonstration
      setAnalyticsData({
        overview: {
          totalUsers: 1250,
          totalOrders: 890,
          totalAppointments: 456,
          totalRevenue: 125000,
          totalReviews: 234
        },
        growth: {
          users: { current: 45, previous: 38, percentage: 18.4 },
          orders: { current: 123, previous: 98, percentage: 25.5 },
          appointments: { current: 67, previous: 72, percentage: -6.9 },
          revenue: { current: 15600, previous: 12800, percentage: 21.9 }
        }
      });
      
      setRevenueData({
        timeline: [
          { period: '2024-01-01', revenue: 5200, transactions: 12 },
          { period: '2024-01-02', revenue: 4800, transactions: 10 },
          { period: '2024-01-03', revenue: 6100, transactions: 15 }
        ],
        bySource: [
          { source: 'appointments', revenue: 45000, transactions: 150 },
          { source: 'orders', revenue: 80000, transactions: 320 }
        ],
        summary: { totalRevenue: 125000, totalTransactions: 470, averageTransaction: 265.96 }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const isPositive = percentage >= 0;
    return (
      <div className={`flex items-center gap-1 ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span className="font-medium">{Math.abs(percentage).toFixed(1)}%</span>
      </div>
    );
  };

  const exportReport = async (type: string) => {
    try {
      const response = await fetch(`/api/analytics/export?type=${type}&period=${period}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600 mt-1">Comprehensive insights into your business performance</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select 
              value={period} 
              onChange={setPeriod}
              options={[
                { value: "7", label: "Last 7 days" },
                { value: "30", label: "Last 30 days" },
                { value: "90", label: "Last 90 days" },
                { value: "365", label: "Last year" }
              ]}
              placeholder="Select period"
              className="w-[180px]"
            />
            
            <Button variant="outline" onClick={() => exportReport('dashboard')}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Products
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">Total Users</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {analyticsData?.overview.totalUsers.toLocaleString()}
                          </p>
                          {formatPercentage(analyticsData?.growth.users.percentage || 0)}
                        </div>
                        <div className="p-3 bg-blue-200 rounded-full">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-900">
                            {formatCurrency(analyticsData?.overview.totalRevenue || 0)}
                          </p>
                          {formatPercentage(analyticsData?.growth.revenue.percentage || 0)}
                        </div>
                        <div className="p-3 bg-green-200 rounded-full">
                          <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Appointments</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {analyticsData?.overview.totalAppointments.toLocaleString()}
                          </p>
                          {formatPercentage(analyticsData?.growth.appointments.percentage || 0)}
                        </div>
                        <div className="p-3 bg-purple-200 rounded-full">
                          <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-600 text-sm font-medium">Orders</p>
                          <p className="text-2xl font-bold text-orange-900">
                            {analyticsData?.overview.totalOrders.toLocaleString()}
                          </p>
                          {formatPercentage(analyticsData?.growth.orders.percentage || 0)}
                        </div>
                        <div className="p-3 bg-orange-200 rounded-full">
                          <ShoppingCart className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChart className="w-5 h-5" />
                        Revenue Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Revenue chart will be displayed here</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5" />
                        Revenue by Source
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {revenueData?.bySource.map((source, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                source.source === 'appointments' ? 'bg-blue-500' : 'bg-green-500'
                              }`} />
                              <span className="capitalize font-medium">{source.source}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(source.revenue)}</p>
                              <p className="text-sm text-gray-500">{source.transactions} transactions</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(revenueData?.summary.totalRevenue || 0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {revenueData?.summary.totalTransactions} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(revenueData?.summary.averageTransaction || 0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Per transaction</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatPercentage(analyticsData?.growth.revenue.percentage || 0)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">vs previous period</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs content would go here */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">User analytics content will be implemented here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Appointment analytics content will be implemented here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Product Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Product analytics content will be implemented here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;