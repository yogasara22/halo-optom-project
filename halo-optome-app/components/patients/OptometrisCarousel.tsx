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
import InitialAvatar from '../common/InitialAvatar';

const { width } = Dimensions.get('window');

export interface Optometris {
  id: string;
  name: string;
  photo: any;
  avatar_url?: string;
  rating: number;
  experience: string;
  schedule: string;
}

interface OptometrisCarouselProps {
  data: Optometris[];
  onCardPress?: (item: Optometris) => void;
}

const OptometrisCarousel: React.FC<OptometrisCarouselProps> = ({ data, onCardPress }) => {
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
          <View style={styles.avatarContainer}>
            <InitialAvatar
              name={item.name}
              avatarUrl={item.avatar_url || item.photo}
              size={80}
              style={styles.avatar}
              role="optometrist"
            />
          </View>

          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.rating}>⭐ {item.rating} • {item.experience}</Text>

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
    width: width * 0.65,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarContainer: {
    width: 80, // ✅ Lebih besar sedikit
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#f1f5f9', // ✅ Soft gray placeholder
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'center', // ✅ Center gambar secara vertikal
    alignItems: 'center',      // ✅ Center gambar secara horizontal
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // ✅ Fill circle, minimal crop
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  rating: {
    fontSize: 13,
    color: '#475569',
    marginTop: 6,
    textAlign: 'center',
  },
  schedule: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default OptometrisCarousel;
