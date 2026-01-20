'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import withdrawService, { WithdrawRequest, WithdrawStatus } from '@/services/withdrawService';
import WithdrawRequestDetailModal from '@/components/modals/WithdrawRequestDetailModal';
import { Search, Wallet, Clock, CheckCircle, XCircle, TrendingUp, DollarSign } from 'lucide-react';

const statusConfig: Record<WithdrawStatus, {
    bg: string;
    text: string;
    icon: React.ReactNode;
    gradient: [string, string];
    label: string;
}> = {
    PENDING: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        icon: <Clock className="h-4 w-4" />,
        gradient: ['#FEF3C7', '#FDE68A'],
        label: 'Menunggu Review'
    },
    APPROVED: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        icon: <CheckCircle className="h-4 w-4" />,
        gradient: ['#DBEAFE', '#BFDBFE'],
        label: 'Disetujui'
    },
    PAID: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        icon: <CheckCircle className="h-4 w-4" />,
        gradient: ['#D1FAE5', '#A7F3D0'],
        label: 'Selesai'
    },
    REJECTED: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        icon: <XCircle className="h-4 w-4" />,
        gradient: ['#FEE2E2', '#FECACA'],
        label: 'Ditolak'
    },
};

export default function WithdrawRequestsPage() {
    const [requests, setRequests] = useState<WithdrawRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<WithdrawRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | WithdrawStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await withdrawService.getWithdrawRequests();
            setRequests(response.data);
            setFilteredRequests(response.data);
        } catch (err: any) {
            setError(err.message || ' Failed to fetch withdrawal requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        let filtered = requests;

        // Filter by status tab
        if (activeTab !== 'all') {
            filtered = filtered.filter(req => req.status === activeTab);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(req =>
                req.optometrist.name.toLowerCase().includes(query) ||
                req.optometrist.email.toLowerCase().includes(query) ||
                req.bank_account_name.toLowerCase().includes(query)
            );
        }

        setFilteredRequests(filtered);
    }, [activeTab, searchQuery, requests]);

    const handleRowClick = (request: WithdrawRequest) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const handleRequestUpdated = () => {
        fetchRequests(); // Refresh data
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Calculate stats
    const stats = {
        total: requests.reduce((sum, r) => sum + Number(r.amount), 0),
        pending: requests.filter(r => r.status === 'PENDING').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
        paid: requests.filter(r => r.status === 'PAID').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length,
    };

    const tabs: Array<{ key: 'all' | WithdrawStatus; label: string; count: number }> = [
        { key: 'all', label: 'Semua', count: requests.length },
        { key: 'PENDING', label: 'Pending', count: stats.pending },
        { key: 'APPROVED', label: 'Disetujui', count: stats.approved },
        { key: 'PAID', label: 'Selesai', count: stats.paid },
        { key: 'REJECTED', label: 'Ditolak', count: stats.rejected },
    ];

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            Penarikan Dana
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Kelola permintaan penarikan komisi optometris
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Penarikan
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(stats.total)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Dari {requests.length} permintaan
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Menunggu
                                </CardTitle>
                                <Clock className="h-4 w-4 text-amber-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Perlu direview
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Disetujui
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Siap transfer
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Selesai
                                </CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Sudah dibayar
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Permintaan Penarikan</CardTitle>
                        <CardDescription>
                            Menampilkan {filteredRequests.length} dari {requests.length} permintaan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="space-y-4 mb-6">
                            {/* Tab Filters */}
                            <div className="flex flex-wrap gap-2">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`
                                            px-4 py-2 rounded-lg font-medium text-sm transition-all
                                            ${activeTab === tab.key
                                                ? 'bg-linear-to-r from-blue-600 to-green-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }
                                        `}
                                    >
                                        {tab.label}
                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan nama optometris, email, atau nama pemilik rekening..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                                    <Wallet className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                                <p className="text-red-800 font-medium">{error}</p>
                                <button
                                    onClick={fetchRequests}
                                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                                <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium text-lg">Tidak ada permintaan penarikan dana</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {activeTab !== 'all' ? `Tidak ada transaksi dengan status ${statusConfig[activeTab]?.label}` : 'Permintaan akan muncul di sini'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredRequests.map((request) => {
                                    const config = statusConfig[request.status];
                                    return (
                                        <div
                                            key={request.id}
                                            onClick={() => handleRowClick(request)}
                                            className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-blue-200 cursor-pointer transition-all duration-200"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                {/* Left Section */}
                                                <div className="flex items-start gap-4 flex-1">
                                                    {/* Avatar */}
                                                    <div className="shrink-0">
                                                        <div className="h-12 w-12 rounded-xl bg-linear-to-br from-blue-100 to-green-100 flex items-center justify-center ring-2 ring-white shadow-sm">
                                                            <span className="text-blue-700 font-bold text-lg">
                                                                {request.optometrist.name.charAt(0)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                {request.optometrist.name}
                                                            </h3>
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                                                                {config.icon}
                                                                {config.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mb-2">{request.optometrist.email}</p>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                                                            <div className="flex items-center gap-1.5">
                                                                <Wallet className="h-3.5 w-3.5 text-gray-400" />
                                                                <span className="font-semibold text-blue-600">
                                                                    {formatCurrency(Number(request.amount))}
                                                                </span>
                                                            </div>
                                                            <div className="text-gray-300">•</div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-gray-500">{request.bank_name}</span>
                                                                <span className="text-gray-400">•</span>
                                                                <span className="font-mono text-xs">{request.bank_account_number}</span>
                                                            </div>
                                                            <div className="text-gray-300">•</div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                                <span>{formatDate(request.requested_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Section - Arrow */}
                                                <div className="shrink-0 self-center">
                                                    <div className="h-8 w-8 rounded-lg bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                                                        <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Detail Modal */}
                {isModalOpen && selectedRequest && (
                    <WithdrawRequestDetailModal
                        request={selectedRequest}
                        onClose={handleModalClose}
                        onRequestUpdated={handleRequestUpdated}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
