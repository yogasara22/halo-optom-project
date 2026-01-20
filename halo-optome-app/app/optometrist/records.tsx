import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { medicalService, MedicalRecord } from '../../services/medicalService';
import { Calendar, FileText, User, ChevronRight, Stethoscope } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InitialAvatar from '../../components/common/InitialAvatar';

export default function OptometristRecordsScreen() {
    const router = useRouter();
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecords = useCallback(async () => {
        try {
            setError(null);
            const data = await medicalService.getOptometristMedicalRecords();
            setRecords(data);
        } catch (err: any) {
            console.error('Error fetching medical records:', err);
            setError('Gagal memuat rekam medis. Silakan coba lagi.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchRecords();
    }, [fetchRecords]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.loadingText}>Memuat rekam medis...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Stethoscope size={28} color="#2563EB" />
                    <Text style={styles.title}>Rekam Medis Pasien</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchRecords}>
                        <Text style={styles.retryButtonText}>Coba Lagi</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Stethoscope size={28} color="#2563EB" />
                <View>
                    <Text style={styles.title}>Rekam Medis</Text>
                    <Text style={styles.subtitle}>Riwayat rekam medis yang Anda buat</Text>
                </View>
            </View>

            {records.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <FileText size={64} color="#cbd5e1" />
                    <Text style={styles.emptyTitle}>Belum ada rekam medis</Text>
                    <Text style={styles.emptySubtitle}>
                        Rekam medis yang Anda buat setelah konsultasi akan muncul di sini
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={records}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#2563EB']}
                        />
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => router.push(`/records/detail?id=${item.id}`)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.cardContent}>
                                <View style={styles.patientSection}>
                                    <InitialAvatar
                                        name={item.patient?.name || 'Pasien'}
                                        avatarUrl={item.patient?.avatar_url}
                                        size={44}
                                        role="patient"
                                        style={styles.avatarContainer}
                                    />
                                    <View style={styles.patientInfo}>
                                        <Text style={styles.patientName} numberOfLines={1}>
                                            {item.patient?.name || 'Pasien'}
                                        </Text>
                                        <View style={styles.dateContainer}>
                                            <Calendar size={12} color="#64748b" />
                                            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                                        </View>
                                    </View>
                                    <ChevronRight size={20} color="#94a3b8" />
                                </View>

                                {/* Diagnosis Preview */}
                                <View style={styles.diagnosisSection}>
                                    <Text style={styles.diagnosisLabel}>Diagnosis:</Text>
                                    <Text style={styles.diagnosis} numberOfLines={2}>
                                        {item.diagnosis || 'Tidak ada diagnosis'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
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
        gap: 12,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: '#64748b',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    errorText: {
        fontSize: 16,
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#2563EB',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#334155',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    cardContent: {
        padding: 16,
    },
    patientSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        // backgroundColor removed to allow InitialAvatar to set its own color
    },
    patientInfo: {
        flex: 1,
        marginLeft: 12,
    },
    patientName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    date: {
        fontSize: 12,
        color: '#64748b',
    },
    diagnosisSection: {
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        padding: 12,
        marginTop: 4,
    },
    diagnosisLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    diagnosis: {
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
    },
});
