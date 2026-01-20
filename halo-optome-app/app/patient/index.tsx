import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FileText, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import optometristService, { Optometrist } from '../../services/optometristService';
import productService, { Product } from '../../services/productService';
import patientService, { Appointment } from '../../services/patientService';
import SearchBar from '../../components/patients/SearchBar';
import AppHeader from '../../components/patients/DashboardHeader';
import UpcomingAppointmentCard from '../../components/patients/UpcomingAppointmentCard';
import OptometrisCarousel from '../../components/patients/OptometrisCarousel';

import ProductCarousel, { ProductItem } from '../../components/patients/ProductCarousel';
import { formatRupiah } from '../../utils/format';
import { API_BASE_URL } from '../../constants/config';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [search, setSearch] = useState('');
  const [featuredOptometrists, setFeaturedOptometrists] = useState<Optometrist[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    } else {
      setChecking(false);

      const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);

        const results = await Promise.allSettled([
          optometristService.getFeaturedOptometrists(),
          productService.getRecommendedProducts(),
          patientService.getNextAppointment()
        ]);

        if (results[0].status === 'fulfilled') {
          setFeaturedOptometrists(results[0].value);
        } else {
          setFeaturedOptometrists([]);
        }

        if (results[1].status === 'fulfilled') {
          setRecommendedProducts(results[1].value);
        } else {
          setRecommendedProducts([]);
        }

        if (results[2].status === 'fulfilled') {
          setNextAppointment(results[2].value);
        } else {
          setNextAppointment(null);
        }

        const allFailed = results.every(r => r.status === 'rejected');
        setError(allFailed ? 'Gagal memuat data. Silakan coba lagi.' : null);
        setIsLoading(false);
      };

      if (user.role === 'PATIENT' || user.role === 'pasien') { // Mendukung kedua format role
        fetchDashboardData();
      }
    }
  }, [user]);

  if (checking || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 16, color: '#64748b', marginBottom: 8 }}>
          Memuat dashboard...
        </Text>
        <ActivityIndicator size="large" color="#1876B8" />
      </View>
    );
  }

  // Konversi data Optometrist ke Optometris
  const convertToOptometris = (optometrists: Optometrist[]) => {
    return optometrists.map(opt => {
      const base = API_BASE_URL.replace(/\/?api$/, '');
      // Prefer avatar_url, then photo
      let rawUrl = opt.avatar_url || opt.photo;
      let photoUrl = rawUrl ? rawUrl : undefined;

      if (photoUrl && !/^https?:\/\//i.test(photoUrl)) {
        photoUrl = base + photoUrl;
      }
      if (photoUrl && /localhost|127\.0\.0\.1/.test(photoUrl)) {
        photoUrl = photoUrl.replace(/^https?:\/\/[^/]+/, base);
      }
      return {
        id: opt.id,
        name: opt.name,
        // Pass string URL directly. If undefined, InitialAvatar shows initials.
        photo: photoUrl,
        avatar_url: photoUrl,
        rating: opt.rating,
        experience: opt.experience,
        schedule: opt.schedule && opt.schedule.length > 0
          ? `${opt.schedule[0].day}, ${opt.schedule[0].time}`
          : 'Jadwal tidak tersedia'
      };
    });
  };

  // Gunakan data dari API jika tersedia, jika tidak gunakan array kosong
  const optometrists = featuredOptometrists.length > 0
    ? convertToOptometris(featuredOptometrists)
    : [];

  // Konversi data Product ke ProductItem
  const convertToProductItem = (products: Product[]) => {
    return products.map(prod => {
      const base = API_BASE_URL.replace(/\/?api$/, '');
      let imageUrl = prod.image_url || prod.image || undefined;
      if (imageUrl && !/^https?:\/\//i.test(imageUrl)) imageUrl = base + imageUrl;
      if (imageUrl && /localhost|127\.0\.0\.1/.test(imageUrl)) imageUrl = imageUrl.replace(/^https?:\/\/[^/]+/, base);
      return {
        id: prod.id,
        name: prod.name,
        price: formatRupiah(prod.price),
        image: imageUrl ? { uri: imageUrl } : require('../../assets/images/product/kacamata01.png'),
        stock: prod.stock
      };
    });
  };

  const products = recommendedProducts.length > 0
    ? convertToProductItem(recommendedProducts)
    : [];

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader username={user.name} avatarUrl={user.avatar_url} />


        <Text style={styles.sectionTitle}>Jadwal Pemeriksaan Berikutnya</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#1876B8" />
        ) : error ? (
          <Text style={{ color: '#ef4444', marginBottom: 12 }}>{error}</Text>
        ) : nextAppointment ? (
          <UpcomingAppointmentCard appointment={nextAppointment} />
        ) : (
          <LinearGradient colors={['#f0f7ff', '#ffffff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={26} color="#2563EB" />
            </View>
            <Text style={styles.emptyTitle}>Data jadwal pemeriksaan berikutnya belum ada</Text>
            <Text style={styles.emptySubtitle}>Buat janji untuk memilih tanggal dan waktu konsultasi</Text>
            <TouchableOpacity onPress={() => router.push('/appointments/book')} activeOpacity={0.85} style={styles.ctaButton}>
              <LinearGradient colors={['#2563EB', '#1876B8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text style={styles.ctaText}>Buat Janji</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* Quick Access: Rekam Medis */}
        <TouchableOpacity
          style={styles.quickAccessCard}
          onPress={() => router.push('/records')}
          activeOpacity={0.7}
        >
          <View style={styles.quickAccessIconWrap}>
            <FileText size={24} color="#2563EB" />
          </View>
          <View style={styles.quickAccessContent}>
            <Text style={styles.quickAccessTitle}>Riwayat Rekam Medis</Text>
            <Text style={styles.quickAccessSubtitle}>Lihat hasil konsultasi Anda</Text>
          </View>
          <ChevronRight size={20} color="#94a3b8" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Optometris Unggulan</Text>
        <OptometrisCarousel
          data={optometrists}
          onCardPress={(item) => router.push(`/patient/optometrist/${item.id}`)}
        />

        <Text style={styles.sectionTitle}>Rekomendasi Kacamata</Text>
        <ProductCarousel
          data={products}
          onProductPress={(item: ProductItem) => router.push(`/patient/product/${item.id}`)}
        />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 140,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
    marginTop: 16,
  },
  emptyCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    alignItems: 'center',
    gap: 8,
  },
  emptyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0eaff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '600',
  },
  quickAccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickAccessIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAccessContent: {
    flex: 1,
    marginLeft: 12,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  quickAccessSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
});
