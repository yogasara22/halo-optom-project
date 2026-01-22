import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getPaymentById } from '../../services/paymentService';
import { API_BASE_URL } from '../../constants/config';

export default function PaymentPendingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const paymentId = params.payment_id as string;

    const [loading, setLoading] = useState(true);
    const [payment, setPayment] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Helper to fix localhost URLs for Android/iOS
    const fixImageUrl = (url: string) => {
        if (!url) return '';

        // If it's already a regular http/https url avoiding localhost, return it
        if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
            return url;
        }

        // Get the base URL host (removing /api if present)
        const baseUrlHost = API_BASE_URL.replace(/\/api$/, '');

        // Replace localhost/127.0.0.1 with the configured API_BASE_URL host
        // Regex handles http://localhost:PORT or http://127.0.0.1:PORT
        return url.replace(/http:\/\/(localhost|127\.0\.0\.1):\d+/, baseUrlHost);
    };

    useEffect(() => {
        fetchPaymentDetails();

        // Poll for payment status every 30 seconds
        const interval = setInterval(fetchPaymentDetails, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchPaymentDetails = async () => {
        try {
            const paymentData = await getPaymentById(paymentId);
            console.log('💳 Payment data fetched:', {
                id: paymentData.id,
                status: paymentData.status,
                hasProofUrl: !!paymentData.payment_proof_url,
                proofUrl: paymentData.payment_proof_url
            });
            setPayment(paymentData);

            // If payment is verified, redirect to success
            if (paymentData.status === 'verified' || paymentData.status === 'paid') {
                router.replace('/appointments/success');
            }
        } catch (e: any) {
            setError(e?.message || 'Gagal memuat data pembayaran');
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

    const getStatusInfo = () => {
        if (!payment) return { color: '#f59e0b', text: 'Pending', icon: 'time-outline' };

        switch (payment.status) {
            case 'waiting_verification':
                return { color: '#f59e0b', text: 'Menunggu Verifikasi', icon: 'time-outline' };
            case 'verified':
            case 'paid':
                return { color: '#16a34a', text: 'Terverifikasi', icon: 'checkmark-circle' };
            case 'rejected':
                return { color: '#ef4444', text: 'Ditolak', icon: 'close-circle' };
            case 'expired':
                return { color: '#64748b', text: 'Kedaluwarsa', icon: 'alert-circle' };
            default:
                return { color: '#f59e0b', text: 'Pending', icon: 'time-outline' };
        }
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
                    <Text style={styles.headerTitle}>Status Pembayaran</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statusInfo = getStatusInfo();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/appointments')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Status Pembayaran</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Status Card */}
                <View style={[styles.statusCard, { backgroundColor: `${statusInfo.color}15` }]}>
                    <Ionicons name={statusInfo.icon as any} size={48} color={statusInfo.color} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                    {payment.status === 'waiting_verification' && (
                        <Text style={styles.statusSubtext}>
                            Pembayaran Anda sedang diverifikasi oleh admin
                        </Text>
                    )}
                    {payment.status === 'rejected' && payment.rejection_reason && (
                        <View style={styles.rejectionBox}>
                            <Text style={styles.rejectionLabel}>Alasan Penolakan:</Text>
                            <Text style={styles.rejectionText}>{payment.rejection_reason}</Text>
                        </View>
                    )}
                </View>

                {/* Deadline Card */}
                {payment.status === 'waiting_verification' && (
                    <View style={styles.deadlineCard}>
                        <Ionicons name="time-outline" size={24} color="#f59e0b" />
                        <View style={styles.deadlineContent}>
                            <Text style={styles.deadlineTitle}>Batas Waktu Verifikasi</Text>
                            <Text style={styles.deadlineTime}>{getDeadlineCountdown()}</Text>
                        </View>
                    </View>
                )}

                {/* Payment Details */}
                <View style={styles.detailsCard}>
                    <Text style={styles.detailsTitle}>Detail Pembayaran</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>ID Pembayaran</Text>
                        <Text style={styles.detailValue}>{payment.id.substring(0, 8)}...</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Jumlah</Text>
                        <Text style={styles.detailValue}>{formatCurrency(payment.amount)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Metode</Text>
                        <Text style={styles.detailValue}>Transfer Bank Manual</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Tanggal Upload</Text>
                        <Text style={styles.detailValue}>
                            {new Date(payment.created_at).toLocaleString('id-ID')}
                        </Text>
                    </View>
                </View>

                {/* Payment Proof */}
                {payment.payment_proof_url && (
                    <View style={styles.proofCard}>
                        <Text style={styles.proofTitle}>Bukti Transfer</Text>
                        <Image
                            source={{ uri: fixImageUrl(payment.payment_proof_url) }}
                            style={styles.proofImage}
                            resizeMode="contain"
                            onLoadStart={() => {
                                console.log('🖼️ Loading payment proof image:', fixImageUrl(payment.payment_proof_url));
                            }}
                            onLoad={() => {
                                console.log('✅ Payment proof image loaded successfully');
                            }}
                            onError={(error) => {
                                console.error('❌ Failed to load payment proof image:', {
                                    originalUrl: payment.payment_proof_url,
                                    fixedUrl: fixImageUrl(payment.payment_proof_url),
                                    error: error.nativeEvent.error
                                });
                            }}
                        />
                        <Text style={styles.imageUrlDebug}>
                            URL: {fixImageUrl(payment.payment_proof_url)}
                        </Text>
                    </View>
                )}

                {/* Info Messages */}
                {payment.status === 'waiting_verification' && (
                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle" size={20} color="#1876B8" />
                        <Text style={styles.infoText}>
                            Admin kami akan memverifikasi pembayaran Anda dalam waktu maksimal 1x24 jam.
                            Anda akan menerima notifikasi setelah pembayaran diverifikasi.
                        </Text>
                    </View>
                )}

                {payment.status === 'rejected' && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            onPress={() => router.push({
                                pathname: '/payments/upload-proof',
                                params: { payment_id: paymentId }
                            })}
                            style={styles.retryButton}
                        >
                            <Text style={styles.retryButtonText}>Upload Ulang Bukti</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {payment.status === 'verified' && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={() => router.push('/appointments')}
                        style={styles.doneButton}
                    >
                        <Text style={styles.doneButtonText}>Lihat Appointment</Text>
                    </TouchableOpacity>
                </View>
            )}
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
    errorText: {
        marginTop: 16,
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    statusCard: {
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
    },
    statusText: {
        marginTop: 12,
        fontSize: 24,
        fontWeight: '700',
    },
    statusSubtext: {
        marginTop: 8,
        fontSize: 14,
        color: '#475569',
        textAlign: 'center',
    },
    rejectionBox: {
        marginTop: 16,
        width: '100%',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    rejectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 4,
    },
    rejectionText: {
        fontSize: 14,
        color: '#0f172a',
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
    detailsCard: {
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
    detailsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
    },
    proofCard: {
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
    proofTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 12,
    },
    proofImage: {
        width: '100%',
        height: 300,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
    },
    imageUrlDebug: {
        marginTop: 8,
        fontSize: 10,
        color: '#64748b',
        fontFamily: 'monospace',
    },
    infoCard: {
        backgroundColor: '#e0f2fe',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#7dd3fc',
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 13,
        color: '#0c4a6e',
        lineHeight: 18,
    },
    actionButtons: {
        marginTop: 8,
    },
    retryButton: {
        backgroundColor: '#1876B8',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    doneButton: {
        backgroundColor: '#16a34a',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
