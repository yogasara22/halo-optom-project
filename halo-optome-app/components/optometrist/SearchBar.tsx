// app/components/optometris/SearchBar.tsx
import { View, TextInput, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <View style={styles.searchBar}>
      <Feather name="search" size={20} color="#94a3b8" />
      <TextInput
        placeholder="Cari layanan atau optometris"
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        style={styles.searchInput}
      />
      <Ionicons name="mic-outline" size={20} color="#94a3b8" />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 15,
    color: '#0f172a',
  },
});
