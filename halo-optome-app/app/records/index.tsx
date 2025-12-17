import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const dummyRecords = [
  {
    id: '1',
    date: '2025-06-15',
    diagnosis: 'Mata lelah akibat paparan layar',
  },
  {
    id: '2',
    date: '2025-04-02',
    diagnosis: 'Alergi ringan pada mata kanan',
  },
  {
    id: '3',
    date: '2025-02-19',
    diagnosis: 'Rabun jauh ringan (Miopia)',
  },
];

export default function MedicalRecordsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Riwayat Rekam Medis</Text>

      <FlatList
        data={dummyRecords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>📅 {item.date}</Text>
            <Text style={styles.diagnosis}>{item.diagnosis}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push(`/records/detail?id=${item.id}`)}
            >
              <Text style={styles.buttonText}>Lihat Detail</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2563EB', marginBottom: 16 },
  card: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  date: { fontSize: 14, color: '#64748b', marginBottom: 6 },
  diagnosis: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', paddingHorizontal: 12 },
});
