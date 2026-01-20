// app/auth/register.tsx
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { toBoolean } from '../../utils/boolean';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [strNumber, setStrNumber] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'OPTOMETRIST' | 'pasien' | 'optometris'>('PATIENT');
  const router = useRouter();
  const { register, loading } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Oops', 'Semua kolom harus diisi!');
      return;
    }

    try {
      const success = await register(name, email, password, phone, role, strNumber);
      if (success) {
        Alert.alert('Registrasi Berhasil', `Akun ${role.toLowerCase()} berhasil dibuat.`);
        // Redirect berdasarkan role
        if (role === 'OPTOMETRIST' || role === 'optometris') {
          router.replace('/optometrist');
        } else {
          router.replace('/');
        }
      } else {
        Alert.alert('Registrasi Gagal', 'Terjadi kesalahan saat mendaftar.');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.';
      Alert.alert('Registrasi Gagal', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <LinearGradient colors={['#1876B8', '#3DBD61']} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
            </View>
            <Text style={styles.subHello}>Buat akun Halo Optom Anda</Text>
          </View>

          {/* FORM CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Daftar Akun</Text>

            <View style={styles.inputBox}>
              <Feather name="user" size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                placeholder="Nama Lengkap"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputBox}>
              <Feather name="mail" size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputBox}>
              <Feather name="lock" size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.inputBox}>
              <Feather name="phone" size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                placeholder="Nomor Telepon"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {role === 'OPTOMETRIST' && (
              <View style={styles.inputBox}>
                <Feather name="file-text" size={18} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  placeholder="Nomor STR (Surat Tanda Registrasi)"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={strNumber}
                  onChangeText={setStrNumber}
                />
              </View>
            )}

            <Text style={styles.label}>Daftar Sebagai</Text>
            <View style={styles.roleSwitcher}>
              <TouchableOpacity
                style={[styles.roleButton, role === 'PATIENT' && styles.roleButtonActive]}
                onPress={() => setRole('PATIENT')}
              >
                <Feather name="user" size={20} color={role === 'PATIENT' ? '#fff' : '#1876B8'} />
                <Text style={role === 'PATIENT' ? styles.roleTextActive : styles.roleText}>
                  Pasien
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, role === 'OPTOMETRIST' && styles.roleButtonActive]}
                onPress={() => setRole('OPTOMETRIST')}
              >
                <Feather name="user-check" size={20} color={role === 'OPTOMETRIST' ? '#fff' : '#1876B8'} />
                <Text style={role === 'OPTOMETRIST' ? styles.roleTextActive : styles.roleText}>
                  Optometris
                </Text>
              </TouchableOpacity>
            </View>

            <LinearGradient
              colors={['#1876B8', '#3DBD61']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.registerButton}
            >
              <TouchableOpacity style={styles.registerTouchable} onPress={handleRegister} disabled={toBoolean(loading)}>
                <Text style={styles.registerText}>Daftar</Text>
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
              <Text style={styles.loginLink}>
                Sudah punya akun? <Text style={{ fontWeight: 'bold' }}>Masuk</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 0,
  },
  header: {
    paddingTop: 64,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  subHello: {
    fontSize: 16,
    color: '#E0F2F1',
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    flex: 1,
    minHeight: 500,
    paddingBottom: 40,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#0f172a',
  },
  label: {
    color: '#475569',
    fontWeight: '600',
    marginBottom: 8,
  },
  roleSwitcher: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginHorizontal: 6,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#1876B8',
    borderColor: '#1876B8',
  },
  roleText: {
    color: '#0f172a',
    fontWeight: '600',
    marginTop: 4,
  },
  roleTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  registerTouchable: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginLink: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
  },
});
