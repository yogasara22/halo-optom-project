// components/optometris/PatientScheduleCarousel.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export interface PatientSchedule {
  id: string;
  name: string;
  photo: any;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  status: 'Menunggu' | 'Disetujui' | 'Berlangsung' | 'Selesai';
}

interface PatientScheduleCarouselProps {
  data: PatientSchedule[];
  onCardPress?: (item: PatientSchedule) => void;
}

const PatientScheduleCarousel: React.FC<PatientScheduleCarouselProps> = ({
  data,
  onCardPress,
}) => {
  return (
    <FlatList
      data={data}
      horizontal
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => onCardPress?.(item)}
          activeOpacity={0.9}
        >
          {/* Foto Pasien */}
          <View style={styles.avatarContainer}>
            <Image source={item.photo} style={styles.avatar} />
          </View>

          {/* Nama & Jenis Layanan */}
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.serviceType}>{item.serviceType}</Text>

          {/* Tanggal & Jam */}
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color="#64748b" />
            <Text style={styles.infoText}>{item.appointmentDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color="#64748b" />
            <Text style={styles.infoText}>{item.appointmentTime}</Text>
          </View>

          {/* Status */}
          <View
            style={[
              styles.statusBadge,
              item.status === 'Menunggu'
                ? styles.statusWaiting
                : item.status === 'Disetujui'
                  ? styles.statusApproved
                  : item.status === 'Berlangsung'
                    ? styles.statusOngoing
                    : styles.statusDone,
            ]}
          >
            <Text style={[
              styles.statusText,
              item.status === 'Disetujui' && styles.statusTextApproved
            ]}>{item.status}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingLeft: 20,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    width: width * 0.6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 2,
  },
  serviceType: {
    fontSize: 13,
    color: '#1876B8',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#475569',
    marginLeft: 4,
  },
  statusBadge: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusWaiting: {
    backgroundColor: '#fef3c7',
  },
  statusApproved: {
    backgroundColor: '#dcfce7',
  },
  statusOngoing: {
    backgroundColor: '#d1fae5',
  },
  statusDone: {
    backgroundColor: '#e2e8f0',
  },
  statusText: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '600',
  },
  statusTextApproved: {
    color: '#166534',
  },
});

export default PatientScheduleCarousel;
