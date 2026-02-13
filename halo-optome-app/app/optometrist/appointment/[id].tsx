import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { optometristAppService, ApiAppointment } from '../../../services/optometristApp.service';
import { API_BASE_URL } from '../../../constants/config';
import InitialAvatar from '../../../components/common/InitialAvatar';

export default function AppointmentDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [appointment, setAppointment] = useState<ApiAppointment | null>(null);
    const [loading, setLoading] = useState(true);

    // Reschedule State
    const [isRescheduleModalVisible, setRescheduleModalVisible] = useState(false);
    const [newDate, setNewDate] = useState(''); // YYYY-MM-DD
    const [newTime, setNewTime] = useState(''); // HH:MM
    const [dateObj, setDateObj] = useState<Date>(new Date());
    const [timeObj, setTimeObj] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Completion State
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            if (typeof id === 'string') {
                const data = await optometristAppService.getAppointmentDetail(id);
                setAppointment(data);
                setNewDate(data.date);
                setNewTime(data.start_time?.slice(0, 5) || '');

                // Set date object
                const parts = data.date.split('-');
                setDateObj(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));

                // Set time object
                if (data.start_time) {
                    const timeParts = data.start_time.split(':');
                    const timeDate = new Date();
                    timeDate.setHours(Number(timeParts[0]), Number(timeParts[1]));
                    setTimeObj(timeDate);
                }
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal memuat detail janji temu');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!appointment) return;
        try {
            setLoading(true);
            await optometristAppService.updateAppointmentStatus(appointment.id, 'confirmed');
            Alert.alert('Sukses', 'Janji temu berhasil disetujui');
            fetchDetail(); // Refresh
        } catch (err) {
            Alert.alert('Gagal', 'Tidak dapat menyetujui janji temu');
        } finally {
            setLoading(false);
        }
    };

    const handleRescheduleSubmit = async () => {
        if (!appointment) return;
        try {
            setLoading(true);
            await optometristAppService.rescheduleAppointment(appointment.id, newDate, newTime);
            setRescheduleModalVisible(false);
            setShowDatePicker(false);
            setShowTimePicker(false);
            Alert.alert('Sukses', 'Jadwal berhasil diperbarui');
            fetchDetail();
        } catch (err) {
            Alert.alert('Gagal', 'Tidak dapat menjadwalkan ulang');
        } finally {
            setLoading(false);
        }
    };

    const handleEndConsultation = () => {
        Alert.alert(
            'Akhiri Konsultasi',
            'Apakah Anda yakin ingin mengakhiri sesi Homecare ini? Anda akan diarahkan untuk mengisi rekam medis pasien.',
            [
                {
                    text: 'Batal',
                    style: 'cancel',
                },
                {
                    text: 'Akhiri',
                    style: 'destructive',
                    onPress: completeConsultation,
                },
            ]
        );
    };

    const completeConsultation = async () => {
        if (!appointment || !appointment.patient) {
            if (appointment && !appointment.patient) Alert.alert('Error', 'Data pasien tidak valid');
            return;
        }

        try {
            setCompleting(true);
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Error', 'Tidak ada token autentikasi');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/appointments/${appointment.id}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                Alert.alert('Berhasil', 'Konsultasi selesai', [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate to medical record form
                            router.push({
                                pathname: '/optometrist/medicalRecordForm',
                                params: {
                                    appointmentId: appointment.id,
                                    patientId: appointment.patient!.id,
                                    patientName: appointment.patient!.name,
                                },
                            });
                        },
                    },
                ]);
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Gagal mengakhiri konsultasi');
            }
        } catch (e: any) {
            console.error('Error completing consultation:', e);
            Alert.alert('Error', 'Terjadi kesalahan saat mengakhiri konsultasi');
        } finally {
            setCompleting(false);
        }
    };

    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const formatTime = (date: Date) => {
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    };

    if (loading && !appointment) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    if (!appointment) {
        return (
            <View style={styles.container}>
                <Text>Data tidak ditemukan</Text>
            </View>
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
                <Text style={styles.headerTitle}>Detail Janji Temu</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Patient Card */}
                <View style={styles.card}>
                    <View style={styles.profileRow}>
                        <InitialAvatar
                            name={appointment.patient?.name || 'Pasien'}
                            avatarUrl={avatarUrl}
                            size={60}
                            role="patient"
                            style={styles.avatar}
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.patientName}>{appointment.patient?.name || 'Pasien'}</Text>
                            <Text style={styles.patientSub}>Pasien</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: appointment.status === 'confirmed' ? '#dcfce7' : '#f1f5f9' }]}>
                            <Text style={[styles.statusText, { color: appointment.status === 'confirmed' ? '#16a34a' : '#64748b' }]}>
                                {appointment.status === 'confirmed' ? 'Disetujui' : appointment.status === 'pending' ? 'Menunggu' : appointment.status}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Appointment Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data Janji Temu</Text>
                    <View style={styles.card}>
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={20} color="#64748b" />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Tanggal</Text>
                                <Text style={styles.detailValue}>
                                    {new Date(appointment.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Ionicons name="time-outline" size={20} color="#64748b" />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Waktu</Text>
                                <Text style={styles.detailValue}>{appointment.start_time?.slice(0, 5)} WIB</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Ionicons name="videocam-outline" size={20} color="#64748b" />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Layanan</Text>
                                <Text style={styles.detailValue}>
                                    {appointment.type === 'homecare' ? 'Homecare Visit' : `Konsultasi Online (${appointment.method})`}
                                </Text>
                            </View>
                        </View>
                        {/* New Location Details (if Homecare) */}
                        {appointment.type === 'homecare' && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.detailRow}>
                                    <Ionicons name="location-outline" size={20} color="#64748b" />
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>Lokasi</Text>
                                        <Text style={styles.detailValue}>{appointment.location || '-'}</Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    {appointment.status === 'pending' && (
                        <TouchableOpacity
                            style={[styles.btnPrimary, loading && styles.btnDisabled]}
                            onPress={handleAccept}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.btnPrimaryText}>Setujui Janji Temu</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Button Akhiri Konsultasi Special for Homecare & Confirmed */}
                    {appointment.type === 'homecare' && (appointment.status === 'confirmed' || appointment.status === 'ongoing') && (
                        <TouchableOpacity
                            style={[styles.btnDanger, completing && styles.btnDisabled]}
                            onPress={handleEndConsultation}
                            disabled={completing}
                        >
                            {completing ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.btnDangerText}>Akhiri Konsultasi & Isi Rekam Medis</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.btnSecondary, (appointment.status === 'confirmed' || appointment.status === 'ongoing') && styles.btnDisabled]}
                        onPress={() => (appointment.status !== 'confirmed' && appointment.status !== 'ongoing') && setRescheduleModalVisible(true)}
                        activeOpacity={(appointment.status === 'confirmed' || appointment.status === 'ongoing') ? 1 : 0.7}
                    >
                        <Text style={[styles.btnSecondaryText, (appointment.status === 'confirmed' || appointment.status === 'ongoing') && styles.btnDisabledText]}>Jadwalkan Ulang</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Reschedule Modal */}
            <Modal transparent visible={isRescheduleModalVisible} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Jadwalkan Ulang</Text>

                        <Text style={styles.inputLabel}>Tanggal</Text>
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar-outline" size={20} color="#64748b" />
                            <Text style={styles.pickerButtonText}>
                                {newDate || 'Pilih Tanggal'}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={dateObj}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    if (Platform.OS === 'android') {
                                        setShowDatePicker(false);
                                    }
                                    if (selectedDate) {
                                        setDateObj(selectedDate);
                                        setNewDate(formatDate(selectedDate));
                                    }
                                }}
                            />
                        )}

                        <Text style={styles.inputLabel}>Waktu</Text>
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Ionicons name="time-outline" size={20} color="#64748b" />
                            <Text style={styles.pickerButtonText}>
                                {newTime || 'Pilih Waktu'}
                            </Text>
                        </TouchableOpacity>

                        {showTimePicker && (
                            <DateTimePicker
                                value={timeObj}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                                onChange={(event, selectedTime) => {
                                    if (Platform.OS === 'android') {
                                        setShowTimePicker(false);
                                    }
                                    if (selectedTime) {
                                        setTimeObj(selectedTime);
                                        setNewTime(formatTime(selectedTime));
                                    }
                                }}
                            />
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalBtnCancel}
                                onPress={() => {
                                    setRescheduleModalVisible(false);
                                    setShowDatePicker(false);
                                    setShowTimePicker(false);
                                }}
                            >
                                <Text style={styles.modalBtnCancelText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtnSubmit} onPress={handleRescheduleSubmit}>
                                <Text style={styles.modalBtnSubmitText}>Simpan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        // backgroundColor removed to allow InitialAvatar to set its own color
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    patientName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    patientSub: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    detailContent: {
        marginLeft: 16,
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 15,
        color: '#0f172a',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginLeft: 36,
    },
    actions: {
        gap: 12,
    },
    btnPrimary: {
        backgroundColor: '#16a34a',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    btnPrimaryText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    btnDanger: {
        backgroundColor: '#dc2626',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    btnDangerText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    btnSecondary: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    btnSecondaryText: {
        color: '#0f172a',
        fontWeight: '600',
        fontSize: 16,
    },
    btnDisabled: {
        backgroundColor: '#f1f5f9',
        borderColor: '#e2e8f0',
    },
    btnDisabledText: {
        color: '#94a3b8',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
        marginTop: 8,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    pickerButtonText: {
        fontSize: 14,
        color: '#0f172a',
        fontWeight: '500',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalBtnCancel: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
    },
    modalBtnCancelText: {
        color: '#64748b',
        fontWeight: '600',
    },
    modalBtnSubmit: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: '#16a34a',
        alignItems: 'center',
    },
    modalBtnSubmitText: {
        color: '#fff',
        fontWeight: '600',
    },
});
