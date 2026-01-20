import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Animated, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { optometristAppService, ApiAppointment } from '../../services/optometristApp.service';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { API_BASE_URL } from '../../constants/config';
import InitialAvatar from '../../components/common/InitialAvatar';

// ------------------- WORKING HOURS INTERFACES & CONSTANTS -------------------
interface Schedule {
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
}

const DAY_NAME_MAP: { [key: string]: string } = {
    'monday': 'Senin', 'tuesday': 'Selasa', 'wednesday': 'Rabu',
    'thursday': 'Kamis', 'friday': 'Jumat', 'saturday': 'Sabtu', 'sunday': 'Minggu'
};
const DAY_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const DAY_COLORS: { [key: string]: { bg: string; text: string; icon: string } } = {
    'Senin': { bg: '#eff6ff', text: '#1d4ed8', icon: '#3b82f6' },
    'Selasa': { bg: '#f0fdf4', text: '#166534', icon: '#22c55e' },
    'Rabu': { bg: '#fefce8', text: '#854d0e', icon: '#eab308' },
    'Kamis': { bg: '#fdf4ff', text: '#86198f', icon: '#d946ef' },
    'Jumat': { bg: '#fff1f2', text: '#9f1239', icon: '#f43f5e' },
    'Sabtu': { bg: '#f0f9ff', text: '#0369a1', icon: '#0ea5e9' },
    'Minggu': { bg: '#fef2f2', text: '#991b1b', icon: '#ef4444' },
};
const DAY_ICONS: { [key: string]: any } = {
    'Senin': 'briefcase-outline', 'Selasa': 'flash-outline', 'Rabu': 'leaf-outline',
    'Kamis': 'star-outline', 'Jumat': 'heart-outline', 'Sabtu': 'sunny-outline', 'Minggu': 'moon-outline',
};

// ------------------- COMPONENT -------------------

