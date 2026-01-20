import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InitialAvatar from '../common/InitialAvatar';

type DashboardHeaderProps = {
  username: string;
  avatarUrl?: string;
};

// Helper function to get greeting based on time of day
const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) {
    return 'Selamat Pagi!';
  } else if (hour >= 12 && hour < 18) {
    return 'Selamat Siang!';
  } else {
    return 'Selamat Malam!';
  }
};

export default function DashboardHeader({ username, avatarUrl }: DashboardHeaderProps) {
  const router = useRouter();
  const greeting = getGreeting();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      // Use IP address that works for Android Emulator/device 
      // 10.0.2.2 for emulator, or your machine IP for physical device
      const API_URL = 'http://10.0.2.2:4000/api';

      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.count) setUnreadCount(data.count);
    } catch (error) {
      console.log('Failed to fetch unread count', error);
    }
  };

  return (
    <View style={styles.header}>
      <InitialAvatar
        name={username}
        avatarUrl={avatarUrl}
        size={44}
        style={styles.avatar}
        role="optometrist"
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.username}>{username}</Text>
      </View>
      <TouchableOpacity onPress={() => router.push('/optometrist/notifications')}>
        <View>
          <Ionicons name="notifications-outline" size={24} color="#0f172a" />
          {unreadCount > 0 && (
            <View style={styles.badge} />
          )}
        </View>
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
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
  }
});
