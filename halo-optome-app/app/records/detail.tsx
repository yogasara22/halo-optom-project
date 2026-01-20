import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { medicalService, MedicalRecord } from '../../services/medicalService';
import { Calendar, User, Stethoscope, Pill, FileText, ArrowLeft, AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MedicalRecordDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecordDetail = async () => {
      if (!id) {
        setError('ID rekam medis tidak valid');
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const data = await medicalService.getMedicalRecordById(id as string);
        setRecord(data);
      } catch (err: any) {
        console.error('Error fetching record detail:', err);
        setError('Gagal memuat detail rekam medis');
      } finally {
        setLoading(false);
      }
    };

    fetchRecordDetail();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Memuat detail rekam medis...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !record) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Rekam Medis</Text>
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Data tidak ditemukan'}</Text>
          <TouchableOpacity style={styles.backButtonError} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Rekam Medis</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Card */}
        <View style={styles.dateCard}>
          <Calendar size={20} color="#2563EB" />
          <Text style={styles.dateText}>{formatDate(record.created_at)}</Text>
        </View>

        {/* Optometrist Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Optometris</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.optometristName}>{record.optometrist?.name || '-'}</Text>
            {record.optometrist?.email && (
              <Text style={styles.optometristEmail}>{record.optometrist.email}</Text>
            )}
          </View>
        </View>

        {/* Diagnosis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Stethoscope size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Diagnosis</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              {record.diagnosis || 'Tidak ada diagnosis'}
            </Text>
          </View>
        </View>

        {/* Prescription */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Pill size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Resep / Tindakan</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              {record.prescription || 'Tidak ada resep'}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {record.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color="#2563EB" />
              <Text style={styles.sectionTitle}>Catatan Tambahan</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>{record.notes}</Text>
            </View>
          </View>
        )}

        {/* Spacer for bottom */}
        <View style={{ height: 32 }} />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
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
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  backButtonError: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optometristName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  optometristEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  infoText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
});
