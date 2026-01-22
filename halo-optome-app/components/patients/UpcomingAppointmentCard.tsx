import * as React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Appointment } from '../../services/patientService';
import { API_BASE_URL } from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import InitialAvatar from '../common/InitialAvatar';

interface UpcomingAppointmentCardProps {
  appointment: Appointment;
}

const UpcomingAppointmentCard: React.FC<UpcomingAppointmentCardProps> = ({ appointment }: UpcomingAppointmentCardProps) => {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Fetch unread messages count for chat appointments
  useEffect(() => {
    const fetchUnreadCount = async () => {
      console.log('Checking appointment:', {
        method: appointment.method,
        hasChat: !!appointment.chat,
        roomId: appointment.chat?.room_id
      });

      if (appointment.method === 'chat' && appointment.chat?.room_id) {
        try {
          const token = await AsyncStorage.getItem('authToken');
          if (!token) {
            console.log('No auth token found');
            return;
          }

          console.log('Fetching unread count from:', `${API_BASE_URL}/chats/unread/count`);
          const response = await fetch(`${API_BASE_URL}/chats/unread/count`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Unread count response:', data);
            setUnreadCount(data.count || 0);
          } else {
            console.log('Failed to fetch unread count:', response.status);
          }
        } catch (e) {
          console.error('Failed to fetch unread count:', e);
        }
      } else {
        console.log('Skipping unread fetch - not a chat appointment or no room_id');
      }
    };

    fetchUnreadCount();
    // Refresh every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [appointment]);

  const dateLabel = new Date(appointment.date).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const avatarUrl = appointment.optometrist?.photo || (appointment as any)?.optometrist?.avatar_url;

  // Determine if user can join consultation
  const canJoin = appointment.payment_status === 'paid' &&
    (appointment.status === 'confirmed' || appointment.status === 'ongoing' || appointment.status === 'pending');

  // Handle join consultation
  const handleJoinConsultation = () => {
    if (!canJoin) return;

    if (appointment.method === 'chat') {
      router.push(`/consultation/chat?id=${appointment.id}`);
    } else if (appointment.method === 'video') {
      router.push(`/consultation/video?id=${appointment.id}`);
    }
  };

  // Handle reschedule
  const handleReschedule = () => {
    router.push(`/appointments/book?optometristId=${appointment.optometrist?.id}`);
  };

  // Determine button label and icon
  const getActionButton = () => {
    if (appointment.payment_status === 'unpaid') {

      // Check if payment is waiting verification
      if (appointment.payment?.status === 'waiting_verification') {
        return {
          label: 'Menunggu Verifikasi',
          icon: 'time-outline' as const,
          onPress: () => {
            Alert.alert(
              'Menunggu Verifikasi',
              'Pembayaran Anda sedang diverifikasi oleh admin. Mohon tunggu maksimal 1x24 jam.'
            );
          },
          disabled: true,
          style: { backgroundColor: '#fcd34d' }, // Yellow/Amber
          textStyle: { color: '#78350f' }
        };
      }

      if (appointment.type === 'homecare') {
        return {
          label: 'Bayar Tunai',
          icon: 'cash-outline' as const,
          onPress: () => {
            Alert.alert(
              'Pembayaran Tunai',
              'Silakan lakukan pembayaran tunai saat optometris datang ke lokasi Anda.'
            );
          },
        };
      }
      return {
        label: 'Bayar Sekarang',
        icon: 'card-outline' as const,
        onPress: () => router.push(`/appointments/payment?id=${appointment.id}`),
      };
    }

    if (canJoin) {
      if (appointment.method === 'chat') {
        return {
          label: 'Chat',
          icon: 'chatbubble' as const,
          onPress: handleJoinConsultation,
        };
      } else if (appointment.method === 'video') {
        return {
          label: 'Video Call',
          icon: 'videocam' as const,
          onPress: handleJoinConsultation,
        };
      }
    }

    // Default: View Profile
    return {
      label: 'Lihat Profil',
      icon: 'person-outline' as const,
      onPress: () => router.push(`/patient/optometrist/${appointment.optometrist?.id}`),
    };
  };

  const actionButton = getActionButton();

  return (
    <View style={styles.stackWrapper}>
      {/* Shadow Card di belakang (untuk efek tumpukan) */}
      <View style={styles.shadowCard} />

      {/* Kartu utama */}
      <View style={styles.card}>
        {/* Baris atas: info dokter */}
        <View style={styles.headerRow}>
          <InitialAvatar
            name={appointment.optometrist?.name || 'Optometris'}
            avatarUrl={avatarUrl}
            size={56}
            style={styles.avatar}
            role="optometrist"
          />
          <View style={styles.info}>
            <Text style={styles.name}>{appointment.optometrist?.name || 'Optometris'}</Text>
            <Text style={styles.specialty}>Optometris</Text>
          </View>
          <TouchableOpacity onPress={() => router.push(`/patient/optometrist/${appointment.optometrist?.id}`)}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Detail waktu */}
        <View style={styles.detailRow}>
          <View style={styles.detailBox}>
            <Ionicons name="calendar-outline" size={16} color="#fff" />
            <Text style={styles.detailText}>{dateLabel}</Text>
          </View>
          <View style={styles.detailBox}>
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text style={styles.detailText}>{appointment.start_time?.slice(0, 5) || 'TBD'}</Text>
          </View>
        </View>

        {/* Tombol aksi */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.btnFilled,
              styles.btnFullWidth,
              appointment.payment_status === 'unpaid' && styles.btnPayment,
              (actionButton as any).style
            ]}
            onPress={actionButton.onPress}
            disabled={(actionButton as any).disabled}
          >
            <Ionicons name={actionButton.icon} size={16} color={(actionButton as any).textStyle?.color || "#fff"} style={{ marginRight: 6 }} />
            <Text style={[styles.btnTextFilled, (actionButton as any).textStyle]}>{actionButton.label}</Text>
            {/* Badge for unread messages on Chat button */}
            {actionButton.label === 'Chat' && unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default UpcomingAppointmentCard;

const styles = StyleSheet.create({
  stackWrapper: {
    marginBottom: 24,
  },
  shadowCard: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: '#e0f2fe',
    borderRadius: 20,
    zIndex: 0,
  },
  card: {
    backgroundColor: '#1876B8',
    borderRadius: 20,
    padding: 16,
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  specialty: {
    fontSize: 14,
    color: '#e0f2fe',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  btnFilled: {
    backgroundColor: '#3DBD61',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnFullWidth: {
    flex: 1,
    justifyContent: 'center',
  },
  btnPayment: {
    backgroundColor: '#f59e0b', // Orange color for payment
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  btnTextFilled: {
    color: '#fff',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#1876B8',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
