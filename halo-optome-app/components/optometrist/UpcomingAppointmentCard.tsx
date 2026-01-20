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
import InitialAvatar from '../common/InitialAvatar';

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
  unreadCount?: number;
  onChatPress?: () => void;
}

const UpcomingAppointmentCard: React.FC<UpcomingAppointmentCardProps> = ({ appointment, unreadCount, onChatPress }: UpcomingAppointmentCardProps) => {
  return (
    <View style={styles.stackWrapper}>
      {/* Shadow Card di belakang */}
      <View style={styles.shadowCard} />

      {/* Card utama */}
      <View style={styles.card}>
        {/* Header: info pasien */}
        <View style={styles.headerRow}>
          <InitialAvatar
            name={appointment.name}
            avatarUrl={appointment.photo?.uri ? appointment.photo.uri : appointment.photo} // Handle both object with uri or string
            size={40}
            style={styles.avatar}
            role="patient"
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
            <TouchableOpacity
              style={styles.btnAction}
              onPress={onChatPress}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Chat</Text>
              {unreadCount && unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default UpcomingAppointmentCard;

const styles = StyleSheet.create({
  // ... existing styles ...
  stackWrapper: {
    marginBottom: 16,
  },
  shadowCard: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: '#bfdbfe',
    borderRadius: 16,
    zIndex: 0,
  },
  card: {
    backgroundColor: '#1876B8',
    borderRadius: 16,
    padding: 12,
    zIndex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor removed to allow InitialAvatar to set its own color
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  info: {
    flex: 1,
    marginLeft: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  serviceType: {
    fontSize: 11,
    color: '#f0fdf4',
    marginTop: 1,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  detailColumn: {
    flex: 1,
    gap: 4,
  },
  detailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: '#fff',
    fontSize: 13,
    flexShrink: 1,
  },
  actions: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3DBD61',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginLeft: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
  },
  initialsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1876B8',
  },
});
