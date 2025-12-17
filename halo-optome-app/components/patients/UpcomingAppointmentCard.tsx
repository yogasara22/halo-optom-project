import * as React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appointment } from '../../services/patientService';
import { API_BASE_URL } from '../../constants/config';

interface UpcomingAppointmentCardProps {
  appointment: Appointment;
}

const UpcomingAppointmentCard: React.FC<UpcomingAppointmentCardProps> = ({ appointment }: UpcomingAppointmentCardProps) => {
  const dateLabel = new Date(appointment.date).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const base = API_BASE_URL.replace(/\/?api$/, '');
  let avatarUrl = appointment.optometrist?.photo || (appointment as any)?.optometrist?.avatar_url;
  if (avatarUrl && !/^https?:\/\//i.test(avatarUrl)) avatarUrl = base + avatarUrl;
  if (avatarUrl && /localhost|127\.0\.0\.1/.test(avatarUrl)) avatarUrl = avatarUrl.replace(/^https?:\/\/[^/]+/, base);
  const avatarSource = avatarUrl ? { uri: avatarUrl } : require('../../assets/images/optometris/itmam.png');

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
          <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
        </View>

        {/* Detail waktu */}
        <View style={styles.detailRow}>
          <View style={styles.detailBox}>
            <Ionicons name="calendar-outline" size={16} color="#fff" />
            <Text style={styles.detailText}>{dateLabel}</Text>
          </View>
          <View style={styles.detailBox}>
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text style={styles.detailText}>{appointment.time}</Text>
          </View>
        </View>

        {/* Tombol aksi */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnOutline}>
            <Text style={styles.btnText}>Atur Ulang</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnFilled}>
            <Text style={styles.btnTextFilled}>Lihat Profil</Text>
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
    borderRadius: 28, // ✅ Full circle
    backgroundColor: '#f1f5f9', // ✅ Placeholder bg untuk transparansi
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    justifyContent: 'center', // ✅ Center image vertically
    alignItems: 'center',     // ✅ Center image horizontally
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
