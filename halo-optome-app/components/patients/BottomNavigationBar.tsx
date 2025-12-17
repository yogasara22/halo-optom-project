import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { icon: 'home-outline', label: 'Home', route: '/dashboard' },
  { icon: 'calendar-outline', label: 'Jadwal', route: '/appointments' },
  { icon: 'chatbubbles-outline', label: 'Chat', route: '/chat' },
  { icon: 'settings-outline', label: 'Pengaturan', route: '/settings' },
];

const BottomNavigationBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets(); // ✅ Dapatkan safe area insets

  const isActive = (route: string) => pathname === route;

  return (
    <View style={[styles.container, { paddingBottom: (insets.bottom || 8) }]}>
      {TABS.map((tab, index) => {
        const active = isActive(tab.route);

        return (
          <TouchableOpacity
            key={index}
            style={[styles.tabItem, active && styles.tabItemActive]}
            activeOpacity={0.7}
            onPress={() => router.push(tab.route)}
          >
            <View style={[styles.iconWrapper, active && styles.iconActive]}>
              <Ionicons
                name={tab.icon as any}
                size={24}
                color={active ? '#1876B8' : '#64748b'}
              />
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
  },
  tabItemActive: {
    backgroundColor: '#F8FAFC',
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  iconActive: {
    backgroundColor: '#E6F2FA',
  },
  label: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  labelActive: {
    color: '#1876B8',
    fontWeight: '700',
  },
});

export default BottomNavigationBar;
