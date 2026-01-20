// app/components/patients/SearchBar.tsx
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';


type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  onPress?: () => void;
  autoFocus?: boolean;
};

export default function SearchBar({ value, onChangeText, editable = true, onPress, autoFocus = false }: SearchBarProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.searchBar} onPress={onPress} activeOpacity={0.9}>
      <Feather name="search" size={20} color="#94a3b8" />
      <TextInput
        placeholder="Cari layanan atau optometris"
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        style={styles.searchInput}
        editable={editable}
        autoFocus={autoFocus}
        // If not editable, we want to ignore touch events on the input itself so the parent TouchableOpacity takes over
        pointerEvents={editable ? 'auto' : 'none'}
      />
      <Ionicons name="mic-outline" size={20} color="#94a3b8" />
    </Container>
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
