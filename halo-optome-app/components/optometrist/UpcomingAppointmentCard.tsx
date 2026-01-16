// components/optometris/UpcomingAppointment.tsx
import * as React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UpcomingAppointmentCardProps {
  appointment: {
    id: string;
    name: string;
    photo: any;
    appointmentDate: string;
    appointmentTime: string;
    serviceType: string;
    status: 'Menunggu' | 'Disetujui' | 'Berlangsung' | 'Selesai';
  };
}

const UpcomingAppointmentCard: React.FC<UpcomingAppointmentCardProps> = ({ appointment }: UpcomingAppointmentCardProps) => {
  return (
    <View style={styles.stackWrapper}>
      {/* Shadow Card di belakang */}
      <View style={styles.shadowCard} />

      {/* Card utama */}
      <View style={styles.card}>
        {/* Header: info pasien */}
        <View style={styles.headerRow}>
          <Image
            source={appointment.photo}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.info}>
            <Text style={styles.name}>{appointment.name}</Text>
            <Text style={styles.serviceType}>{appointment.serviceType}</Text>
          </View>
          <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
        </View>

        {/* Grid detail waktu dan layanan */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailColumn}>
            <View style={styles.detailBox}>
              <Ionicons name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.detailText}>{appointment.appointmentDate}</Text>
            </View>
            <View style={styles.detailBox}>
              <Ionicons name="time-outline" size={18} color="#fff" />
              <Text style={styles.detailText}>{appointment.appointmentTime}</Text>
            </View>
          </View>
        </View>

        {/* Tombol aksi conditional */}
        <View style={styles.actions}>
          {appointment.serviceType.toLowerCase().includes('video') ? (
            <TouchableOpacity style={styles.btnAction}>
              <Ionicons name="videocam-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Video Call</Text>
            </TouchableOpacity>
          ) : appointment.serviceType.toLowerCase().includes('chat') ? (
            <TouchableOpacity style={styles.btnAction}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Chat</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default UpcomingAppointmentCard;

const styles = StyleSheet.create({
  stackWrapper: {
    marginBottom: 28,
  },
  shadowCard: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: '#bfdbfe', // biru muda lembut
    borderRadius: 20,
    zIndex: 0,
  },
  card: {
    backgroundColor: '#1876B8',
    borderRadius: 16,
    padding: 16,
    zIndex: 1,
    // minHeight removed to let content dictate size
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  serviceType: {
    fontSize: 12,
    color: '#f0fdf4',
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  detailColumn: {
    flex: 1,
    gap: 8,
  },
  detailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
    flexShrink: 1,
  },
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3DBD61',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
