import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AppointmentCardProps {
  name: string;
  specialty: string;
  date: string;
  time: string;
  avatar: any;
  onReschedule?: () => void;
  onProfile?: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  name,
  specialty,
  date,
  time,
  avatar,
  onReschedule,
  onProfile,
}) => {
  return (
    <View style={styles.stackWrapper}>
      <View style={styles.shadowCard} />
      <View style={styles.card}>
        <View style={styles.doctorRow}>
          <Image source={avatar} style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.specialty}>{specialty}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailBox}>
            <Ionicons name="calendar-outline" size={16} color="#fff" />
            <Text style={styles.detailText}>{date}</Text>
          </View>
          <View style={styles.detailBox}>
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text style={styles.detailText}>{time}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnOutline} onPress={onReschedule}>
            <Text style={styles.btnText}>Atur Ulang</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnFilled} onPress={onProfile}>
            <Text style={styles.btnTextWhite}>Lihat Profil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stackWrapper: {
    marginBottom: 24,
    position: 'relative',
  },
  shadowCard: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: '#e0f2fe',
    borderRadius: 20,
    marginHorizontal: 4,
    zIndex: 0,
  },
  card: {
    backgroundColor: '#1876B8',
    borderRadius: 20,
    padding: 16,
    zIndex: 1,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  actionRow: {
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
  btnTextWhite: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AppointmentCard;
