import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { optometristAppService, ApiAppointment } from '../../services/optometristApp.service';
import InitialAvatar from '../../components/common/InitialAvatar';

type ServiceType = 'all' | 'online' | 'homecare';
type MethodType = 'all' | 'chat' | 'video';

export default function ConsultationScreen() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [serviceFilter, setServiceFilter] = useState<ServiceType>('all');
    const [methodFilter, setMethodFilter] = useState<MethodType>('all');

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const data = await optometristAppService.getMyAppointments();
            // Show pending, confirmed, and ongoing appointments (exclude completed and cancelled)
            const consultations = data.filter(a => !['completed', 'cancelled', 'COMPLETED', 'CANCELLED'].includes(a.status));
            setAppointments(consultations);
        } catch (error) {
            console.error('Error fetching consultations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAppointments();
    }, [fetchAppointments]);

    // Filter appointments based on selected filters
    const filteredAppointments = appointments.filter(apt => {
        const matchesService = serviceFilter === 'all' || apt.type === serviceFilter;
        const matchesMethod = methodFilter === 'all' || apt.method === methodFilter;
        return matchesService && matchesMethod;
    });

    const getServiceBadgeColor = (type: string) => {
        switch (type) {
            case 'online': return { bg: '#dbeafe', text: '#1e40af', icon: '#3b82f6' };
            case 'homecare': return { bg: '#d1fae5', text: '#065f46', icon: '#10b981' };
            default: return { bg: '#f1f5f9', text: '#475569', icon: '#64748b' };
        }
    };

    const getMethodBadgeColor = (method: string) => {
        switch (method) {
            case 'chat': return { bg: '#e9d5ff', text: '#6b21a8', icon: '#a855f7' };
            case 'video': return { bg: '#fed7aa', text: '#9a3412', icon: '#f97316' };
            default: return { bg: '#f1f5f9', text: '#475569', icon: '#64748b' };
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const renderFilterChip = (
        label: string,
        isActive: boolean,
        onPress: () => void,
        icon: string
    ) => (
        <TouchableOpacity
            style={[styles.filterChip, isActive && styles.filterChipActive]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Ionicons
                name={icon as any}
                size={16}
                color={isActive ? '#fff' : '#64748b'}
            />
            <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1876B8" />
                    <Text style={styles.loadingText}>Memuat konsultasi...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="chatbubbles" size={28} color="#1876B8" />
                    <View>
                        <Text style={styles.headerTitle}>Konsultasi</Text>
                        <Text style={styles.headerSubtitle}>{filteredAppointments.length} Konsultasi</Text>
                    </View>
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <Text style={styles.filterLabel}>Jenis Layanan</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                    {renderFilterChip('Semua', serviceFilter === 'all', () => setServiceFilter('all'), 'apps-outline')}
                    {renderFilterChip('Online', serviceFilter === 'online', () => setServiceFilter('online'), 'globe-outline')}
                    {renderFilterChip('Homecare', serviceFilter === 'homecare', () => setServiceFilter('homecare'), 'home-outline')}
                </ScrollView>

                <Text style={styles.filterLabel}>Metode</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                    {renderFilterChip('Semua', methodFilter === 'all', () => setMethodFilter('all'), 'apps-outline')}
                    {renderFilterChip('Chat', methodFilter === 'chat', () => setMethodFilter('chat'), 'chatbubbles-outline')}
                    {renderFilterChip('Video', methodFilter === 'video', () => setMethodFilter('video'), 'videocam-outline')}
                </ScrollView>
            </View>

            {/* Consultation List */}
            {filteredAppointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="chatbubbles-outline" size={64} color="#cbd5e1" />
                    </View>
                    <Text style={styles.emptyTitle}>Belum Ada Konsultasi</Text>
                    <Text style={styles.emptySubtitle}>
                        Konsultasi dengan pasien akan muncul di sini
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredAppointments}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#1876B8']}
                        />
                    }
                    renderItem={({ item }) => {
                        const serviceBadge = getServiceBadgeColor(item.type);
                        const methodBadge = getMethodBadgeColor(item.method || 'chat');

                        return (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => {
                                    if (item.id) {
                                        router.push(`/optometrist/appointment/${item.id}`);
                                    }
                                }}
                                activeOpacity={0.7}
                            >
                                {/* Top Section: Patient Info */}
                                <View style={styles.cardHeader}>
                                    <InitialAvatar
                                        name={item.patient?.name || 'Pasien'}
                                        avatarUrl={item.patient?.avatar_url}
                                        size={48}
                                        role="patient"
                                    />
                                    <View style={styles.patientInfo}>
                                        <Text style={styles.patientName} numberOfLines={1}>
                                            {item.patient?.name || 'Pasien'}
                                        </Text>
                                        <View style={styles.dateRow}>
                                            <Ionicons name="calendar-outline" size={12} color="#64748b" />
                                            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                                </View>

                                {/* Middle Section: Badges */}
                                <View style={styles.badgesRow}>
                                    <View style={[styles.badge, { backgroundColor: serviceBadge.bg }]}>
                                        <Ionicons
                                            name={item.type === 'online' ? 'globe' : 'home'}
                                            size={14}
                                            color={serviceBadge.text}
                                        />
                                        <Text style={[styles.badgeText, { color: serviceBadge.text }]}>
                                            {item.type === 'online' ? 'Online' : 'Homecare'}
                                        </Text>
                                    </View>

                                    <View style={[styles.badge, { backgroundColor: methodBadge.bg }]}>
                                        <Ionicons
                                            name={item.method === 'chat' ? 'chatbubbles' : 'videocam'}
                                            size={14}
                                            color={methodBadge.text}
                                        />
                                        <Text style={[styles.badgeText, { color: methodBadge.text }]}>
                                            {item.method === 'chat' ? 'Chat' : 'Video'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Bottom Section: Time */}
                                <View style={styles.timeRow}>
                                    <Ionicons name="time-outline" size={14} color="#64748b" />
                                    <Text style={styles.timeText}>
                                        {item.start_time?.slice(0, 5)} {item.end_time ? `- ${item.end_time.slice(0, 5)}` : ''} WIB
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#64748b',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    filtersContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 10,
        marginTop: 8,
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: '#1876B8',
        borderColor: '#1876B8',
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748b',
    },
    filterChipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    patientInfo: {
        flex: 1,
        marginLeft: 12,
    },
    patientName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 4,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#64748b',
    },
    badgesRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timeText: {
        fontSize: 13,
        color: '#64748b',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
});
