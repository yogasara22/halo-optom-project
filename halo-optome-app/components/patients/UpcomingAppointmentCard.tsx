import * as React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Appointment } from '../../services/patientService';
import { API_BASE_URL } from '../../constants/config';

interface UpcomingAppointmentCardProps {
  appointment: Appointment;
}

const UpcomingAppointmentCard: React.FC<UpcomingAppointmentCardProps> = ({ appointment }: UpcomingAppointmentCardProps) => {
  const router = useRouter();

  const dateLabel = new Date(appointment.date).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const base = API_BASE_URL.replace(/\/?api$/, '');
  let avatarUrl = appointment.optometrist?.photo || (appointment as any)?.optometrist?.avatar_url;
  if (avatarUrl && !/^https?:\/\//i.test(avatarUrl)) avatarUrl = base + avatarUrl;
  if (avatarUrl && /localhost|127\.0\.0\.1/.test(avatarUrl)) avatarUrl = avatarUrl.replace(/^https?:\/\/[^/]+/, base);
  const avatarSource = avatarUrl ? { uri: avatarUrl } : require('../../assets/images/optometris/itmam.png');

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
          <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
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
          <TouchableOpacity style={styles.btnOutline} onPress={handleReschedule}>
            <Text style={styles.btnText}>Atur Ulang</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.btnFilled,
              appointment.payment_status === 'unpaid' && styles.btnPayment
            ]}
            onPress={actionButton.onPress}
          >
            <Ionicons name={actionButton.icon} size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.btnTextFilled}>{actionButton.label}</Text>
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
    justifyContent: 'space-between',
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
});
