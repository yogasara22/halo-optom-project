import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import patientService, { Appointment } from '../../../services/patientService';
import { fixImageUrl } from '../../../lib/utils';
import { API_BASE_URL } from '../../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MedicalRecord {
    id: string;
    diagnosis: string;
    prescription?: string;
    notes?: string;
    created_at: string;
}

export default function AppointmentDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const appointmentId = params.id as string;

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAppointmentDetail();
    }, [appointmentId]);

    const loadAppointmentDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch appointment details
            const appointments = await patientService.getAppointments();
            const found = appointments.find(a => a.id === appointmentId);

            if (!found) {
                setError('Appointment tidak ditemukan');
                return;
            }

            setAppointment(found);

            // Fetch medical record if appointment is completed
            if (found.status === 'completed') {
                await loadMedicalRecord();
            }
        } catch (err: any) {
            console.error('Error loading appointment detail:', err);
            setError('Gagal memuat detail appointment');
        } finally {
            setLoading(false);
        }
    };

    const loadMedicalRecord = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/medicalRecords?appointment_id=${appointmentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setMedicalRecord(data[0]);
                }
            }
        } catch (err) {
            console.error('Error loading medical record:', err);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.slice(0, 5);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1876B8" />
                    <Text style={styles.loadingText}>Memuat detail...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !appointment) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text style={styles.errorTitle}>Terjadi Kesalahan</Text>
                    <Text style={styles.errorMessage}>{error || 'Data tidak ditemukan'}</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backToListButton}>
                        <Text style={styles.backToListText}>Kembali</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Konsultasi</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Optometrist Info Card */}
                <View style={styles.optometristCard}>
                    {appointment.optometrist.avatar_url ? (
                        <Image
                            source={{ uri: fixImageUrl(appointment.optometrist.avatar_url) }}
                            style={styles.optometristAvatar}
                        />
                    ) : (
                        <View style={[styles.optometristAvatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarText}>
                                {appointment.optometrist.name[0]}
                            </Text>
                        </View>
                    )}
                    <View style={styles.optometristInfo}>
                        <Text style={styles.optometristName}>{appointment.optometrist.name}</Text>
                        <Text style={styles.optometristSpecialty}>Optometrist</Text>
                    </View>
                </View>

                {/* Appointment Details Card */}
                <View style={styles.detailCard}>
                    <Text style={styles.cardTitle}>Informasi Konsultasi</Text>

                    <View style={styles.detailRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="calendar" size={20} color="#1876B8" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Tanggal</Text>
                            <Text style={styles.detailValue}>{formatDate(appointment.date)}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="time" size={20} color="#1876B8" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Waktu</Text>
                            <Text style={styles.detailValue}>
                                {formatTime(appointment.start_time)}
                                {appointment.end_time && ` - ${formatTime(appointment.end_time)}`}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name={appointment.method === 'video' ? 'videocam' : 'chatbubble'}
                                size={20}
                                color="#1876B8"
                            />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Metode</Text>
                            <Text style={styles.detailValue}>
                                {appointment.method === 'video' ? 'Video Call' : 'Chat'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="checkbox-outline" size={20} color="#1876B8" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Status</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>
                                    {appointment.status === 'completed' ? 'Selesai' :
                                        appointment.status === 'cancelled' ? 'Dibatalkan' :
                                            appointment.status}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Medical Record Card */}
                {appointment.status === 'completed' && medicalRecord && (
                    <View style={styles.medicalRecordCard}>
                        {/* Card Header with Gradient Effect */}
                        <View style={styles.medicalHeaderGradient}>
                            <View style={styles.medicalHeaderIcon}>
                                <Ionicons name="medical" size={24} color="#fff" />
                            </View>
                            <View>
                                <Text style={styles.medicalTitle}>Rekam Medis</Text>
                                <Text style={styles.medicalSubtitle}>Hasil Konsultasi</Text>
                            </View>
                        </View>

                        {/* Diagnosis Section */}
                        <View style={styles.medicalSection}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionIconDiagnosis}>
                                    <Ionicons name="pulse" size={16} color="#f59e0b" />
                                </View>
                                <Text style={styles.sectionLabel}>Diagnosis</Text>
                            </View>
                            <View style={styles.diagnosisBox}>
                                <Text style={styles.diagnosisText}>{medicalRecord.diagnosis}</Text>
                            </View>
                        </View>

                        {/* Prescription Section */}
                        {medicalRecord.prescription && (
                            <View style={styles.medicalSection}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.sectionIconPrescription}>
                                        <Ionicons name="medkit" size={16} color="#3b82f6" />
                                    </View>
                                    <Text style={styles.sectionLabel}>Resep / Tindakan</Text>
                                </View>
                                <View style={styles.prescriptionBox}>
                                    <Text style={styles.prescriptionText}>{medicalRecord.prescription}</Text>
                                </View>
                            </View>
                        )}

                        {/* Notes Section */}
                        {medicalRecord.notes && (
                            <View style={styles.medicalSection}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.sectionIconNotes}>
                                        <Ionicons name="clipboard" size={16} color="#6b7280" />
                                    </View>
                                    <Text style={styles.sectionLabel}>Catatan Tambahan</Text>
                                </View>
                                <View style={styles.notesBox}>
                                    <Text style={styles.notesText}>{medicalRecord.notes}</Text>
                                </View>
                            </View>
                        )}

                        {/* Footer */}
                        <View style={styles.recordFooter}>
                            <View style={styles.footerDivider} />
                            <View style={styles.footerContent}>
                                <Ionicons name="time-outline" size={14} color="#94a3b8" />
                                <Text style={styles.recordDate}>
                                    Dibuat pada {new Date(medicalRecord.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* No Medical Record Message */}
                {appointment.status === 'completed' && !medicalRecord && (
                    <View style={styles.noRecordCard}>
                        <Ionicons name="document-outline" size={48} color="#94a3b8" />
                        <Text style={styles.noRecordText}>Rekam medis belum tersedia</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
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
        flex: 1,
        padding: 16,
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
        padding: 32,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0f172a',
        marginTop: 16,
    },
    errorMessage: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 8,
    },
    backToListButton: {
        marginTop: 24,
        backgroundColor: '#1876B8',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backToListText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    optometristCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    optometristAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 16,
    },
    avatarPlaceholder: {
        backgroundColor: '#e0f2fe',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1876B8',
    },
    optometristInfo: {
        flex: 1,
    },
    optometristName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 4,
    },
    optometristSpecialty: {
        fontSize: 14,
        color: '#64748b',
    },
    detailCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#16a34a',
    },
    medicalRecordCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#1876B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    medicalHeaderGradient: {
        backgroundColor: '#1876B8',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 14,
    },
    medicalHeaderIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    medicalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    medicalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    medicalSubtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    medicalSection: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    sectionIconDiagnosis: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fef3c7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionIconPrescription: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#dbeafe',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionIconNotes: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
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
    prescriptionBox: {
        backgroundColor: '#eff6ff',
        padding: 16,
        borderRadius: 14,
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6',
    },
    prescriptionText: {
        fontSize: 15,
        color: '#1e40af',
        lineHeight: 24,
        fontWeight: '500',
    },
    notesBox: {
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 14,
        borderLeftWidth: 4,
        borderLeftColor: '#9ca3af',
    },
    notesText: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 22,
        fontStyle: 'italic',
    },
    recordFooter: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        marginTop: 20,
    },
    footerDivider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginBottom: 16,
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    recordDate: {
        fontSize: 12,
        color: '#9ca3af',
    },
    noRecordCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    noRecordText: {
        fontSize: 15,
        color: '#94a3b8',
        marginTop: 12,
    },
});
