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
  summary: { totalRevenue: number; totalTransactions: number; averageTransaction: number; growthRate: number };
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
      const analytics = await analyticsService.getDashboardAnalytics(period);
      const revenue = await analyticsService.getRevenueAnalytics(period);

      setAnalyticsData(analytics);
      setRevenueData(revenue);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isPositive
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-rose-50 text-rose-700'
        }`}>
        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        <span>{Math.abs(percentage).toFixed(1)}%</span>
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
      <div className="space-y-8 p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-500 mt-2 text-base">Comprehensive insights into your business performance</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-[180px]">
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
                className="w-full"
              />
            </div>

            <Button variant="outline" onClick={() => exportReport('dashboard')} className="shadow-sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="border-b border-gray-100 pb-1">
            <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-2 bg-transparent p-0 gap-6">
              {[
                { value: 'overview', icon: Activity, label: 'Overview' },
                { value: 'revenue', icon: DollarSign, label: 'Revenue' },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-900 transition-all duration-200"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 duration-500">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="border-none shadow-sm rounded-2xl bg-gray-50/50">
                    <CardContent className="p-6">
                      <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Users */}
                  <Card className="border border-gray-100/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        {formatPercentage(analyticsData?.growth.users.percentage || 0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                        <h3 className="text-xl font-bold tracking-tight text-gray-900">
                          {analyticsData?.overview.totalUsers.toLocaleString()}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Revenue */}
                  <Card className="border border-gray-100/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <DollarSign className="w-6 h-6 text-emerald-600" />
                        </div>
                        {formatPercentage(analyticsData?.growth.revenue.percentage || 0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                        <h3 className="text-xl font-bold tracking-tight text-gray-900">
                          {formatCurrency(analyticsData?.overview.totalRevenue || 0)}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Appointments */}
                  <Card className="border border-gray-100/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Calendar className="w-6 h-6 text-violet-600" />
                        </div>
                        {formatPercentage(analyticsData?.growth.appointments.percentage || 0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Active Appointments</p>
                        <h3 className="text-xl font-bold tracking-tight text-gray-900">
                          {analyticsData?.overview.totalAppointments.toLocaleString()}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Orders */}
                  <Card className="border border-gray-100/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <ShoppingCart className="w-6 h-6 text-amber-600" />
                        </div>
                        {formatPercentage(analyticsData?.growth.orders.percentage || 0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
                        <h3 className="text-xl font-bold tracking-tight text-gray-900">
                          {analyticsData?.overview.totalOrders.toLocaleString()}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Section */}
                <div className="flex flex-col gap-8">
                  {/* Revenue by Source - Now at Top & Horizontal */}
                  <Card className="border border-gray-100/50 shadow-sm rounded-2xl overflow-hidden bg-white">
                    <CardHeader className="border-b border-gray-50 p-6 bg-linear-to-r from-gray-50/50 to-transparent">
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <PieChart className="w-5 h-5 text-blue-600" />
                        Revenue by Source
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {revenueData?.bySource.map((source, index) => (
                          <div
                            key={index}
                            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/30 p-5 transition-all duration-300 hover:border-blue-100 hover:bg-blue-50/30 hover:shadow-md"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 ${source.source === 'appointments' ? 'text-blue-600' : 'text-emerald-600'
                                  }`}>
                                  {source.source === 'appointments' ? (
                                    <Calendar className="h-5 w-5" />
                                  ) : (
                                    <ShoppingCart className="h-5 w-5" />
                                  )}
                                </div>
                                <span className="text-sm font-medium text-gray-600 capitalize">
                                  {source.source}
                                </span>
                              </div>
                              {revenueData && revenueData.summary.totalRevenue > 0 && (
                                <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${source.source === 'appointments'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                  {((source.revenue / revenueData.summary.totalRevenue) * 100).toFixed(0)}%
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <p className="text-2xl font-bold tracking-tight text-gray-900">
                                {formatCurrency(source.revenue)}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Users className="h-4 w-4" />
                                <span>{source.transactions} transactions</span>
                              </div>
                            </div>

                            {/* Decorative gradient blob */}
                            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl transition-all duration-500 group-hover:scale-150 ${source.source === 'appointments' ? 'bg-blue-500' : 'bg-emerald-500'
                              }`} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Revenue Trend - Below Source */}
                  <Card className="border border-gray-100/50 shadow-sm rounded-2xl overflow-hidden bg-white">
                    <CardHeader className="border-b border-gray-50 p-6 flex flex-row items-center justify-between bg-linear-to-r from-gray-50/50 to-transparent">
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <LineChart className="w-5 h-5 text-violet-600" />
                        Revenue Trend
                      </CardTitle>
                      <Select
                        value={period}
                        onChange={setPeriod}
                        options={[
                          { value: "7", label: "7 Days" },
                          { value: "30", label: "30 Days" },
                          { value: "90", label: "3 Months" }
                        ]}
                        className="w-32! py-2! text-sm"
                      />
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="h-[400px] w-full bg-linear-to-b from-white to-gray-50/50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group">

                        {/* Placeholder Content */}
                        <div className="z-10 relative">
                          <div className="w-20 h-20 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-transform duration-500">
                            <BarChart3 className="w-10 h-10 text-gray-300 group-hover:text-blue-500 transition-colors duration-300" />
                          </div>
                          <h3 className="text-gray-900 font-semibold text-lg mb-2">Interactive Chart</h3>
                          <p className="text-gray-500 max-w-sm mx-auto">
                            A detailed interactive revenue chart will be visualized here, showing trends over time.
                          </p>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#3b82f6_1px,transparent_1px)] bg-size-[16px_16px]" />
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white to-transparent" />
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
              <Card className="border border-gray-100/50 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle>Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-emerald-600">
                    {formatCurrency(revenueData?.summary.totalRevenue || 0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {revenueData?.summary.totalTransactions} transactions
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-100/50 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle>Average Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(revenueData?.summary.averageTransaction || 0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Per transaction</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-100/50 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle>Growth Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-gray-900">
                    {formatPercentage(revenueData?.summary.growthRate || 0)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">vs previous period</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
