import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { optometristAppService, ApiSchedule, ApiAppointment } from '../../services/optometristApp.service';
import SearchBar from '../../components/optometrist/SearchBar';
import BottomNavigationBar from '../../components/optometrist/BottomNavigationBar';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [schedules, setSchedules] = useState<ApiSchedule[]>([]);
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [sch, apt] = await Promise.all([
          user?.id ? optometristAppService.getMySchedules(user.id) : Promise.resolve([]),
          optometristAppService.getMyAppointments()
        ]);
        setSchedules(sch);
        setAppointments(apt);
      } catch (e) {
        setError('Gagal memuat jadwal');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const filteredAppointments = appointments.filter(a =>
    !search || (a.patient?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const dayMap: Record<string, string> = {
    monday: 'Senin', tuesday: 'Selasa', wednesday: 'Rabu', thursday: 'Kamis', friday: 'Jumat', saturday: 'Sabtu', sunday: 'Minggu',
    Senin: 'Senin', Selasa: 'Selasa', Rabu: 'Rabu', Kamis: 'Kamis', Jumat: 'Jumat', Sabtu: 'Sabtu', Minggu: 'Minggu'
  };

  const toIndoDay = (d?: string) => {
    if (!d) return '-';
    const key = d.toLowerCase();
    return dayMap[d] || dayMap[key] || d;
  };

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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Jadwal Saya</Text>
        <SearchBar value={search} onChangeText={setSearch} />
        {loading ? (
          <ActivityIndicator size="small" color="#1876B8" />
        ) : error ? (
          <Text style={{ color: '#ef4444' }}>{error}</Text>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Jadwal Mingguan</Text>
            {schedules.length === 0 ? (
              <Text style={styles.empty}>Belum ada jadwal</Text>
            ) : (
              schedules.map(s => (
                <View key={s.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{toIndoDay(s.day_of_week)}</Text>
                    <Text style={[styles.statusBadge, s.is_active ? styles.statusActive : styles.statusInactive]}>
                      {s.is_active ? 'Aktif' : 'Nonaktif'}
                    </Text>
                  </View>
                  <Text style={styles.cardSubtitle}>Pukul {s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</Text>
                </View>
              ))
            )}

            <Text style={styles.sectionTitle}>Daftar Janji Temu</Text>
            {filteredAppointments.length === 0 ? (
              <Text style={styles.empty}>Tidak ada janji temu</Text>
            ) : (
              filteredAppointments.map(a => (
                <View key={a.id} style={styles.cardAppointment}>
                  <View style={styles.appHeader}>
                    <View style={styles.appIdentity}>
                      <Image source={a.patient?.avatar_url ? { uri: a.patient.avatar_url } : require('../../assets/images/avatar.png')} style={styles.avatar} />
                      <View>
                        <Text style={styles.appName}>{a.patient?.name || 'Pasien'}</Text>
                        <Text style={styles.appMeta}>{new Date(a.date).toLocaleDateString('id-ID')} • {a.start_time.slice(0,5)}</Text>
                      </View>
                    </View>
                    <Text style={[styles.methodBadge, a.type === 'homecare' ? styles.methodHomecare : a.method === 'video' ? styles.methodVideo : styles.methodChat]}>
                      {a.type === 'homecare' ? 'Homecare Pemeriksaan' : (a.method === 'video' ? 'Konsultasi Video' : 'Konsultasi Chat')}
                    </Text>
                  </View>
                  <View style={styles.appFooter}>
                    <Text style={[styles.statusChip, convertStatus(a.status) === 'Selesai' ? styles.chipDone : convertStatus(a.status) === 'Berlangsung' ? styles.chipOngoing : styles.chipPending]}>
                      {convertStatus(a.status)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
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
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginVertical: 14 },
  empty: { color: '#6B7280', marginVertical: 8 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginVertical: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSubtitle: { fontSize: 14, color: '#374151', marginTop: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, fontSize: 12, fontWeight: '600' },
  statusActive: { backgroundColor: '#DCFCE7', color: '#166534' },
  statusInactive: { backgroundColor: '#FEE2E2', color: '#991B1B' },
  cardAppointment: { backgroundColor: '#fff', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', marginVertical: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appIdentity: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  appName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  appMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  methodBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, fontSize: 12, fontWeight: '600' },
  methodVideo: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  methodChat: { backgroundColor: '#E0F2FE', color: '#0369A1' },
  methodHomecare: { backgroundColor: '#FDE68A', color: '#92400E' },
  appFooter: { marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, fontSize: 12, fontWeight: '700' },
  chipPending: { backgroundColor: '#FEF3C7', color: '#92400E' },
  chipOngoing: { backgroundColor: '#E0E7FF', color: '#4338CA' },
  chipDone: { backgroundColor: '#DCFCE7', color: '#166534' },
});
