import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { optometristAppService, ApiAppointment } from '../../../services/optometristApp.service';
import { API_BASE_URL } from '../../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MedicalRecord {
    id: string;
    diagnosis: string;
    prescription?: string;
    notes?: string;
    created_at: string;
}

export default function PatientHistoryDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [appointment, setAppointment] = useState<ApiAppointment | null>(null);
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            if (typeof id === 'string') {
                const token = await AsyncStorage.getItem('authToken');

                // First try to fetch as appointment ID
                try {
                    const data = await optometristAppService.getAppointmentDetail(id);
                    setAppointment(data);

                    // Fetch medical record by appointment_id
                    if (token) {
                        const response = await fetch(`${API_BASE_URL}/medicalRecords?appointment_id=${id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        });
                        if (response.ok) {
                            const records = await response.json();
                            if (records && records.length > 0) {
                                setMedicalRecord(records[0]);
                            }
                        }
                    }
                } catch (appointmentError: any) {
                    // If appointment not found, try to fetch as medical record ID
                    console.log('Trying as medical record ID...');

                    if (token) {
                        const response = await fetch(`${API_BASE_URL}/medicalRecords/${id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        });

                        if (response.ok) {
                            const record = await response.json();
                            if (record) {
                                setMedicalRecord(record);

                                // Create a mock appointment from medical record data
                                if (record.appointment) {
                                    setAppointment(record.appointment);
                                } else if (record.patient) {
                                    // Create minimal appointment-like object from medical record
                                    setAppointment({
                                        id: id,
                                        patient: record.patient,
                                        optometrist: record.optometrist,
                                        date: record.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                                        start_time: record.created_at ? new Date(record.created_at).toTimeString().slice(0, 5) : '00:00',
                                        status: 'completed',
                                        type: 'online',
                                        method: 'chat',
                                    } as ApiAppointment);
                                }
                            }
                        } else {
                            throw new Error('Medical record not found');
                        }
                    } else {
                        throw appointmentError;
                    }
                }
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal memuat detail riwayat pasien');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !appointment) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1876B8" />
            </View>
        );
    }

    if (!appointment) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detail Riwayat Pasien</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#94a3b8" />
                    <Text style={styles.emptyText}>Data tidak ditemukan</Text>
                </View>
            </SafeAreaView>
        );
    }

    const base = API_BASE_URL.replace(/\/?api$/, '');
    let avatarUrl = appointment.patient?.avatar_url;
    if (avatarUrl && !/^https?:\/\//i.test(avatarUrl)) avatarUrl = base + avatarUrl;
    if (avatarUrl && /localhost|127\.0\.0\.1/.test(avatarUrl)) avatarUrl = avatarUrl.replace(/^https?:\/\/[^/]+/, base);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Riwayat Pasien</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Patient Card */}
                <View style={styles.patientCard}>
                    <Image
                        source={avatarUrl ? { uri: avatarUrl } : require('../../../assets/images/avatar.png')}
                        style={styles.avatar}
                    />
                    <View style={styles.patientInfo}>
                        <Text style={styles.patientName}>{appointment.patient?.name || 'Pasien'}</Text>
                        <Text style={styles.patientRole}>Pasien</Text>
                    </View>
                    <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#fff" />
                        <Text style={styles.completedBadgeText}>Selesai</Text>
                    </View>
                </View>

                {/* Consultation Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informasi Konsultasi</Text>
                    <View style={styles.card}>
                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="calendar" size={20} color="#1876B8" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Tanggal</Text>
                                <Text style={styles.infoValue}>
                                    {new Date(appointment.date).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="time" size={20} color="#1876B8" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Waktu</Text>
                                <Text style={styles.infoValue}>
                                    {appointment.start_time?.slice(0, 5)}
                                    {appointment.end_time && ` - ${appointment.end_time.slice(0, 5)}`} WIB
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                <Ionicons
                                    name={appointment.method === 'video' ? 'videocam' : 'chatbubble'}
                                    size={20}
                                    color="#1876B8"
                                />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Layanan</Text>
                                <Text style={styles.infoValue}>
                                    {appointment.type === 'homecare' ? 'Homecare Pemeriksaan' :
                                        appointment.method === 'video' ? 'Konsultasi Video' : 'Konsultasi Chat'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Medical Record */}
                {medicalRecord ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Rekam Medis</Text>
                        <View style={styles.medicalCard}>
                            <View style={styles.medicalHeader}>
                                <View style={styles.medicalIconContainer}>
                                    <Ionicons name="medical" size={24} color="#fff" />
                                </View>
                                <Text style={styles.medicalHeaderText}>Hasil Pemeriksaan</Text>
                            </View>

                            <View style={styles.medicalContent}>
                                <View style={styles.medicalSection}>
                                    <View style={styles.medicalLabelRow}>
                                        <Ionicons name="pulse" size={16} color="#f59e0b" />
                                        <Text style={styles.medicalLabel}>Diagnosis</Text>
                                    </View>
                                    <View style={styles.diagnosisBox}>
                                        <Text style={styles.diagnosisText}>{medicalRecord.diagnosis}</Text>
                                    </View>
                                </View>

                                {medicalRecord.prescription && (
                                    <View style={styles.medicalSection}>
                                        <View style={styles.medicalLabelRow}>
                                            <Ionicons name="medkit" size={16} color="#3b82f6" />
                                            <Text style={styles.medicalLabel}>Resep / Tindakan</Text>
                                        </View>
                                        <View style={styles.recommendationBox}>
                                            <Text style={styles.recommendationText}>{medicalRecord.prescription}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Rekam Medis</Text>
                        <View style={styles.noRecordCard}>
                            <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
                            <Text style={styles.noRecordText}>Rekam medis belum tersedia</Text>
                        </View>
                    </View>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 16,
    },
    patientCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#f1f5f9',
    },
    patientInfo: {
        flex: 1,
        marginLeft: 16,
    },
    patientName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    patientRole: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#22c55e',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    completedBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContent: {
        marginLeft: 14,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginLeft: 54,
    },
    medicalCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#1876B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    medicalHeader: {
        backgroundColor: '#1876B8',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 14,
    },
    medicalIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    medicalHeaderText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    medicalContent: {
        padding: 20,
    },
    medicalSection: {
        marginBottom: 20,
    },
    medicalLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    medicalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    diagnosisBox: {
        backgroundColor: '#fffbeb',
        padding: 16,
        borderRadius: 14,
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
    },
    diagnosisText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#92400e',
        lineHeight: 24,
    },
    recommendationBox: {
        backgroundColor: '#eff6ff',
        padding: 16,
        borderRadius: 14,
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6',
    },
    recommendationText: {
        fontSize: 15,
        color: '#1e40af',
        lineHeight: 24,
        fontWeight: '500',
    },
    noRecordCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    noRecordText: {
        fontSize: 15,
        color: '#94a3b8',
        marginTop: 12,
    },
});
