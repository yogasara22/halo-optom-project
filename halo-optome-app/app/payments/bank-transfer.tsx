import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getActiveBankAccounts, BankAccount } from '../../services/bankAccountService';
import { createBankTransferPayment } from '../../services/paymentService';

export default function BankTransferScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const appointmentId = params.id as string;
    const amount = params.amount as string;

    const [loading, setLoading] = useState(true);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [payment, setPayment] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        initializePayment();
    }, []);

    const initializePayment = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch active bank accounts
            const accounts = await getActiveBankAccounts();
            setBankAccounts(accounts);

            // Create bank transfer payment
            const paymentData = await createBankTransferPayment(appointmentId);
            setPayment(paymentData);
        } catch (e: any) {
            setError(e?.message || 'Gagal memuat data pembayaran');
            Alert.alert('Error', e?.message || 'Gagal memuat data pembayaran');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getDeadlineCountdown = () => {
        if (!payment?.payment_deadline) return '';

        const deadline = new Date(payment.payment_deadline);
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (diff < 0) return 'Waktu Habis';
        return `${hours} jam ${minutes} menit`;
    };

    const handleUploadProof = () => {
        router.push({
            pathname: '/payments/upload-proof',
            params: { payment_id: payment?.id }
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1876B8" />
                    <Text style={styles.loadingText}>Memuat data pembayaran...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Transfer Bank</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text style={styles.errorTitle}>Terjadi Kesalahan</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity onPress={initializePayment} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Coba Lagi</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transfer Bank Manual</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
                {/* Payment Deadline */}
                <View style={styles.deadlineCard}>
                    <Ionicons name="time-outline" size={24} color="#f59e0b" />
                    <View style={styles.deadlineContent}>
                        <Text style={styles.deadlineTitle}>Batas Waktu Pembayaran</Text>
                        <Text style={styles.deadlineTime}>{getDeadlineCountdown()}</Text>
                    </View>
                </View>

                {/* Amount Card */}
                <View style={styles.amountCard}>
                    <Text style={styles.amountLabel}>Total Pembayaran</Text>
                    <Text style={styles.amountValue}>{formatCurrency(payment?.amount || parseFloat(amount))}</Text>
                    <View style={styles.uniqueCodeWarning}>
                        <Ionicons name="alert-circle" size={16} color="#d97706" />
                        <Text style={styles.uniqueCodeText}>
                            PENTING: Mohon transfer TEPAT sampai 3 digit terakhir agar verifikasi berjalan lancar.
                        </Text>
                    </View>
                </View>

                {/* Instructions */}
                <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsTitle}>Cara Pembayaran</Text>
                    <View style={styles.instructionStep}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <Text style={styles.stepText}>Pilih salah satu rekening bank di bawah</Text>
                    </View>
                    <View style={styles.instructionStep}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <Text style={styles.stepText}>Transfer sesuai nominal yang tertera (termasuk 3 digit terakhir)</Text>
                    </View>
                    <View style={styles.instructionStep}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <Text style={styles.stepText}>Upload bukti transfer</Text>
                    </View>
                    <View style={styles.instructionStep}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>4</Text>
                        </View>
                        <Text style={styles.stepText}>Tunggu verifikasi dari admin (maks 1x24 jam)</Text>
                    </View>
                </View>

                {/* Bank Accounts */}
                <Text style={styles.sectionTitle}>Pilih Rekening Tujuan</Text>
                {bankAccounts.map((account) => (
                    <View key={account.id} style={styles.bankCard}>
                        <View style={styles.bankHeader}>
                            <View style={styles.bankIconContainer}>
                                <Ionicons name="business" size={24} color="#1876B8" />
                            </View>
                            <Text style={styles.bankName}>{account.bank_name}</Text>
                        </View>
                        <View style={styles.bankDetails}>
                            <View style={styles.bankRow}>
                                <Text style={styles.bankLabel}>No. Rekening</Text>
                                <Text style={styles.bankValue}>{account.account_number}</Text>
                            </View>
                            <View style={styles.bankRow}>
                                <Text style={styles.bankLabel}>Atas Nama</Text>
                                <Text style={styles.bankValue}>{account.account_holder_name}</Text>
                            </View>
                            {account.branch && (
                                <View style={styles.bankRow}>
                                    <Text style={styles.bankLabel}>Cabang</Text>
                                    <Text style={styles.bankValue}>{account.branch}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                ))}

                {bankAccounts.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="business-outline" size={48} color="#94a3b8" />
                        <Text style={styles.emptyText}>Belum ada rekening bank tersedia</Text>
                    </View>
                )}
            </ScrollView>

            {/* Upload Proof Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={handleUploadProof}
                    style={styles.uploadButton}
                    disabled={bankAccounts.length === 0}
                >
                    <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                    <Text style={styles.uploadButtonText}>Upload Bukti Transfer</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f172a',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0f172a',
        marginTop: 16,
    },
    errorMessage: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 8,
    },
    retryButton: {
        marginTop: 24,
        backgroundColor: '#1876B8',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    deadlineCard: {
        backgroundColor: '#fef3c7',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#fbbf24',
    },
    deadlineContent: {
        marginLeft: 12,
        flex: 1,
    },
    deadlineTitle: {
        fontSize: 14,
        color: '#92400e',
        marginBottom: 4,
    },
    deadlineTime: {
        fontSize: 18,
        fontWeight: '700',
        color: '#92400e',
    },
    amountCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    amountLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8,
    },
    amountValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1876B8',
    },
    uniqueCodeWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
        padding: 8,
        borderRadius: 8,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#fcd34d',
    },
    uniqueCodeText: {
        marginLeft: 8,
        fontSize: 12,
        color: '#b45309',
        flex: 1,
        fontWeight: '500',
    },
    instructionsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 12,
    },
    instructionStep: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#1876B8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    stepText: {
        flex: 1,
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        paddingTop: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 12,
    },
    bankCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        paddingBottom: 24, // Added extra bottom padding
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    bankHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    bankIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0f2fe',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bankName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    bankDetails: {
        gap: 8,
    },
    bankRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bankLabel: {
        fontSize: 13,
        color: '#64748b',
    },
    bankValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
    },
    emptyState: {
        paddingVertical: 48,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#94a3b8',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    uploadButton: {
        backgroundColor: '#1876B8',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#1876B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
