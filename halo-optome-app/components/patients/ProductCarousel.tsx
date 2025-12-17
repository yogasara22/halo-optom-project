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

export interface ProductItem {
  id: string;
  name: string;
  price: string;
  image: any;
  stock?: number;
}

interface ProductCarouselProps {
  data: ProductItem[];
  onProductPress?: (item: ProductItem) => void;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ data, onProductPress }) => {
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
            onPress={() => onProductPress?.(item)}
            activeOpacity={0.9}
          >
            {/* Image & Heart Icon */}
            <View style={styles.imageWrapper}>
              <Image source={item.image} style={styles.image} />
              <View style={styles.favoriteIcon}>
                <Ionicons name="heart-outline" size={18} color="#ef4444" />
              </View>
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>{item.price}</Text>
              </View>
            </View>

            {/* Stock & Info */}
            <View style={styles.infoWrapper}>
              {!!(item.stock || item.stock === 0) && (
                <Text style={styles.stockText}>{item.stock} stok tersedia</Text>
              )}
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#facc15" />
                <Text style={styles.ratingText}>4.5 (201)</Text>
              </View>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
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
    paddingBottom: 20, // ✅ Extra space for last card
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20, // ✅ Premium rounded
    padding: 14,
    marginRight: 16,
    width: width * 0.58,
    shadowColor: '#000',
    shadowOpacity: 0.08, // ✅ Softer shadow
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6, // ✅ Android shadow
    borderWidth: 0.3,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10, // ✅ Space below image
  },
  image: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  priceText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  infoWrapper: {
    gap: 4, // ✅ Space between text items
  },
  stockText: {
    fontSize: 12,
    color: '#ef4444',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#475569',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 4,
  },
});

export default ProductCarousel;
