import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

const optometrists = [
  {
    id: '1',
    name: 'Dr. Indah Putri, Sp.Opt',
    experience: '5 tahun',
    rating: 4.9,
    avatar: 'https://i.pravatar.cc/150?img=45',
  },
  {
    id: '2',
    name: 'Dr. Yoga Ramadhan',
    experience: '3 tahun',
    rating: 4.7,
    avatar: 'https://i.pravatar.cc/150?img=33',
  },
  {
    id: '3',
    name: 'Dr. Rizky Permana',
    experience: '7 tahun',
    rating: 4.8,
    avatar: 'https://i.pravatar.cc/150?img=51',
  },
];

export default function OptometristListScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar Optometris</Text>

      <FlatList
        data={optometrists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.info}>👁️ {item.experience} pengalaman</Text>
              <Text style={styles.info}>⭐ {item.rating} rating</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/consultation/booking-form')}
              >
                <Text style={styles.buttonText}>Booking Sekarang</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2563EB', marginBottom: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 8,
  },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  info: { fontSize: 14, color: '#475569', marginTop: 2 },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
