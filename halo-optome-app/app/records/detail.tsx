import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const dummyRecords = {
  '1': {
    date: '2025-06-15',
    diagnosis: 'Mata lelah akibat paparan layar berlebih selama 10 jam/hari.',
    prescription: 'Obat tetes mata Refresh Plus, istirahat mata setiap 20 menit.',
    optometrist: 'Dr. Indah Putri',
  },
  '2': {
    date: '2025-04-02',
    diagnosis: 'Alergi ringan akibat debu, menyebabkan mata merah dan gatal.',
    prescription: 'Cendo Xitrol 3x sehari selama 5 hari.',
    optometrist: 'Dr. Yoga Ramadhan',
  },
  '3': {
    date: '2025-02-19',
    diagnosis: 'Miopia ringan, pasien mengalami penglihatan buram jarak jauh.',
    prescription: 'Kacamata minus -1.00, kontrol ulang 6 bulan.',
    optometrist: 'Dr. Rizky Permana',
  },
};

export default function MedicalRecordDetail() {
  const { id } = useLocalSearchParams();

  const record = dummyRecords[id as keyof typeof dummyRecords];

  if (!record) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Data tidak ditemukan.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detail Rekam Medis</Text>

      <View style={styles.card}>
        <Text style={styles.label}>📅 Tanggal Konsultasi</Text>
        <Text style={styles.value}>{record.date}</Text>

        <Text style={styles.label}>🩺 Optometris</Text>
        <Text style={styles.value}>{record.optometrist}</Text>

        <Text style={styles.label}>📄 Diagnosis</Text>
        <Text style={styles.value}>{record.diagnosis}</Text>

        <Text style={styles.label}>💊 Resep / Tindakan</Text>
        <Text style={styles.value}>{record.prescription}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2563EB', marginBottom: 24 },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  label: { fontSize: 14, color: '#64748b' },
  value: { fontSize: 16, fontWeight: '500', color: '#1e293b' },
  notFound: { fontSize: 16, textAlign: 'center', color: '#ef4444', marginTop: 100 },
});
