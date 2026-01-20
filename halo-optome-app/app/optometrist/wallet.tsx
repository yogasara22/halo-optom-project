import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import walletService, { WalletBalance, WithdrawRequest, WithdrawStatus } from '../../services/walletService';

const statusColors: Record<WithdrawStatus, { bg: string; text: string; icon: string }> = {
    PENDING: { bg: '#FEF3C7', text: '#92400E', icon: '🟡' },
    APPROVED: { bg: '#DBEAFE', text: '#1E40AF', icon: '🔵' },
    PAID: { bg: '#D1FAE5', text: '#065F46', icon: '🟢' },
    REJECTED: { bg: '#FEE2E2', text: '#991B1B', icon: '🔴' },
};

export default function WalletScreen() {
    const router = useRouter();
    const [balance, setBalance] = useState<WalletBalance | null>(null);
    const [requests, setRequests] = useState<WithdrawRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [balanceData, requestsData] = await Promise.all([
                walletService.getBalance(),
                walletService.getWithdrawHistory(),
            ]);
            setBalance(balanceData);
            setRequests(requestsData);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Gagal memuat data wallet');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleWithdrawPress = () => {
        router.push('/optometrist/withdrawForm');
    };

    const handleHistoryPress = () => {
        router.push('/optometrist/withdrawHistory');
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.content}>
                <Text style={styles.title}>Wallet Saya</Text>

                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Saldo Tersedia</Text>
                    <Text style={styles.balanceAmount}>
                        {balance?.formatted_balance || 'Rp 0'}
                    </Text>
                    {balance && balance.hold_balance > 0 && (
                        <View style={styles.holdBalanceContainer}>
                            <Text style={styles.holdBalanceLabel}>Saldo Ditahan</Text>
                            <Text style={styles.holdBalanceAmount}>
                                {balance.formatted_hold_balance}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Withdraw Button */}
                <TouchableOpacity
                    style={styles.withdrawButton}
                    onPress={handleWithdrawPress}
                >
                    <Text style={styles.withdrawButtonText}>💰 Tarik Saldo</Text>
                </TouchableOpacity>

                {/* Recent Withdrawals */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Riwayat Penarikan Terbaru</Text>
                        <TouchableOpacity onPress={handleHistoryPress}>
                            <Text style={styles.seeAllText}>Lihat Semua →</Text>
                        </TouchableOpacity>
                    </View>

                    {requests.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                Belum ada riwayat penarikan
                            </Text>
                        </View>
                    ) : (
                        requests.slice(0, 5).map((request) => {
                            const statusStyle = statusColors[request.status];
                            return (
                                <View key={request.id} style={styles.requestCard}>
                                    <View style={styles.requestHeader}>
                                        <View
                                            style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
                                        >
                                            <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                                {statusStyle.icon} {request.status}
                                            </Text>
                                        </View>
                                        <Text style={styles.requestDate}>
                                            {formatDate(request.requested_at)}
                                        </Text>
                                    </View>

                                    <Text style={styles.requestAmount}>
                                        Rp {Number(request.amount).toLocaleString('id-ID')}
                                    </Text>

                                    <View style={styles.bankInfo}>
                                        <Text style={styles.bankLabel}>Bank:</Text>
                                        <Text style={styles.bankName}>{request.bank_name}</Text>
                                    </View>

                                    {request.note && (
                                        <View style={styles.noteContainer}>
                                            <Text style={styles.noteLabel}>Catatan:</Text>
                                            <Text style={styles.noteText}>{request.note}</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 20,
    },
    balanceCard: {
        backgroundColor: '#3B82F6',
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#DBEAFE',
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    holdBalanceContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#60A5FA',
    },
    holdBalanceLabel: {
        fontSize: 12,
        color: '#DBEAFE',
        marginBottom: 4,
    },
    holdBalanceAmount: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FEF3C7',
    },
    withdrawButton: {
        backgroundColor: '#10B981',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    withdrawButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
    },
    seeAllText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
    },
    emptyState: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6B7280',
    },
    requestCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    requestDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    requestAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    bankInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bankLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginRight: 6,
    },
    bankName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    noteContainer: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
    },
    noteLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#92400E',
        marginBottom: 4,
    },
    noteText: {
        fontSize: 12,
        color: '#78350F',
    },
});