export default function ScheduleScreen() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'appointments' | 'workingHours'>('appointments');

    // --- State for Appointments ---
    const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
    const [loadingAppts, setLoadingAppts] = useState(true);
    const [refreshingAppts, setRefreshingAppts] = useState(false);

    // --- State for Working Hours ---
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loadingHours, setLoadingHours] = useState(true);
    const [refreshingHours, setRefreshingHours] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Animation Effect
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    // ------------------- FETCH DATA -------------------

    const fetchAppointments = useCallback(async () => {
        try {
            setLoadingAppts(true);
            const data = await optometristAppService.getMyAppointments();
            // Filter only active appointments (pending/confirmed/ongoing)
            const active = data.filter(a => ['pending', 'confirmed', 'ongoing', 'PENDING', 'CONFIRMED'].includes(a.status));
            // Sort by Date
            active.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setAppointments(active);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAppts(false);
            setRefreshingAppts(false);
        }
    }, []);

    const fetchWorkingHours = useCallback(async () => {
        try {
            setLoadingHours(true);
            const response = await api.get(`/schedules?optometrist_id=${user?.id}`);
            const transformedSchedules = response.data.map((schedule: any) => ({
                ...schedule,
                day_of_week: DAY_NAME_MAP[schedule.day_of_week.toLowerCase()] || schedule.day_of_week
            }));
            setSchedules(transformedSchedules);
        } catch (err) {
            console.error('Error fetching schedules:', err);
            setError('Gagal memuat jadwal.');
        } finally {
            setLoadingHours(false);
            setRefreshingHours(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            fetchAppointments();
            fetchWorkingHours();
        }
    }, [user, fetchAppointments, fetchWorkingHours]);

    // ------------------- HELPERS -------------------
    const convertStatus = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'Menunggu';
            case 'confirmed': return 'Disetujui';
            case 'ongoing': return 'Berlangsung';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return { bg: '#fef3c7', text: '#b45309' };
            case 'confirmed': return { bg: '#dcfce7', text: '#166534' };
            case 'ongoing': return { bg: '#dbeafe', text: '#1e40af' };
            default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

    const formatAvatarUrl = (url?: string) => {
        if (!url) return null;
        const base = API_BASE_URL.replace(/\/?api$/, '');
        if (!/^https?:\/\//i.test(url)) url = base + url;
        if (/localhost|127\.0\.0\.1/.test(url)) url = url.replace(/^https?:\/\/[^/]+/, base);
        return { uri: url };
    };

    const groupAppointmentsByDate = (appts: ApiAppointment[]) => {
        const grouped: { [key: string]: ApiAppointment[] } = {};
        appts.forEach(a => {
            const d = new Date(a.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            if (!grouped[d]) grouped[d] = [];
            grouped[d].push(a);
        });
        return grouped;
    };

    // ------------------- RENDER TAB CONTENT -------------------

    const renderAppointments = () => {
        if (loadingAppts && !refreshingAppts) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1876B8" />
                </View>
            );
        }

        if (appointments.length === 0) {
            return (
                <ScrollView refreshControl={<RefreshControl refreshing={refreshingAppts} onRefresh={() => { setRefreshingAppts(true); fetchAppointments(); }} />}>
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBlue}>
                            <Ionicons name="calendar-outline" size={48} color="#fff" />
                        </View>
                        <Text style={styles.emptyTitle}>Belum Ada Jadwal Pasien</Text>
                        <Text style={styles.emptySubtitle}>Jadwal pemeriksaan pasien akan muncul di sini.</Text>
                    </View>
                </ScrollView>
            );
        }

        const grouped = groupAppointmentsByDate(appointments);

        return (
            <ScrollView
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshingAppts} onRefresh={() => { setRefreshingAppts(true); fetchAppointments(); }} />}
            >
                {Object.keys(grouped).map((date, idx) => (
                    <View key={idx} style={styles.dateGroup}>
                        <View style={styles.dateHeader}>
                            <Ionicons name="calendar" size={16} color="#1876B8" />
                            <Text style={styles.dateTitle}>{date}</Text>
                        </View>
                        {grouped[date].map(item => {
                            const avatar = formatAvatarUrl(item.patient?.avatar_url);
                            const statusStyle = getStatusColor(item.status);

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.card}
                                    onPress={() => router.push(`/optometrist/appointment/${item.id}`)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.cardInternal}>
                                        <View style={styles.row}>
                                            <InitialAvatar
                                                name={item.patient?.name || 'Pasien'}
                                                avatarUrl={item.patient?.avatar_url}
                                                size={48}
                                                role="patient"
                                                style={styles.avatar}
                                            />
                                            <View style={styles.info}>
                                                <Text style={styles.name}>{item.patient?.name || 'Pasien Tanpa Nama'}</Text>
                                                <Text style={styles.serviceType}>
                                                    {item.type === 'homecare' ? 'Homecare Pemeriksaan' : (item.method === 'video' ? 'Konsultasi Video' : 'Konsultasi Chat')}
                                                </Text>
                                                <View style={styles.timeRow}>
                                                    <Ionicons name="time-outline" size={14} color="#64748b" />
                                                    <Text style={styles.timeText}>{item.start_time?.slice(0, 5)} {item.end_time ? `- ${item.end_time.slice(0, 5)}` : ''}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                            <Text style={[styles.statusText, { color: statusStyle.text }]}>{convertStatus(item.status)}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>
        );
    };

    const renderWorkingHours = () => {
        // ... Logic from original file adapted ...
        if (loadingHours && !refreshingHours) {
            return <ActivityIndicator size="large" color="#22c55e" style={{ marginTop: 40 }} />;
        }

        const groupedSchedules = schedules.reduce((acc, schedule) => {
            const day = schedule.day_of_week;
            if (!acc[day]) acc[day] = [];
            acc[day].push(schedule);
            return acc;
        }, {} as { [key: string]: Schedule[] });

        Object.keys(groupedSchedules).forEach(day => {
            groupedSchedules[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
        });

        const sortedDays = DAY_ORDER.filter(day => groupedSchedules[day]);

        return (
            <ScrollView
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshingHours} onRefresh={() => { setRefreshingHours(true); fetchWorkingHours(); }} />}
            >
                {sortedDays.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconGreen}>
                            <Ionicons name="briefcase-outline" size={48} color="#fff" />
                        </View>
                        <Text style={styles.emptyTitle}>Jadwal Praktik Kosong</Text>
                        <Text style={styles.emptySubtitle}>Hubungi admin untuk mengatur jadwal.</Text>
                    </View>
                ) : (
                    sortedDays.map(day => {
                        const dayColor = DAY_COLORS[day] || DAY_COLORS['Senin'];
                        const daySchedules = groupedSchedules[day];
                        return (
                            <View key={day} style={styles.dayCard}>
                                <View style={[styles.dayHeader, { backgroundColor: dayColor.bg }]}>
                                    <Ionicons name={DAY_ICONS[day]} size={18} color={dayColor.text} />
                                    <Text style={[styles.dayTitle, { color: dayColor.text }]}>{day}</Text>
                                    <Text style={[styles.dayCount, { color: dayColor.text }]}>{daySchedules.length} Sesi</Text>
                                </View>
                                <View style={styles.timeSlots}>
                                    {daySchedules.map((sch, i) => (
                                        <View key={sch.id} style={[styles.timeSlot, i < daySchedules.length - 1 && styles.borderBottom]}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <View style={[styles.dot, { backgroundColor: sch.is_active ? '#22c55e' : '#cbd5e1' }]} />
                                                <Text style={styles.slotTime}>{sch.start_time.slice(0, 5)} - {sch.end_time.slice(0, 5)}</Text>
                                            </View>
                                            <Text style={{ fontSize: 13, color: sch.is_active ? '#15803d' : '#94a3b8', fontWeight: '500' }}>
                                                {sch.is_active ? 'Aktif' : 'Nonaktif'}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        );
                    })
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.screenTitle}>Jadwal</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Custom Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'appointments' && styles.activeTab]}
                    onPress={() => setActiveTab('appointments')}
                >
                    <Text style={[styles.tabText, activeTab === 'appointments' && styles.activeTabText]}>Janji Temu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'workingHours' && styles.activeTab]}
                    onPress={() => setActiveTab('workingHours')}
                >
                    <Text style={[styles.tabText, activeTab === 'workingHours' && styles.activeTabText]}>Jadwal Praktik</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {activeTab === 'appointments' ? renderAppointments() : renderWorkingHours()}
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
        borderRadius: 20,
    },
    screenTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 10,
        backgroundColor: '#fff',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#1876B8',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#64748b',
    },
    activeTabText: {
        color: '#1876B8',
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyIconBlue: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#93c5fd',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    emptyIconGreen: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#86efac',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    // Appointment Styles
    dateGroup: {
        marginBottom: 24,
    },
    dateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    dateTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#334155',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        padding: 16,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardInternal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    row: {
        flexDirection: 'row',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        // backgroundColor removed to allow InitialAvatar to set its own color
        marginRight: 12,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    serviceType: {
        fontSize: 13,
        color: '#1876B8',
        marginBottom: 6,
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
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    // Working Hours Styles
    dayCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 10,
    },
    dayTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
    },
    dayCount: {
        fontSize: 12,
        fontWeight: '600',
    },
    timeSlots: {
        padding: 12,
    },
    timeSlot: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4
    },
    slotTime: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '500',
    },
});
