// app/auth/login.tsx
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Feather, AntDesign, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { toBoolean } from '../../utils/boolean';

export default function LoginScreen() {
  const { login, loading, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Email dan password harus diisi');
      return;
    }

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser) {
        // Redirect berdasarkan role user yang baru saja login
        // Menggunakan user yang dikembalikan dari login, bukan context user (yang masih stale)
        const role = loggedInUser.role;
        if (role === 'OPTOMETRIST' || role === 'optometris') {
          router.replace('/optometrist');
        } else {
          router.replace('/');
        }
      } else {
        alert('Login gagal. Email atau password salah.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Menampilkan pesan error dari backend jika ada
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat login. Silakan coba lagi.';
      alert(errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#1876B8', '#3DBD61']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
            </View>
            <Text style={styles.subHello}>Selamat datang di Halo Optom</Text>
          </View>

          {/* FORM */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Masuk ke Akun</Text>

            <View style={styles.inputBox}>
              <Feather name="mail" size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
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

            <TouchableOpacity style={styles.forgot}>
              <Text style={styles.forgotText}>Lupa Password?</Text>
            </TouchableOpacity>

            <LinearGradient
              colors={['#1876B8', '#3DBD61']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButton}
            >
              <TouchableOpacity
                style={styles.loginTouchable}
                onPress={handleLogin}
                disabled={toBoolean(loading)}
              >
                <Text style={styles.loginText}>Masuk</Text>
              </TouchableOpacity>
            </LinearGradient>



            <TouchableOpacity onPress={() => router.replace('/auth/register')}>
              <Text style={styles.signupText}>
                Belum punya akun? <Text style={{ fontWeight: 'bold' }}>Daftar Sekarang</Text>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
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
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 14,
    color: '#3DBD61',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loginTouchable: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#94a3b8',
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  socialText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  signupText: {
    textAlign: 'center',
    color: '#64748b',
  },
});
