// app/index.tsx
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

export default function IndexRedirector() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkFlow = async () => {
      const seen = await AsyncStorage.getItem('alreadySeenOnboarding');

      if (!seen) {
        router.replace('/onboarding');
      } else if (!user) {
        router.replace('/auth/login');
      } else if (user.role === 'OPTOMETRIST' || user.role === 'optometris') {
        router.replace('/optometrist');
      } else {
        router.replace('/patient');
      }
    };

    checkFlow();
  }, [user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}
