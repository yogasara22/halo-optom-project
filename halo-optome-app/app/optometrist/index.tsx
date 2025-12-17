import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { optometristAppService, ApiAppointment } from '../../services/optometristApp.service';
import { medicalService, MedicalHistory } from '../../services/medicalService';
import SearchBar from '../../components/optometrist/SearchBar';
import AppHeader from '../../components/optometrist/DashboardHeader';
import UpcomingAppointmentCard from '../../components/optometrist/UpcomingAppointmentCard';
import PatientScheduleCarousel, { PatientSchedule } from '../../components/optometrist/PatientScheduleCarousel';
import RecentHistoryCarousel, { PatientHistoryItem } from '../../components/optometrist/RecentHistoryCarousel';
import BottomNavigationBar from '../../components/optometrist/BottomNavigationBar';
import { API_BASE_URL } from '../../constants/config';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [search, setSearch] = useState('');
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [nextApt, setNextApt] = useState<ApiAppointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<PatientHistoryItem[]>([]);

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    } else {
      setChecking(false);

      // Fetch data from API
      const fetchData = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const [appointmentsData, next] = await Promise.all([
            optometristAppService.getMyAppointments(),
            optometristAppService.getMyNextAppointment()
          ]);

          setAppointments(appointmentsData);
          setNextApt(next);

          const patientIds = Array.from(new Set(appointmentsData.map(a => a.patient?.id).filter(Boolean))) as string[];
          const limitedPatientIds = patientIds.slice(0, 5);
          const historiesByPatient = await Promise.all(
            limitedPatientIds.map(pid => medicalService.getPatientMedicalRecords(pid))
          );
          const allHistories: MedicalHistory[] = ([] as MedicalHistory[]).concat(...historiesByPatient);
          const patientMap = new Map<string, { name: string; avatar?: string; appts: ApiAppointment[] }>();
          appointmentsData.forEach(a => {
            const id = a.patient?.id;
            if (!id) return;
            const existing = patientMap.get(id);
            const appts = existing ? existing.appts.concat([a]) : [a];
            patientMap.set(id, { name: a.patient!.name, avatar: a.patient!.avatar_url, appts });
          });
          const sortedHistories = allHistories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const base = API_BASE_URL.replace(/\/?api$/, '');
          const items: PatientHistoryItem[] = sortedHistories.map(h => {
            const info = patientMap.get(h.patientId);
            const apptSameDay = info?.appts.find(ap => ap.date === h.date);
            const time = apptSameDay ? (apptSameDay.start_time?.slice(0, 5) + (apptSameDay.end_time ? ` - ${apptSameDay.end_time.slice(0, 5)}` : '')) : '00:00';
            const svc = apptSameDay ? (apptSameDay.type === 'homecare' ? 'Homecare Pemeriksaan' : (apptSameDay.method === 'video' ? 'Konsultasi Video' : 'Konsultasi Chat')) : 'Pemeriksaan Mata';
            let pPhoto = info?.avatar;
            if (pPhoto && !/^https?:\/\//i.test(pPhoto)) pPhoto = base + pPhoto;
            if (pPhoto && /localhost|127\.0\.0\.1/.test(pPhoto)) pPhoto = pPhoto.replace(/^https?:\/\/[^/]+/, base);
            return {
              id: h.id,
              name: info?.name || 'Pasien',
              photo: pPhoto ? { uri: pPhoto } : require('../../assets/images/avatar.png'),
              appointmentDate: new Date(h.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
              appointmentTime: time,
              serviceType: svc,
              diagnosis: h.condition,
            };
          });
          setHistoryItems(items);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Gagal memuat data. Silakan coba lagi.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  if (checking || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 16, color: '#64748b', marginBottom: 8 }}>
          Memuat dashboard...
        </Text>
        <ActivityIndicator size="large" color="#1876B8" />
      </View>
    );
  }

  // Fungsi untuk mengkonversi status dari API ke format yang diharapkan oleh komponen
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
      case 'cancelled':
      case 'CANCELLED':
      default:
        return 'Menunggu';
    }
  };

  // Gunakan data dari API jika tersedia, jika tidak tampilkan data kosong
  const base = API_BASE_URL.replace(/\/?api$/, '');
  const patientSchedules = appointments.length > 0
    ? appointments.map(apt => ({
      id: apt.id,
      name: apt.patient?.name || 'Pasien',
      photo: (() => {
        let url = apt.patient?.avatar_url;
        if (url && !/^https?:\/\//i.test(url)) url = base + url;
        if (url && /localhost|127\.0\.0\.1/.test(url)) url = url.replace(/^https?:\/\/[^/]+/, base);
        return url ? { uri: url } : require('../../assets/images/avatar.png');
      })(),
      appointmentDate: new Date(apt.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      appointmentTime: apt.start_time?.slice(0, 5) + (apt.end_time ? ` - ${apt.end_time.slice(0, 5)}` : ''),
      serviceType: apt.type === 'homecare' ? 'Homecare Pemeriksaan' : (apt.method === 'video' ? 'Konsultasi Video' : 'Konsultasi Chat'),
      status: convertStatus(apt.status),
    }))
    : [];

  const recentHistories = historyItems.length > 0 ? historyItems : [];

  const upcoming = nextApt ? {
    id: nextApt.id,
    name: nextApt.patient?.name || 'Pasien',
    photo: nextApt.patient?.avatar_url ? { uri: nextApt.patient.avatar_url } : require('../../assets/images/avatar.png'),
    appointmentDate: new Date(nextApt.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    appointmentTime: nextApt.start_time?.slice(0, 5) + (nextApt.end_time ? ` - ${nextApt.end_time.slice(0, 5)}` : ''),
    serviceType: nextApt.type === 'homecare' ? 'Homecare Pemeriksaan' : (nextApt.method === 'video' ? 'Konsultasi Video' : 'Konsultasi Chat'),
    status: convertStatus(nextApt.status),
  } : (patientSchedules.length > 0 ? patientSchedules[0] : null);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader username={user.name} avatarUrl={user.avatar_url} />
        <SearchBar value={search} onChangeText={setSearch} />

        <Text style={styles.sectionTitle}>Janji Temu Terdekat</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#1876B8" />
        ) : error ? (
          <Text style={{ color: '#ef4444', marginBottom: 12 }}>{error}</Text>
        ) : upcoming ? (
          <UpcomingAppointmentCard appointment={upcoming} />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={{ color: '#64748b', textAlign: 'center' }}>Tidak ada janji temu mendatang.</Text>
          </View>
        )}

        {/* Heading + Button Lihat Semua */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daftar Jadwal Pasien</Text>
          <Text
            style={styles.viewAllButton}
            onPress={() => router.push('/schedule')}
          >
            Lihat Semua
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color="#1876B8" />
        ) : error ? (
          <Text style={{ color: '#ef4444', marginBottom: 12 }}>{error}</Text>
        ) : (
          <PatientScheduleCarousel
            data={patientSchedules.slice(0, 3)} // hanya tampilkan 3 jadwal
            onCardPress={(item: PatientSchedule) => router.push(`/patient/${item.id}`)}
          />
        )}

        {/* Heading + Button Lihat Semua Riwayat */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Riwayat Pasien Terbaru</Text>
          <Text
            style={styles.viewAllButton}
            onPress={() => router.push('/history')}
          >
            Lihat Semua
          </Text>
        </View>

        <RecentHistoryCarousel
          data={recentHistories.slice(0, 3)} // hanya tampilkan 3 riwayat
          onCardPress={(item: PatientHistoryItem) => console.log('Riwayat pasien:', item)}
        />

      </ScrollView>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNavigationBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1876B8',
  },
  emptyCard: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  }
});
