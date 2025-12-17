// app/components/patients/DashboardHeader.tsx
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../constants/config';

type DashboardHeaderProps = {
  username: string;
  avatarUrl?: string;
};

export default function DashboardHeader({ username, avatarUrl }: DashboardHeaderProps) {
  const base = API_BASE_URL.replace(/\/?api$/, '');
  const resolveUri = (url?: string) => {
    if (!url) return undefined;
    if (!/^https?:\/\//i.test(url)) return base + url;
    if (/localhost|127\.0\.0\.1/.test(url)) {
      return url.replace(/^https?:\/\/[^/]+/, base);
    }
    return url;
  };
  const source = resolveUri(avatarUrl)
    ? { uri: resolveUri(avatarUrl)! }
    : require('../../assets/images/pasien/yogasara.jpg');
  return (
    <View style={styles.header}>
      <Image source={source} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.greeting}>Good morning!</Text>
        <Text style={styles.username}>{username}</Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="notifications-outline" size={24} color="#0f172a" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
});
