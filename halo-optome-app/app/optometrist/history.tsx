import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { optometristAppService, ApiAppointment } from '../../services/optometristApp.service';
import { medicalService, MedicalHistory } from '../../services/medicalService';
import { API_BASE_URL } from '../../constants/config';
import { formatRupiah, getInitials } from '../../utils/format';

interface HistoryItem {
    id: string; // appointment_id or medical_record_id
    type: 'appointment' | 'medical_record';
    patientId: string;
    patientName: string;
    patientAvatar: any;
    date: string;
    formattedDate: string;
    time: string;
    serviceName: string;
    diagnosis?: string;
    status: string;
}

export default function HistoryScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch Appointments (Completed)
            const appointments = await optometristAppService.getMyAppointments();
            const completedAppointments = appointments.filter(a => a.status === 'completed');

            // Fetch Medical Records
            // We need patient IDs to fetch records. 
            // For a comprehensive history, we might want to fetch all my patients first or iterate through unique patients from appointments.
            // For now, let's use the same logic as dashboard: fetch for patients involved in appointments.

            const patientIds = Array.from(new Set(appointments.map(a => a.patient?.id).filter(Boolean))) as string[];
            // Limit to last 20 patients to avoid spamming requests if list is huge, or fetch specifically where needed.
            // Ideally backend provides a history endpoint.

            const historiesByPatient = await Promise.all(
                patientIds.map(async pid => {
                    try {
                        return await medicalService.getPatientMedicalRecords(pid);
                    } catch (e) {
                        console.log('Error fetching records for patient', pid, e);
                        return [];
                    }
                })
            );

            const allMedicalRecords: MedicalHistory[] = ([] as MedicalHistory[]).concat(...historiesByPatient);

            // Patient Info Map for quick lookup
            const base = API_BASE_URL.replace(/\/?api$/, '');
            const patientMap = new Map<string, { name: string, avatar: any }>();

            appointments.forEach(a => {
                if (a.patient?.id) {
                    let url = a.patient.avatar_url;
                    if (url && !/^https?:\/\//i.test(url)) url = base + url;
                    if (url && /localhost|127\.0\.0\.1/.test(url)) url = url.replace(/^https?:\/\/[^/]+/, base);
                    patientMap.set(a.patient.id, {
                        name: a.patient.name,
                        avatar: url ? { uri: url } : null
                    });
                }
            });

            // Merge into HistoryItems
            // 1. Map Medical Records
            const recordItems: HistoryItem[] = allMedicalRecords.map(r => {
                const pInfo = patientMap.get(r.patientId);
                return {
                    id: r.id,
                    type: 'medical_record',
                    patientId: r.patientId,
                    patientName: pInfo?.name || 'Pasien',
                    patientAvatar: pInfo?.avatar,
                    date: r.date,
                    formattedDate: new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                    time: '', // Record doesn't strictly have time unless separate field
                    serviceName: r.condition || 'Pemeriksaan', // Use diagnosis as service name/title context or 'Pemeriksaan'
                    diagnosis: r.condition,
                    status: 'Selesai'
                };
            });

            // 2. Map Completed Appointments that DON'T match a record date (to avoid duplicates if they overlap concept)
            // Actually, let's just show Completed Appointments as the "History" source of truth for interactions.
            const appointmentItems: HistoryItem[] = completedAppointments.map(a => {
                let url = a.patient?.avatar_url;
                if (url && !/^https?:\/\//i.test(url)) url = base + url;
                if (url && /localhost|127\.0\.0\.1/.test(url)) url = url.replace(/^https?:\/\/[^/]+/, base);

                return {
                    id: a.id,
                    type: 'appointment',
                    patientId: a.patient?.id || '',
                    patientName: a.patient?.name || 'Pasien',
                    patientAvatar: url ? { uri: url } : null,
                    date: a.date,
                    formattedDate: new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                    time: a.start_time?.slice(0, 5) || '',
                    serviceName: a.type === 'homecare' ? 'Homecare' : (a.method === 'video' ? 'Video Call' : 'Chat'),
                    status: 'Selesai'
                };
            });

            // Combine and sort
            // Strategy: Use appointments as base. Use records to enrich?
            // For simplified "Riwayat Pasien", let's list distinct interactions.
            const combined = [...appointmentItems];
            combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setHistoryData(combined);

        } catch (e) {
            console.error(e);
            setError('Gagal memuat riwayat.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const renderItem = ({ item }: { item: HistoryItem }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push(`/optometrist/patient/${item.id}`)} // Assuming this goes to patient detail or record detail
        >
            <View style={styles.cardHeader}>
                <View style={styles.patientInfo}>
                    {item.patientAvatar ? (
                        <Image source={item.patientAvatar} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.initialsContainer]}>
                            <Text style={styles.initialsText}>{getInitials(item.patientName)}</Text>
                        </View>
                    )}
                    <View>
                        <Text style={styles.patientName}>{item.patientName}</Text>
                        <Text style={styles.serviceType}>{item.serviceName}</Text>
                    </View>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                    <Ionicons name="calendar-outline" size={16} color="#64748b" />
                    <Text style={styles.footerText}>{item.formattedDate}</Text>
                </View>
                {item.time ? (
                    <View style={styles.footerItem}>
                        <Ionicons name="time-outline" size={16} color="#64748b" />
                        <Text style={styles.footerText}>{item.time}</Text>
                    </View>
                ) : null}
                <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => router.push(`/optometrist/patient/${item.id}`)}
                >
                    <Text style={styles.detailButtonText}>Lihat Detail</Text>
                    <Ionicons name="chevron-forward" size={16} color="#1876B8" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Riwayat Pasien</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1876B8" />
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchData} style={styles.retryBtn}>
                        <Text style={styles.retryText}>Coba Lagi</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={historyData}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
                            <Text style={styles.emptyText}>Belum ada riwayat pasien</Text>
                        </View>
                    }
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
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
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    patientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f1f5f9',
        marginRight: 12,
    },
    initialsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0f2fe',
        borderWidth: 1,
        borderColor: '#bae6fd',
    },
    initialsText: {
        color: '#0284c7',
        fontSize: 16,
        fontWeight: '700',
    },
    patientName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    serviceType: {
        fontSize: 13,
        color: '#64748b',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: '#dcfce7',
        borderRadius: 20,
        marginLeft: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#166534',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 13,
        color: '#64748b',
    },
    detailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1876B8',
    },
    errorText: {
        color: '#ef4444',
        marginBottom: 12,
    },
    retryBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#1876B8',
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: '500',
    },
});
