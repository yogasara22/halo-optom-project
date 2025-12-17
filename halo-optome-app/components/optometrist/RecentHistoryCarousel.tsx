// component/optometrist/RecentHistoryCarousel.tsx
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

export interface PatientHistoryItem {
  id: string;
  name: string;
  photo: any;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  diagnosis: string;
}

interface RecentHistoryCarouselProps {
  data: PatientHistoryItem[];
  onCardPress?: (item: PatientHistoryItem) => void;
}

const RecentHistoryCarousel: React.FC<RecentHistoryCarouselProps> = ({ data, onCardPress }) => {
  return (
    <View style={styles.wrapper}>
      <FlatList
        data={data}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onCardPress?.(item)}
            activeOpacity={0.9}
          >
            {/* Header pasien */}
            <View style={styles.headerRow}>
              <Image source={item.photo} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.serviceType}>{item.serviceType}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#1876B8" />
            </View>

            {/* Detail waktu & diagnosis */}
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={14} color="#64748b" />
              <Text style={styles.detailText}>{item.appointmentDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={14} color="#64748b" />
              <Text style={styles.detailText}>{item.appointmentTime}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="medkit-outline" size={14} color="#64748b" />
              <Text style={styles.detailText} numberOfLines={2}>
                Diagnosis: {item.diagnosis}
              </Text>
            </View>

            {/* Tombol aksi */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnAction}>
                <Ionicons name="document-text-outline" size={16} color="#fff" />
                <Text style={styles.btnText}>Detail</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnActionSecondary}>
                <Ionicons name="chatbubbles-outline" size={16} color="#1876B8" />
                <Text style={styles.btnTextSecondary}>Chat</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 40,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    width: width * 0.7,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    borderWidth: 0.4,
    borderColor: '#e2e8f0',
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
    marginRight: 10,
    backgroundColor: '#f1f5f9',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  serviceType: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1876B8',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  btnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  btnActionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
    flex: 1,
  },
  btnTextSecondary: {
    color: '#1876B8',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default RecentHistoryCarousel;
