import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

interface FeatureItem {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface Props {
  onNavigate: (id: string) => void;
}

const features: FeatureItem[] = [
  {
    id: 'consultation',
    title: 'Konsultasi',
    icon: <Ionicons name="chatbubbles" size={24} color="#1876B8" />,
  },
  {
    id: 'homecare',
    title: 'Homecare',
    icon: <MaterialCommunityIcons name="home-plus" size={24} color="#1876B8" />,
  },
  {
    id: 'shop',
    title: 'Toko Produk',
    icon: <FontAwesome5 name="shopping-bag" size={22} color="#1876B8" />,
  },
  {
    id: 'history',
    title: 'Riwayat',
    icon: <Ionicons name="document-text" size={24} color="#1876B8" />,
  },
];

const FeatureMenuGrid: React.FC<Props> = ({ onNavigate }) => {
  return (
    <View style={styles.grid}>
      {features.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.menuItem}
          onPress={() => onNavigate(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrapper}>
            {item.icon}
          </View>
          <Text style={styles.menuText}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  menuItem: {
    width: '22%',
    alignItems: 'center',
    marginVertical: 8,
  },
  iconWrapper: {
    backgroundColor: '#e0f2fe',
    borderRadius: 50,
    padding: 16,
    marginBottom: 8,
  },
  menuText: {
    fontSize: 13,
    color: '#0f172a',
    textAlign: 'center',
  },
});

export default FeatureMenuGrid;
