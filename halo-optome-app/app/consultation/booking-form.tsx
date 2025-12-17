import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

export default function BookingFormScreen() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);

  const [time, setTime] = useState(new Date());
  const [showTime, setShowTime] = useState(false);

  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    Alert.alert(
      'Booking Berhasil',
      `Tanggal: ${date.toLocaleDateString()} \nJam: ${time.toLocaleTimeString()}`,
      [{ text: 'OK', onPress: () => router.replace('/') }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Konsultasi</Text>

      <Text style={styles.label}>Tanggal Konsultasi</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDate(true)}>
        <Text>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDate && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDate(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Waktu Konsultasi</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowTime(true)}>
        <Text>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>
      {showTime && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            setShowTime(false);
            if (selectedTime) setTime(selectedTime);
          }}
        />
      )}

      <Text style={styles.label}>Catatan (opsional)</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Tulis keluhan singkat Anda..."
        multiline
        numberOfLines={4}
        style={[styles.input, { textAlignVertical: 'top' }]}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Konfirmasi Booking</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2563EB', marginBottom: 24 },
  label: { fontSize: 16, marginBottom: 6, color: '#1e293b' },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
});
