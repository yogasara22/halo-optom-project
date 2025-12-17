// app/onboarding.tsx
import Onboarding from 'react-native-onboarding-swiper';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen() {
  const router = useRouter();

  const handleFinish = async () => {
    await AsyncStorage.setItem('alreadySeenOnboarding', 'true');
    router.replace('/auth/login');
  };

  return (
    <Onboarding
      onSkip={handleFinish}
      onDone={handleFinish}
      bottomBarHighlight={false}
      containerStyles={{ paddingHorizontal: 24, paddingTop: 40 }}
      titleStyles={{ fontSize: 24, fontWeight: '700', color: '#1e293b', textAlign: 'center' }}
      subTitleStyles={{ fontSize: 16, color: '#475569', textAlign: 'center' }}
      DotComponent={({ selected }) => (
        <View
          style={{
            width: selected ? 20 : 8,
            height: 8,
            borderRadius: 4,
            marginHorizontal: 4,
            backgroundColor: selected ? '#2563EB' : '#cbd5e1',
          }}
        />
      )}
      SkipButtonComponent={({ onPress }) => (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.buttonText}>Lewati</Text>
        </TouchableOpacity>
      )}
      NextButtonComponent={({ onPress }) => (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.buttonText}>Lanjut</Text>
        </TouchableOpacity>
      )}
      DoneButtonComponent={({ onPress }) => (
        <TouchableOpacity onPress={onPress}>
          <Text style={[styles.buttonText, { fontWeight: 'bold' }]}>Mulai</Text>
        </TouchableOpacity>
      )}
      pages={[
        {
          backgroundColor: '#fff',
          image: (
            <Image
              source={require('../assets/images/onboarding1.png')}
              style={styles.image}
            />
          ),
          title: 'Konsultasi Optometri',
          subtitle: 'Temui optometris profesional langsung dari rumah Anda.',
        },
        {
          backgroundColor: '#fff',
          image: (
            <Image
              source={require('../assets/images/onboarding2.png')}
              style={styles.image}
            />
          ),
          title: 'Catatan Medis Digital',
          subtitle: 'Lihat dan simpan riwayat rekam medis optometri Anda.',
        },
        {
          backgroundColor: '#fff',
          image: (
            <Image
              source={require('../assets/images/onboarding3.png')}
              style={styles.image}
            />
          ),
          title: 'Video Call',
          subtitle: 'Booking video call dengan optometris profesional.',
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: 280,
    height: 280,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
