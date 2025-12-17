import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { optometristAppService, ApiAppointment } from '../../services/optometristApp.service';
import BottomNavigationBar from '../../components/optometrist/BottomNavigationBar';

export default function HomecarePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await optometristAppService.getHomecareAppointments();
        setAppointments(list);
      } catch (e) {
        setError('Gagal memuat homecare');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const convertStatus = (
    apiStatus: 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  ): 'Menunggu' | 'Berlangsung' | 'Selesai' => {
    switch (apiStatus) {
      case 'pending':
      case 'PENDING':
      case 'confirmed':
      case 'CONFIRMED':
        return 'Menunggu';
      case 'ongoing':
        return 'Berlangsung';
      case 'completed':
      case 'COMPLETED':
        return 'Selesai';
      default:
        return 'Menunggu';
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Homecare</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#1876B8" />
        ) : error ? (
          <Text style={{ color: '#ef4444' }}>{error}</Text>
        ) : appointments.length === 0 ? (
          <Text style={{ color: '#6B7280' }}>Tidak ada jadwal homecare</Text>
        ) : (
          appointments.map(a => (
            <View key={a.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.identity}>
                  <Image source={a.patient?.avatar_url ? { uri: a.patient.avatar_url } : require('../../assets/images/avatar.png')} style={styles.avatar} />
                  <View>
                    <Text style={styles.cardTitle}>{a.patient?.name || 'Pasien'}</Text>
                    <Text style={styles.cardMeta}>{new Date(a.date).toLocaleDateString('id-ID')} • {a.start_time.slice(0,5)}</Text>
                  </View>
                </View>
                <Text style={[styles.methodBadge, styles.methodHomecare]}>Homecare Pemeriksaan</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={[styles.statusChip, convertStatus(a.status) === 'Selesai' ? styles.chipDone : convertStatus(a.status) === 'Berlangsung' ? styles.chipOngoing : styles.chipPending]}>
                  {convertStatus(a.status)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <BottomNavigationBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', marginVertical: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  identity: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  methodBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, fontSize: 12, fontWeight: '600' },
  methodHomecare: { backgroundColor: '#FDE68A', color: '#92400E' },
  cardFooter: { marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, fontSize: 12, fontWeight: '700' },
  chipPending: { backgroundColor: '#FEF3C7', color: '#92400E' },
  chipOngoing: { backgroundColor: '#E0E7FF', color: '#4338CA' },
  chipDone: { backgroundColor: '#DCFCE7', color: '#166534' },
});
