import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

type QuickMenuProps = {
  iconName: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
};

export default function QuickMenu({ iconName, label, onPress }: QuickMenuProps) {
  return (
    <TouchableOpacity style={styles.menuBox} onPress={onPress}>
      <Feather name={iconName} size={26} color="#2563EB" />
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuBox: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  menuLabel: {
    marginTop: 8,
    fontWeight: '600',
    color: '#334155',
  },
});
