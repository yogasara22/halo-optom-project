// app/onboarding.tsx
import Onboarding from 'react-native-onboarding-swiper';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('alreadySeenOnboarding', 'true');
      // Using push instead of replace to ensure navigation works properly
      router.push('/auth/login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.push('/auth/login');
    }
  };

  return (
    <View style={styles.container}>
      <Onboarding
        onSkip={handleFinish}
        onDone={handleFinish}
        bottomBarHighlight={false}
        showNext={true}
        showSkip={true}
        showDone={true}
        // Add bottom padding to avoid overlapping with phone navigation
        containerStyles={{
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: Math.max(insets.bottom, 20) + 10, // Safe area + extra padding
        }}
        imageContainerStyles={styles.imageContainer}
        titleStyles={styles.title}
        subTitleStyles={styles.subtitle}
        // Enhanced Dot Component with better spacing
        DotComponent={({ selected }) => (
          <View
            style={[
              styles.dot,
              selected ? styles.dotSelected : styles.dotUnselected,
            ]}
          />
        )}
        // Skip Button with enhanced styling
        SkipButtonComponent={({ onPress }) => (
          <TouchableOpacity
            onPress={onPress}
            style={[styles.skipButton, { marginBottom: Math.max(insets.bottom, 12) }]}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Lewati</Text>
          </TouchableOpacity>
        )}
        // Next Button with enhanced styling
        NextButtonComponent={({ onPress }) => (
          <TouchableOpacity
            onPress={onPress}
            style={[
              styles.nextButton,
              {
                marginBottom: Math.max(insets.bottom, 12),
                marginRight: 16 // Add spacing from right edge
              }
            ]}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#1876B8', '#3DBD61']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.nextText}>Lanjut</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        // Done Button with enhanced styling
        DoneButtonComponent={({ onPress }) => (
          <TouchableOpacity
            onPress={onPress}
            style={[
              styles.doneButton,
              {
                marginBottom: Math.max(insets.bottom, 12),
                marginRight: 16 // Add spacing from right edge
              }
            ]}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#1876B8', '#3DBD61']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.doneText}>Mulai</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        pages={[
          {
            backgroundColor: '#FFFFFF',
            image: (
              <View style={styles.pageImageContainer}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={require('../assets/images/onboarding1.png')}
                    style={styles.image}
                  />
                </View>
              </View>
            ),
            title: 'Konsultasi Optometri',
            subtitle: 'Temui optometris profesional langsung dari rumah Anda dengan mudah dan nyaman.',
          },
          {
            backgroundColor: '#FFFFFF',
            image: (
              <View style={styles.pageImageContainer}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={require('../assets/images/onboarding2.png')}
                    style={styles.image}
                  />
                </View>
              </View>
            ),
            title: 'Catatan Medis Digital',
            subtitle: 'Lihat dan simpan riwayat rekam medis optometri Anda dengan aman dan terorganisir.',
          },
          {
            backgroundColor: '#FFFFFF',
            image: (
              <View style={styles.pageImageContainer}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={require('../assets/images/onboarding3.png')}
                    style={styles.image}
                  />
                </View>
              </View>
            ),
            title: 'Video Call',
            subtitle: 'Booking video call dengan optometris profesional kapan saja, dimana saja.',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    paddingBottom: 40,
  },
  pageImageContainer: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  imageWrapper: {
    width: width * 0.75,
    height: width * 0.75,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 30,
    padding: 20,
    shadowColor: '#1876B8',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 12,
    paddingHorizontal: 30,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
    marginBottom: 20,
  },
  // Dot styles with proper spacing from bottom
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    marginBottom: 8, // Extra spacing from bottom navigation
  },
  dotSelected: {
    width: 28,
    backgroundColor: '#1876B8',
    shadowColor: '#1876B8',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dotUnselected: {
    width: 10,
    backgroundColor: '#CBD5E1',
  },
  // Skip button styles
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  skipText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  // Next button styles
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#1876B8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  gradientButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Done button styles
  doneButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#1876B8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  doneText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
