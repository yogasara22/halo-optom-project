import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Platform,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import patientService, { Appointment } from '../../services/patientService';

export default function ScheduleScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadAppointments();
        }, [])
    );

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const data = await patientService.getAppointments();
            setAppointments(data || []); // Fallback to empty array if data is null/undefined
        } catch (error) {
            console.error('Error loading appointments:', error);
            setAppointments([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAppointments();
        setRefreshing(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatPrice = (price?: number) => {
        if (!price) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleJoinConsultation = (appointment: Appointment) => {
        if (appointment.payment_status !== 'paid') {
            return;
        }

        if (appointment.method === 'chat') {
            router.push(`/consultation/chat?id=${appointment.id}`);
        } else if (appointment.method === 'video') {
            router.push(`/consultation/video?id=${appointment.id}`);
        }
    };

    const canJoinConsultation = (appointment: Appointment): boolean => {
        return (
            appointment.payment_status === 'paid' &&
            (appointment.status === 'confirmed' || appointment.status === 'ongoing') &&
            (appointment.method === 'chat' || appointment.method === 'video')
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
            case 'ongoing':
                return { bg: '#eff6ff', text: '#2563EB' };
            case 'completed':
                return { bg: '#f0fdf4', text: '#16a34a' };
            case 'cancelled':
                return { bg: '#fef2f2', text: '#dc2626' };
            default:
                return { bg: '#fef3c7', text: '#f59e0b' };
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Menunggu';
            case 'confirmed':
                return 'Dikonfirmasi';
            case 'ongoing':
                return 'Berlangsung';
            case 'completed':
                return 'Selesai';
            case 'cancelled':
                return 'Dibatalkan';
            default:
                return status;
        }
    };

    const filterAppointments = () => {
        // Safety check to prevent undefined error
        if (!appointments || !Array.isArray(appointments)) {
            return [];
        }

        if (activeTab === 'active') {
            return appointments.filter(
                (apt) => apt.status !== 'completed' && apt.status !== 'cancelled'
            );
        } else {
            return appointments.filter(
                (apt) => apt.status === 'completed' || apt.status === 'cancelled'
            );
        }
    };

    const renderAppointmentCard = ({ item }: { item: Appointment }) => {
        const statusColor = getStatusColor(item.status);
        const canJoin = canJoinConsultation(item);

        return (
            <View style={styles.card}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    {item.optometrist.avatar_url ? (
                        <Image
                            source={{ uri: item.optometrist.avatar_url }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarText}>
                                {item.optometrist.name[0]}
                            </Text>
                        </View>
                    )}

                    <View style={styles.headerInfo}>
                        <Text style={styles.doctorName}>{item.optometrist.name}</Text>
                        <Text style={styles.speciality}>Optometrist</Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                        <Text style={[styles.statusText, { color: statusColor.text }]}>
                            {getStatusText(item.status)}
                        </Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Details */}
                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color="#64748b" />
                        <Text style={styles.detailText}>{formatDate(item.date)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={16} color="#64748b" />
                        <Text style={styles.detailText}>
                            {item.start_time.slice(0, 5)}
                            {item.end_time && ` - ${item.end_time.slice(0, 5)}`}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        {item.type === 'online' ? (
                            <>
                                <Ionicons
                                    name={item.method === 'video' ? 'videocam-outline' : 'chatbubble-outline'}
                                    size={16}
                                    color="#64748b"
                                />
                                <Text style={styles.detailText}>
                                    Online {item.method === 'video' ? 'Video' : 'Chat'}
                                </Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="location-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>
                                    {item.location || 'Homecare'}
                                </Text>
                            </>
                        )}
                    </View>

                    {item.price && (
                        <View style={styles.detailRow}>
                            <Ionicons name="card-outline" size={16} color="#64748b" />
                            <Text style={styles.detailText}>{formatPrice(item.price)}</Text>
                            {item.payment_status === 'paid' && (
                                <View style={styles.paidBadge}>
                                    <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                                    <Text style={styles.paidText}>Dibayar</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Footer Actions */}
                {activeTab === 'active' && (
                    <View style={styles.cardFooter}>
                        {canJoin ? (
                            <TouchableOpacity
                                style={styles.joinButton}
                                onPress={() => handleJoinConsultation(item)}
                            >
                                <Ionicons
                                    name={item.method === 'video' ? 'videocam' : 'chatbubble'}
                                    size={20}
                                    color="#fff"
                                />
                                <Text style={styles.joinButtonText}>
                                    Join {item.method === 'video' ? 'Video' : 'Chat'}
                                </Text>
                            </TouchableOpacity>
                        ) : item.payment_status === 'unpaid' ? (
                            <TouchableOpacity
                                style={styles.payButton}
                                onPress={() => router.push(`/appointments/payment?id=${item.id}`)}
                            >
                                <Ionicons name="card-outline" size={20} color="#fff" />
                                <Text style={styles.payButtonText}>Bayar Sekarang</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.infoRow}>
                                <Ionicons name="information-circle" size={16} color="#64748b" />
                                <Text style={styles.infoText}>
                                    Menunggu konfirmasi optometrist
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.pageTitle}>Jadwal Saya</Text>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1876B8" />
                    <Text style={styles.loadingText}>Memuat jadwal...</Text>
                </View>
            </View>
        );
    }

    const filteredAppointments = filterAppointments();

    return (
        <View style={styles.container}>
            <Text style={styles.pageTitle}>Jadwal Saya</Text>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'active' && styles.activeTabText,
                        ]}
                    >
                        Jadwal Aktif
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                    onPress={() => setActiveTab('history')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'history' && styles.activeTabText,
                        ]}
                    >
                        Riwayat
                    </Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={filteredAppointments}
                keyExtractor={(item) => item.id}
                renderItem={renderAppointmentCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1876B8']} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyText}>
                            Tidak ada {activeTab === 'active' ? 'jadwal aktif' : 'riwayat'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 24,
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: { elevation: 2 },
        }),
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    activeTabText: {
        color: '#1876B8',
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 12,
            },
            android: { elevation: 3 },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarPlaceholder: {
        backgroundColor: '#1876B8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    speciality: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 16,
    },
    detailsContainer: {
        gap: 10,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#475569',
        flex: 1,
    },
    paidBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    paidText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#10b981',
    },
    cardFooter: {
        marginTop: 8,
    },
    joinButton: {
        backgroundColor: '#1876B8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    joinButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    payButton: {
        backgroundColor: '#10b981',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    payButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
    },
    infoText: {
        fontSize: 13,
        color: '#64748b',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
        marginTop: 16,
    },
});
