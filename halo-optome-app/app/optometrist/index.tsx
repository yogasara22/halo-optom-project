import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { optometristAppService, ApiAppointment } from '../../services/optometristApp.service';
import { medicalService, MedicalHistory } from '../../services/medicalService';
import CommissionCard from '../../components/optometrist/CommissionCard';
import AppHeader from '../../components/optometrist/DashboardHeader';
import UpcomingAppointmentCard from '../../components/optometrist/UpcomingAppointmentCard';
import PatientScheduleCarousel, { PatientSchedule } from '../../components/optometrist/PatientScheduleCarousel';
import RecentHistoryCarousel, { PatientHistoryItem } from '../../components/optometrist/RecentHistoryCarousel';
import { API_BASE_URL } from '../../constants/config';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [nextApt, setNextApt] = useState<ApiAppointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<PatientHistoryItem[]>([]);
  const [commission, setCommission] = useState<{ balance: number; formatted: string }>({ balance: 0, formatted: 'Rp 0' });
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      // ... existing checks ...
      if (!user) {
        router.replace('/auth/login');
        return;
      }

      setChecking(false);

      const fetchData = async () => {
        try {
          // ... existing logic ...
          setIsLoading(true);
          setError(null);

          let appointmentsData: ApiAppointment[] = [];
          let next: ApiAppointment | null = null;
          let commData = { balance: 0, formatted: 'Rp 0' };
          let unread = 0;

          try {
            commData = await optometristAppService.getCommissionBalance();
            setCommission(commData);
          } catch (e) {
            console.log('Failed to fetch commission:', e);
          }

          try {
            unread = await optometristAppService.getUnreadChatCount();
            setUnreadCount(unread);
          } catch (e) {
            console.log('Failed to fetch unread count:', e);
          }

          try {
            appointmentsData = await optometristAppService.getMyAppointments();
            setAppointments(appointmentsData || []);
          } catch (e) {
            console.log('Failed to fetch appointments:', e);
          }

          try {
            next = await optometristAppService.getMyNextAppointment();
            setNextApt(next);
          } catch (e) {
            console.log('Failed to fetch next appointment:', e);
          }

          // ... rest of processing ...

          const patientIds = Array.from(new Set(appointmentsData.map(a => a.patient?.id).filter(Boolean))) as string[];
          const limitedPatientIds = patientIds.slice(0, 5);

          const historiesByPatient = await Promise.all(
            limitedPatientIds.map(async pid => {
              try {
                return await medicalService.getPatientMedicalRecords(pid);
              } catch (e) {
                return [];
              }
            })
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
            // ... existing mapping ...
            if (!h) return null;
            const pid = h.patientId;
            const info = patientMap.get(pid);
            const apptSameDay = info?.appts.find(ap => ap.date === h.date);
            const time = apptSameDay ? (apptSameDay.start_time?.slice(0, 5) + (apptSameDay.end_time ? ` - ${apptSameDay.end_time.slice(0, 5)}` : '')) : '00:00';
            const svc = apptSameDay ? (apptSameDay.type === 'homecare' ? 'Homecare Pemeriksaan' : (apptSameDay.method === 'video' ? 'Konsultasi Video' : 'Konsultasi Chat')) : 'Pemeriksaan Mata';

            let pPhoto = info?.avatar;
            if (pPhoto && !/^https?:\/\//i.test(pPhoto)) pPhoto = base + pPhoto;
            if (pPhoto && /localhost|127\.0\.0\.1/.test(pPhoto)) pPhoto = pPhoto.replace(/^https?:\/\/[^/]+/, base);

            return {
              id: h.id,
              name: info?.name || 'Pasien',
              photo: pPhoto || undefined, // Pass string URL or undefined for InitialAvatar
              appointmentDate: new Date(h.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
              appointmentTime: time,
              serviceType: svc,
              diagnosis: h.condition,
            };
          }).filter(Boolean) as PatientHistoryItem[];

          setHistoryItems(items);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Gagal memuat data. Silakan coba lagi.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [user])
  );

  // ... existing helpers ...
  const convertStatus = (
    apiStatus: 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  ): 'Menunggu' | 'Disetujui' | 'Berlangsung' | 'Selesai' => {
    switch (apiStatus) {
      case 'pending':
      case 'PENDING':
        return 'Menunggu';
      case 'confirmed':
      case 'CONFIRMED':
        return 'Disetujui';
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

  const base = API_BASE_URL.replace(/\/?api$/, '');

  // Filter only active appointments (exclude completed and cancelled)
  const activeAppointments = appointments.filter(
    apt => apt.status !== 'completed' && apt.status !== 'cancelled'
  );

  // Filter completed appointments for Riwayat Pasien Terbaru
  const completedAppointments = appointments.filter(
    apt => apt.status === 'completed'
  );

  const patientSchedules = activeAppointments.length > 0
    ? activeAppointments.map(apt => ({
      id: apt.id,
      name: apt.patient?.name || 'Pasien',
      photo: (() => {
        let url = apt.patient?.avatar_url;
        if (url && !/^https?:\/\//i.test(url)) url = base + url;
        if (url && /localhost|127\.0\.0\.1/.test(url)) url = url.replace(/^https?:\/\/[^/]+/, base);
        return url ? { uri: url } : null;
      })(),
      appointmentDate: new Date(apt.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      appointmentTime: apt.start_time?.slice(0, 5) + (apt.end_time ? ` - ${apt.end_time.slice(0, 5)}` : ''),
      serviceType: apt.type === 'homecare' ? 'Homecare Pemeriksaan' : (apt.method === 'video' ? 'Konsultasi Video' : 'Konsultasi Chat'),
      status: convertStatus(apt.status),
    }))
    : [];

  // Create Riwayat from completed appointments (fallback if no medical history)
  const completedPatientHistories: PatientHistoryItem[] = completedAppointments.map(apt => {
    let url = apt.patient?.avatar_url;
    if (url && !/^https?:\/\//i.test(url)) url = base + url;
    if (url && /localhost|127\.0\.0\.1/.test(url)) url = url.replace(/^https?:\/\/[^/]+/, base);

    return {
      id: apt.id,
      name: apt.patient?.name || 'Pasien',
      photo: url || undefined, // Pass string URL or undefined for InitialAvatar
      appointmentDate: new Date(apt.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      appointmentTime: apt.start_time?.slice(0, 5) + (apt.end_time ? ` - ${apt.end_time.slice(0, 5)}` : ''),
      serviceType: apt.type === 'homecare' ? 'Homecare Pemeriksaan' : (apt.method === 'video' ? 'Konsultasi Video' : 'Konsultasi Chat'),
      diagnosis: 'Konsultasi Selesai',
    };
  });

  // Combine medical history with completed appointments (prefer medical history if exists)
  const recentHistories = historyItems.length > 0
    ? historyItems
    : completedPatientHistories;

  const upcoming = (nextApt && nextApt.status !== 'pending') ? {
    id: nextApt.id,
    name: nextApt.patient?.name || 'Pasien',
    photo: (() => {
      let url = nextApt.patient?.avatar_url;
      if (url && !/^https?:\/\//i.test(url)) url = base + url;
      if (url && /localhost|127\.0\.0\.1/.test(url)) url = url.replace(/^https?:\/\/[^/]+/, base);
      return url ? { uri: url } : null;
    })(),
    appointmentDate: new Date(nextApt.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    appointmentTime: nextApt.start_time?.slice(0, 5) + (nextApt.end_time ? ` - ${nextApt.end_time.slice(0, 5)}` : ''),
    serviceType: nextApt.type === 'homecare' ? 'Homecare Pemeriksaan' : (nextApt.method === 'video' ? 'Konsultasi Video' : 'Konsultasi Chat'),
    status: convertStatus(nextApt.status),
  } : null;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader username={user?.name || 'Optometris'} avatarUrl={user?.avatar_url} />

        <CommissionCard
          balanceFormatted={commission.formatted}
          onPayout={() => router.push('/optometrist/withdrawForm')}
          onViewHistory={() => router.push('/optometrist/withdrawHistory')}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daftar Jadwal Pasien</Text>
          <Text
            style={styles.viewAllButton}
            onPress={() => router.push('/optometrist/schedule')}
          >
            Lihat Semua
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color="#1876B8" />
        ) : error ? (
          <Text style={{ color: '#ef4444', marginBottom: 12 }}>{error}</Text>
        ) : patientSchedules.length > 0 ? (
          <PatientScheduleCarousel
            data={patientSchedules.slice(0, 3)}
            onCardPress={(item: PatientSchedule) => router.push(`/optometrist/appointment/${item.id}`)}
          />
        ) : (
          <View style={styles.emptyCardModern}>
            <View style={styles.emptyIconContainerBlue}>
              <Ionicons name="people-outline" size={32} color="#fff" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Jadwal Pasien</Text>
            <Text style={styles.emptySubtitle}>Daftar jadwal pasien akan tampil di sini</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Janji Temu Terdekat</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#1876B8" />
        ) : error ? (
          <Text style={{ color: '#ef4444', marginBottom: 12 }}>{error}</Text>
        ) : upcoming ? (
          <UpcomingAppointmentCard
            appointment={upcoming}
            unreadCount={unreadCount}
            onChatPress={() => router.push(`/consultation/chat?id=${upcoming.id}`)}
          />
        ) : (
          <View style={styles.emptyCardModern}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="calendar-outline" size={32} color="#1876B8" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Janji Temu</Text>
            <Text style={styles.emptySubtitle}>Janji temu Anda dengan pasien akan muncul di sini</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Riwayat Pasien Terbaru</Text>
          <Text
            style={styles.viewAllButton}
            onPress={() => router.push('/optometrist/history')}
          >
            Lihat Semua
          </Text>
        </View>

        {recentHistories.length > 0 ? (
          <RecentHistoryCarousel
            data={recentHistories.slice(0, 3)}
            onCardPress={(item: PatientHistoryItem) => console.log('Riwayat pasien:', item)}
            onDetailPress={(item: PatientHistoryItem) => router.push(`/optometrist/patient/${item.id}`)}
          />
        ) : (
          <View style={styles.emptyCardModern}>
            <View style={styles.emptyIconContainerGreen}>
              <Ionicons name="document-text-outline" size={32} color="#fff" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Riwayat</Text>
            <Text style={styles.emptySubtitle}>Riwayat pasien yang sudah selesai akan muncul di sini</Text>
          </View>
        )}

      </ScrollView>
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
    marginBottom: 8,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
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
  },
  emptyCardModern: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconContainerBlue: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1876B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconContainerGreen: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
