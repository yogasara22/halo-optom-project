import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Animated,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import walletService, { WithdrawRequest, WithdrawStatus } from '../../services/walletService';

const statusConfig: Record<WithdrawStatus, {
    color: string;
    lightColor: string;
    icon: string;
    label: string;
    gradient: readonly [string, string];
}> = {
    PENDING: {
        color: '#f59e0b',
        lightColor: '#fef3c7',
        icon: 'hourglass-outline',
        label: 'Menunggu Review',
        gradient: ['#fbbf24', '#f59e0b'] as const,
    },
    APPROVED: {
        color: '#3b82f6',
        lightColor: '#dbeafe',
        icon: 'checkmark-circle',
        label: 'Disetujui',
        gradient: ['#60a5fa', '#3b82f6'] as const,
    },
    PAID: {
        color: '#10b981',
        lightColor: '#d1fae5',
        icon: 'checkmark-done-circle',
        label: 'Dana Diterima',
        gradient: ['#34d399', '#10b981'] as const,
    },
    REJECTED: {
        color: '#ef4444',
        lightColor: '#fee2e2',
        icon: 'close-circle',
        label: 'Ditolak',
        gradient: ['#f87171', '#ef4444'] as const,
    },
};

export default function WithdrawHistoryScreen() {
    const router = useRouter();
    const [requests, setRequests] = useState<WithdrawRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | WithdrawStatus>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const data = await walletService.getWithdrawHistory();
            setRequests(data.sort((a, b) =>
                new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
            ));
        } catch (error: any) {
            console.error('Failed to fetch withdrawal history:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hari ini';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Kemarin';
        } else {
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const filteredRequests =
        filter === 'all' ? requests : requests.filter((r) => r.status === filter);

    const stats = {
        total: requests.reduce((sum, r) => sum + Number(r.amount), 0),
        pending: requests.filter(r => r.status === 'PENDING').length,
        paid: requests.filter(r => r.status === 'PAID').length,
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.centerContainer}>
                    <View style={styles.loadingIconContainer}>
                        <LinearGradient
                            colors={['#16a34a', '#15803d']}
                            style={styles.loadingGradient}
                        >
                            <ActivityIndicator size="large" color="#fff" />
                        </LinearGradient>
                    </View>
                    <Text style={styles.loadingText}>Memuat riwayat...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Modern Header with Gradient */}
            <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={22} color="#1e293b" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Riwayat Penarikan</Text>
                        <Text style={styles.headerSubtitle}>
                            {requests.length} transaksi • {formatCurrency(stats.total)}
                        </Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#fef3c7' }]}>
                            <Ionicons name="hourglass-outline" size={18} color="#f59e0b" />
                        </View>
                        <Text style={styles.statValue}>{stats.pending}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#d1fae5' }]}>
                            <Ionicons name="checkmark-done-circle" size={18} color="#10b981" />
                        </View>
                        <Text style={styles.statValue}>{stats.paid}</Text>
                        <Text style={styles.statLabel}>Selesai</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Elegant Filter Pills */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={styles.filterContent}
            >
                {[
                    { key: 'all' as const, label: 'Semua', icon: 'list' },
                    { key: 'PENDING' as const, label: 'Menunggu', icon: 'time' },
                    { key: 'APPROVED' as const, label: 'Disetujui', icon: 'checkmark-circle' },
                    { key: 'PAID' as const, label: 'Selesai', icon: 'checkmark-done' },
                    { key: 'REJECTED' as const, label: 'Ditolak', icon: 'close-circle' },
                ].map((tab) => {
                    const isActive = filter === tab.key;
                    const count = tab.key === 'all'
                        ? requests.length
                        : requests.filter(r => r.status === tab.key).length;

                    return (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setFilter(tab.key)}
                            activeOpacity={0.7}
                        >
                            {isActive ? (
                                <LinearGradient
                                    colors={['#16a34a', '#15803d'] as const}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.filterPillGradient}
                                >
                                    <Ionicons name={tab.icon as any} size={16} color="#fff" />
                                    <Text style={styles.filterPillTextActive}>{tab.label}</Text>
                                    {count > 0 && (
                                        <View style={styles.filterPillBadge}>
                                            <Text style={styles.filterPillBadgeText}>{count}</Text>
                                        </View>
                                    )}
                                </LinearGradient>
                            ) : (
                                <View style={styles.filterPill}>
                                    <Ionicons name={tab.icon as any} size={16} color="#64748b" />
                                    <Text style={styles.filterPillText}>{tab.label}</Text>
                                    {count > 0 && (
                                        <View style={styles.filterPillBadgeInactive}>
                                            <Text style={styles.filterPillBadgeTextInactive}>{count}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Transaction List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />
                }
                showsVerticalScrollIndicator={false}
            >
                {filteredRequests.length === 0 ? (
                    <View style={styles.emptyState}>
                        <LinearGradient
                            colors={['#f1f5f9', '#e2e8f0']}
                            style={styles.emptyIconGradient}
                        >
                            <Ionicons name="wallet-outline" size={40} color="#94a3b8" />
                        </LinearGradient>
                        <Text style={styles.emptyTitle}>Belum Ada Transaksi</Text>
                        <Text style={styles.emptySubtitle}>
                            {filter === 'all'
                                ? 'Riwayat penarikan Anda akan muncul di sini'
                                : `Tidak ada transaksi ${statusConfig[filter as WithdrawStatus]?.label.toLowerCase()} `
                            }
                        </Text>
                    </View>
                ) : (
                    filteredRequests.map((request, index) => {
                        const config = statusConfig[request.status];
                        const isExpanded = expandedId === request.id;

                        return (
                            <TouchableOpacity
                                key={request.id}
                                style={[styles.transactionCard, index === 0 && styles.firstCard]}
                                onPress={() => setExpandedId(isExpanded ? null : request.id)}
                                activeOpacity={0.95}
                            >
                                {/* Card Top Section */}
                                <View style={styles.cardTop}>
                                    <View style={styles.cardLeft}>
                                        <LinearGradient
                                            colors={config.gradient}
                                            style={styles.cardIconGradient}
                                        >
                                            <Ionicons name={config.icon as any} size={24} color="#fff" />
                                        </LinearGradient>
                                        <View style={styles.cardInfo}>
                                            <Text style={styles.cardAmount}>{formatCurrency(Number(request.amount))}</Text>
                                            <Text style={styles.cardDate}>
                                                {formatDate(request.requested_at)} • {formatTime(request.requested_at)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.cardRight}>
                                        <View style={[styles.modernBadge, { backgroundColor: config.lightColor }]}>
                                            <View style={[styles.badgeDot, { backgroundColor: config.color }]} />
                                            <Text style={[styles.modernBadgeText, { color: config.color }]}>
                                                {config.label}
                                            </Text>
                                        </View>
                                        <Ionicons
                                            name={isExpanded ? "chevron-up" : "chevron-down"}
                                            size={20}
                                            color="#cbd5e1"
                                            style={{ marginTop: 4 }}
                                        />
                                    </View>
                                </View>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <View style={styles.expandedSection}>
                                        <View style={styles.elegantDivider}>
                                            <View style={styles.dividerLine} />
                                        </View>

                                        {/* Bank Details Card */}
                                        <View style={styles.detailCard}>
                                            <View style={styles.detailHeader}>
                                                <Ionicons name="business" size={16} color="#64748b" />
                                                <Text style={styles.detailHeaderText}>Informasi Bank</Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>Bank</Text>
                                                <Text style={styles.detailValue}>{request.bank_name}</Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>No. Rekening</Text>
                                                <Text style={[styles.detailValue, styles.monoFont]}>{request.bank_account_number}</Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>Atas Nama</Text>
                                                <Text style={styles.detailValue}>{request.bank_account_name}</Text>
                                            </View>
                                        </View>

                                        {/* Timeline (if reviewed) */}
                                        {request.reviewed_at && (
                                            <View style={styles.detailCard}>
                                                <View style={styles.detailHeader}>
                                                    <Ionicons name="time" size={16} color="#64748b" />
                                                    <Text style={styles.detailHeaderText}>Timeline</Text>
                                                </View>
                                                <View style={styles.timeline}>
                                                    <View style={styles.timelineItem}>
                                                        <View style={styles.timelineDotContainer}>
                                                            <View style={[styles.timelineDot, { backgroundColor: '#10b981' }]} />
                                                            <View style={styles.timelineLine} />
                                                        </View>
                                                        <View style={styles.timelineContent}>
                                                            <Text style={styles.timelineTitle}>Pengajuan</Text>
                                                            <Text style={styles.timelineTime}>
                                                                {formatDate(request.requested_at)} • {formatTime(request.requested_at)}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View style={styles.timelineItem}>
                                                        <View style={styles.timelineDotContainer}>
                                                            <View style={[styles.timelineDot, { backgroundColor: config.color }]} />
                                                        </View>
                                                        <View style={styles.timelineContent}>
                                                            <Text style={styles.timelineTitle}>Review Admin</Text>
                                                            <Text style={styles.timelineTime}>
                                                                {formatDate(request.reviewed_at)} • {formatTime(request.reviewed_at)}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        )}

                                        {/* Note/Reason */}
                                        {request.note && (
                                            <View style={[styles.noteCard, { backgroundColor: config.lightColor }]}>
                                                <View style={styles.noteHeader}>
                                                    <View style={[styles.noteIconContainer, { backgroundColor: config.color }]}>
                                                        <Ionicons name="chatbox-ellipses" size={14} color="#fff" />
                                                    </View>
                                                    <Text style={[styles.noteTitle, { color: config.color }]}>
                                                        {request.status === 'REJECTED' ? 'Alasan Penolakan' : 'Catatan Admin'}
                                                    </Text>
                                                </View>
                                                <Text style={[styles.noteMessage, { color: config.color }]}>{request.note}</Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingIconContainer: {
        marginBottom: 20,
    },
    loadingGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 15,
        color: '#64748b',
        fontWeight: '500',
    },
    headerGradient: {
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#f1f5f9',
        marginHorizontal: 16,
    },
    filterScroll: {
        maxHeight: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    filterContent: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        backgroundColor: '#f8fafc',
        gap: 6,
    },
    filterPillGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        gap: 6,
    },
    filterPillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    filterPillTextActive: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    filterPillBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 22,
        alignItems: 'center',
    },
    filterPillBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#fff',
    },
    filterPillBadgeInactive: {
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 22,
        alignItems: 'center',
    },
    filterPillBadgeTextInactive: {
        fontSize: 11,
        fontWeight: '800',
        color: '#64748b',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyIconGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 20,
    },
    transactionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    firstCard: {
        marginTop: 4,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 14,
    },
    cardIconGradient: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    cardAmount: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    cardDate: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    cardRight: {
        alignItems: 'flex-end',
    },
    modernBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    badgeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    modernBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    expandedSection: {
        marginTop: 20,
    },
    elegantDivider: {
        marginBottom: 16,
    },
    dividerLine: {
        height: 1,
        backgroundColor: '#f1f5f9',
    },
    detailCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    detailHeaderText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#0f172a',
        fontWeight: '700',
        maxWidth: '60%',
        textAlign: 'right',
    },
    monoFont: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    timeline: {
        gap: 0,
    },
    timelineItem: {
        flexDirection: 'row',
        gap: 12,
    },
    timelineDotContainer: {
        alignItems: 'center',
        width: 20,
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 4,
    },
    timelineContent: {
        flex: 1,
        paddingBottom: 16,
    },
    timelineTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    timelineTime: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    noteCard: {
        borderRadius: 16,
        padding: 16,
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    noteIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noteTitle: {
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    noteMessage: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
    },
});
