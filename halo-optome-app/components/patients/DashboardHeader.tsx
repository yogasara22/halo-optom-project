// app/components/patients/DashboardHeader.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import InitialAvatar from '../common/InitialAvatar';
import notificationService from '../../services/notificationService';

type DashboardHeaderProps = {
  username: string;
  avatarUrl?: string;
};

// Helper function to get greeting based on time of day
const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) {
    return 'Good morning!';
  } else if (hour >= 12 && hour < 18) {
    return 'Good afternoon!';
  } else {
    return 'Good evening!';
  }
};

export default function DashboardHeader({ username, avatarUrl }: DashboardHeaderProps) {
  const router = useRouter();
  const greeting = getGreeting();
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  const fetchUnreadCount = async () => {
    const count = await notificationService.getUnreadCount();
    setUnreadCount(count);
  };

  return (
    <View style={styles.header}>
      <InitialAvatar
        name={username}
        avatarUrl={avatarUrl}
        size={44}
        style={styles.avatar}
        role="patient"
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.username}>{username}</Text>
      </View>
      <TouchableOpacity style={styles.bellButton} onPress={() => router.push('/patient/notifications')}>
        <Ionicons name="notifications-outline" size={24} color="#0f172a" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </View>
        )}
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
  bellButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#f8fafc',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
