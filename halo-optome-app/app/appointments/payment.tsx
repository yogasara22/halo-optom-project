import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { createPaymentInvoice, PaymentInvoice } from '../../services/paymentService';

export default function PaymentScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const appointmentId = params.id as string;
    const webViewRef = useRef<WebView>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentData, setPaymentData] = useState<PaymentInvoice | null>(null);
    const [webViewLoading, setWebViewLoading] = useState(false);
    const [showWebView, setShowWebView] = useState(false);

    useEffect(() => {
        if (!appointmentId) {
            setError('ID Appointment tidak ditemukan');
            setLoading(false);
            return;
        }

        loadPaymentInvoice();
    }, [appointmentId]);

    // Handle hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (showWebView) {
                handleBackFromWebView();
                return true;
            }
            return false;
        });

        return () => backHandler.remove();
    }, [showWebView]);

    const loadPaymentInvoice = async () => {
        try {
            setLoading(true);
            setError(null);
            const invoice = await createPaymentInvoice(appointmentId);
            setPaymentData(invoice);
        } catch (e: any) {
            setError(e?.message || 'Gagal memuat data pembayaran');
        } finally {
            setLoading(false);
        }
    };

    const handlePayNow = () => {
        if (!paymentData?.invoice_url) {
            Alert.alert('Error', 'URL pembayaran tidak ditemukan');
            return;
        }
        setShowWebView(true);
    };

    const handleBackFromWebView = () => {
        Alert.alert(
            'Batalkan Pembayaran?',
            'Apakah Anda yakin ingin kembali? Pembayaran belum selesai.',
            [
                { text: 'Lanjut Bayar', style: 'cancel' },
                {
                    text: 'Ya, Kembali',
                    onPress: () => setShowWebView(false),
                    style: 'destructive'
                }
            ]
        );
    };

    const handleWebViewNavigationStateChange = (navState: any) => {
        const { url } = navState;

        // Check if payment was successful or failed based on URL
        if (url.includes('payment/success') || url.includes('success')) {
            setShowWebView(false);
            router.replace('/appointments/success');
        } else if (url.includes('payment/failed') || url.includes('failure')) {
            setShowWebView(false);
            Alert.alert(
                'Pembayaran Gagal',
                'Pembayaran Anda tidak berhasil diproses. Silakan coba lagi.',
                [{ text: 'OK' }]
            );
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Show WebView when payment is initiated
    if (showWebView && paymentData?.invoice_url) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.webViewHeader}>
                    <TouchableOpacity onPress={handleBackFromWebView} style={styles.backButton}>
                        <Ionicons name="close" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.webViewHeaderTitle}>Pembayaran</Text>
                    <View style={{ width: 24 }} />
                </View>

                {webViewLoading && (
                    <View style={styles.webViewLoadingContainer}>
                        <ActivityIndicator size="large" color="#1876B8" />
                        <Text style={styles.webViewLoadingText}>Memuat halaman pembayaran...</Text>
                    </View>
                )}

                <WebView
                    ref={webViewRef}
                    source={{ uri: paymentData.invoice_url }}
                    onLoadStart={() => setWebViewLoading(true)}
                    onLoadEnd={() => setWebViewLoading(false)}
                    onNavigationStateChange={handleWebViewNavigationStateChange}
                    onShouldStartLoadWithRequest={(request) => {
                        // Intercept custom scheme redirects
                        if (request.url.startsWith('halooptom://')) {
                            const { url } = request;
                            if (url.includes('success')) {
                                setShowWebView(false);
                                router.replace('/appointments/success');
                            } else if (url.includes('failure')) {
                                setShowWebView(false);
                                Alert.alert('Pembayaran Gagal', 'Silakan coba lagi.');
                            }
                            return false; // Stop WebView from loading this URL
                        }
                        return true;
                    }}
                    originWhitelist={['*']}
                    style={styles.webView}
                    startInLoadingState={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    renderLoading={() => (
                        <View style={styles.webViewLoadingContainer}>
                            <ActivityIndicator size="large" color="#1876B8" />
                        </View>
                    )}
                />
            </SafeAreaView>
        );
    }

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
                    <Text style={styles.headerTitle}>Pembayaran</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text style={styles.errorTitle}>Terjadi Kesalahan</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity onPress={loadPaymentInvoice} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Coba Lagi</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!paymentData) {
        return null;
    }

    const appointment = paymentData.appointment;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pembayaran</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {/* Payment Status Banner */}
                <View style={styles.statusBanner}>
                    <Ionicons name="time-outline" size={24} color="#f59e0b" />
                    <Text style={styles.statusText}>Menunggu Pembayaran</Text>
                </View>

                {/* Appointment Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Ringkasan Appointment</Text>

                    <View style={styles.summaryRow}>
                        <Ionicons name="person-outline" size={20} color="#64748b" />
                        <Text style={styles.summaryLabel}>Optometrist</Text>
                        <Text style={styles.summaryValue}>{appointment.optometrist?.name || 'N/A'}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Ionicons name="calendar-outline" size={20} color="#64748b" />
                        <Text style={styles.summaryLabel}>Tanggal</Text>
                        <Text style={styles.summaryValue}>{formatDate(appointment.date)}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Ionicons name="time-outline" size={20} color="#64748b" />
                        <Text style={styles.summaryLabel}>Waktu</Text>
                        <Text style={styles.summaryValue}>{appointment.start_time?.slice(0, 5) || 'N/A'}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Ionicons name={appointment.type === 'homecare' ? 'home-outline' : 'globe-outline'} size={20} color="#64748b" />
                        <Text style={styles.summaryLabel}>Layanan</Text>
                        <Text style={styles.summaryValue}>
                            {appointment.type === 'homecare' ? 'Homecare' : 'Online'}{' '}
                            {appointment.method && `(${appointment.method === 'video' ? 'Video' : 'Chat'})`}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Pembayaran</Text>
                        <Text style={styles.totalValue}>{formatCurrency(paymentData.amount)}</Text>
                    </View>
                </View>

                {/* Payment Info */}
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={20} color="#1876B8" />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Pembayaran Aman</Text>
                        <Text style={styles.infoText}>
                            Pembayaran diproses oleh Xendit dengan enkripsi keamanan tingkat tinggi
                        </Text>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <Ionicons name="time" size={20} color="#f59e0b" />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Waktu Terbatas</Text>
                        <Text style={styles.infoText}>
                            Invoice berlaku hingga {new Date(paymentData.expiry_date).toLocaleString('id-ID')}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Pay Button */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={handlePayNow} style={styles.payButton}>
                    <Ionicons name="card-outline" size={24} color="#fff" />
                    <Text style={styles.payButtonText}>Bayar Sekarang</Text>
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
    webViewHeader: {
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
    webViewHeaderTitle: {
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
    webViewLoadingContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -50 }, { translateY: -50 }],
        zIndex: 999,
        alignItems: 'center',
    },
    webViewLoadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748b',
    },
    webView: {
        flex: 1,
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
    statusBanner: {
        backgroundColor: '#fef3c7',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#fbbf24',
    },
    statusText: {
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#92400e',
    },
    summaryCard: {
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
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryLabel: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#64748b',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
        textAlign: 'right',
        maxWidth: '50%',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1876B8',
    },
    infoCard: {
        backgroundColor: '#e0f2fe',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#7dd3fc',
    },
    infoTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0c4a6e',
        marginBottom: 2,
    },
    infoText: {
        fontSize: 12,
        color: '#0c4a6e',
        lineHeight: 18,
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    payButton: {
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
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
