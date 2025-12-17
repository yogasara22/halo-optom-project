'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  Download, 
  FileText, 
  Filter,
  Search,
  Users,
  ShoppingCart,
  Stethoscope,
  Star,
  TrendingUp,
  Eye,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface ReportData {
  id: string;
  type: string;
  title: string;
  description: string;
  generatedAt: string;
  status: 'completed' | 'processing' | 'failed';
  downloadUrl?: string;
  recordCount: number;
}

interface FilterOptions {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  reportType: string;
  status: string;
  searchTerm: string;
}

const ReportsPage = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: undefined,
    dateTo: undefined,
    reportType: 'all',
    status: 'all',
    searchTerm: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockReports: ReportData[] = [
        {
          id: '1',
          type: 'users',
          title: 'User Registration Report',
          description: 'Complete list of user registrations with demographics',
          generatedAt: '2024-01-15T10:30:00Z',
          status: 'completed',
          downloadUrl: '/api/reports/download/1',
          recordCount: Math.floor(Math.random() * 2000) + 500
        },
        {
          id: '2',
          type: 'orders',
          title: 'Sales Report - January 2024',
          description: 'Monthly sales performance and order analytics',
          generatedAt: '2024-01-14T15:45:00Z',
          status: 'completed',
          downloadUrl: '/api/reports/download/2',
          recordCount: Math.floor(Math.random() * 1000) + 300
        },
        {
          id: '3',
          type: 'appointments',
          title: 'Appointment Analytics Report',
          description: 'Appointment trends and optometrist performance',
          generatedAt: '2024-01-13T09:15:00Z',
          status: 'completed',
          downloadUrl: '/api/reports/download/3',
          recordCount: Math.floor(Math.random() * 500) + 200
        },
        {
          id: '4',
          type: 'revenue',
          title: 'Revenue Analysis Q4 2023',
          description: 'Quarterly revenue breakdown and growth analysis',
          generatedAt: '2024-01-12T14:20:00Z',
          status: 'processing',
          recordCount: Math.floor(Math.random() * 400) + 100
        }
      ];
      
      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: string) => {
    setGenerating(type);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newReport: ReportData = {
        id: Date.now().toString(),
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        description: `Generated ${type} report with current data`,
        generatedAt: new Date().toISOString(),
        status: 'completed',
        downloadUrl: `/api/reports/download/${Date.now()}`,
        recordCount: Math.floor(Math.random() * 1000) + 100
      };
      
      setReports(prev => [newReport, ...prev]);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(null);
    }
  };

  const downloadReport = async (report: ReportData) => {
    if (!report.downloadUrl) return;
    
    try {
      // Simulate download
      const link = document.createElement('a');
      link.href = report.downloadUrl;
      link.download = `${report.title.replace(/\s+/g, '_')}_${new Date(report.generatedAt).toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const getStatusBadge = (status: ReportData['status']) => {
    const variants = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getReportIcon = (type: string) => {
    const icons = {
      users: Users,
      orders: ShoppingCart,
      appointments: Stethoscope,
      revenue: TrendingUp,
      reviews: Star
    };
    
    const Icon = icons[type as keyof typeof icons] || FileText;
    return <Icon className="w-5 h-5" />;
  };

  const filteredReports = reports.filter(report => {
    if (filters.reportType !== 'all' && report.type !== filters.reportType) return false;
    if (filters.status !== 'all' && report.status !== filters.status) return false;
    if (filters.searchTerm && !report.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    
    const reportDate = new Date(report.generatedAt);
    if (filters.dateFrom && reportDate < filters.dateFrom) return false;
    if (filters.dateTo && reportDate > filters.dateTo) return false;
    
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Export</h1>
            <p className="text-gray-600 mt-1">Generate and download comprehensive business reports</p>
          </div>
          
          <Button onClick={fetchReports} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">Generated Reports</TabsTrigger>
            <TabsTrigger value="generate">Generate New Report</TabsTrigger>
          </TabsList>

          {/* Generated Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search reports..."
                        value={filters.searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Type</label>
                    <Select 
                      value={filters.reportType} 
                      onChange={(value) => setFilters(prev => ({ ...prev, reportType: value }))}
                      options={[
                        { value: "all", label: "All Types" },
                        { value: "users", label: "Users" },
                        { value: "orders", label: "Orders" },
                        { value: "appointments", label: "Appointments" },
                        { value: "revenue", label: "Revenue" },
                        { value: "reviews", label: "Reviews" }
                      ]}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select 
                      value={filters.status} 
                      onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                      options={[
                        { value: "all", label: "All Status" },
                        { value: "completed", label: "Completed" },
                        { value: "processing", label: "Processing" },
                        { value: "failed", label: "Failed" }
                      ]}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date From</label>
                    <Input
                      type="date"
                      value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        setFilters(prev => ({ ...prev, dateFrom: date }));
                      }}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date To</label>
                    <Input
                      type="date"
                      value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        setFilters(prev => ({ ...prev, dateTo: date }));
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reports List */}
            <div className="space-y-4">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-64" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-10 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredReports.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
                    <p className="text-gray-600">No reports match your current filters. Try adjusting your search criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getReportIcon(report.type)}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-gray-900">{report.title}</h3>
                              {getStatusBadge(report.status)}
                            </div>
                            <p className="text-gray-600 text-sm">{report.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Generated: {new Date(report.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              {report.recordCount > 0 && (
                                <span>{report.recordCount.toLocaleString()} records</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {report.status === 'completed' && (
                            <>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              <Button 
                                onClick={() => downloadReport(report)}
                                size="sm"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </>
                          )}
                          {report.status === 'processing' && (
                            <div className="flex items-center gap-2 text-yellow-600">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                              <span className="text-sm">Processing...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Generate New Report Tab */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  type: 'users',
                  title: 'User Report',
                  description: 'Generate comprehensive user registration and activity report',
                  icon: Users,
                  color: 'blue'
                },
                {
                  type: 'orders',
                  title: 'Sales Report',
                  description: 'Export detailed sales data and order analytics',
                  icon: ShoppingCart,
                  color: 'green'
                },
                {
                  type: 'appointments',
                  title: 'Appointment Report',
                  description: 'Analyze appointment trends and optometrist performance',
                  icon: Stethoscope,
                  color: 'purple'
                },
                {
                  type: 'revenue',
                  title: 'Revenue Report',
                  description: 'Financial performance and revenue analysis',
                  icon: TrendingUp,
                  color: 'orange'
                },
                {
                  type: 'reviews',
                  title: 'Review Report',
                  description: 'Customer feedback and rating analytics',
                  icon: Star,
                  color: 'yellow'
                }
              ].map((reportType) => {
                const Icon = reportType.icon;
                const isGenerating = generating === reportType.type;
                
                return (
                  <Card key={reportType.type} className={`hover:shadow-md transition-all cursor-pointer border-2 hover:border-${reportType.color}-200`}>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className={`p-4 bg-${reportType.color}-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center`}>
                          <Icon className={`w-8 h-8 text-${reportType.color}-600`} />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">{reportType.title}</h3>
                          <p className="text-gray-600 text-sm mb-4">{reportType.description}</p>
                        </div>
                        
                        <Button 
                          onClick={() => generateReport(reportType.type)}
                          disabled={isGenerating}
                          className="w-full"
                        >
                          {isGenerating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Generate Report
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;