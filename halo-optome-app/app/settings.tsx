import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import BottomNavigationBar from '../components/optometrist/BottomNavigationBar';
import InitialAvatar from '../components/common/InitialAvatar';
import { useState } from 'react';
import { API_BASE_URL } from '../constants/config';
import { toBoolean } from '../utils/boolean';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: (insets.bottom || 8) + 80 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.title}>Profile Setting</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.container}>
          {user ? (
            <View style={styles.profileCard}>
              <View style={styles.profileRow}>
                <View style={styles.avatarCircle}>
                  {(() => {
                    const base = API_BASE_URL.replace(/\/?api$/, '');
                    let url = (user as any)?.avatar_url;
                    // Fix URL if needed
                    if (url && !/^https?:\/\//i.test(url)) url = base + url;
                    if (url && /localhost|127\.0\.0\.1/.test(url)) url = url.replace(/^https?:\/\/[^/]+/, base);

                    return (
                      <InitialAvatar
                        name={user.name}
                        avatarUrl={url}
                        size={56}
                        style={styles.avatar}
                        role="patient"
                      />
                    );
                  })()}
                </View>
                <View>
                  <Text style={styles.name}>{user.name}</Text>
                  <Text style={styles.email}>{user.email}</Text>
                  <View style={styles.roleChip}><Text style={styles.roleChipText}>{user.role === 'OPTOMETRIST' || user.role === 'optometris' ? 'optometris' : 'user'}</Text></View>
                  {!!(user as any)?.avatar_url && (
                    <Text style={[styles.email, { marginTop: 6 }]}>(avatar) {(user as any).avatar_url}</Text>
                  )}
                </View>
              </View>
            </View>
          ) : (
            <Text style={{ color: '#6B7280' }}>Belum login</Text>
          )}

          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.itemRow} onPress={() => router.push('/settings/edit-profile')}>
              <View style={[styles.itemIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="person-circle-outline" size={22} color="#6366F1" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Edit Profile</Text>
                <Text style={styles.itemSubtitle}>Ubah foto, nama, nomor, email</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.itemRow}>
              <View style={[styles.itemIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#6366F1" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Change Password</Text>
                <Text style={styles.itemSubtitle}>Perbarui keamanan akun</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.itemRow}>
              <View style={[styles.itemIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="shield-outline" size={20} color="#6366F1" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Terms of Use</Text>
                <Text style={styles.itemSubtitle}>Pelajari syarat penggunaan</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.itemRow}>
              <View style={[styles.itemIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="file-tray-full-outline" size={20} color="#6366F1" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Invoice History</Text>
                <Text style={styles.itemSubtitle}>Lacak semua transaksi pembelian</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionCard}>
            <View style={styles.itemRow}>
              <View style={[styles.itemIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="notifications-outline" size={20} color="#6366F1" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Notification</Text>
                <Text style={styles.itemSubtitle}>Atur preferensi notifikasi</Text>
              </View>
              <Switch value={toBoolean(notifEnabled)} onValueChange={setNotifEnabled} />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.itemRow}>
              <View style={[styles.itemIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="help-circle-outline" size={20} color="#6366F1" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>FAQ</Text>
                <Text style={styles.itemSubtitle}>Bantuan dan pertanyaan umum</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.logoutRow} onPress={logout}>
              <View style={[styles.itemIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="exit-outline" size={20} color="#EF4444" />
              </View>
              <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, { color: '#EF4444' }]}>Log Out</Text>
                <Text style={[styles.itemSubtitle, { color: '#EF4444' }]}>Keluar dari akun</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <BottomNavigationBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: {},
  headerRow: { paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  container: { paddingHorizontal: 16, paddingTop: 12 },
  profileCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', marginRight: 12, backgroundColor: '#E0E7FF' },
  avatar: { width: 56, height: 56 },
  name: { fontSize: 18, fontWeight: '700', color: '#111827' },
  email: { fontSize: 14, color: '#6B7280' },
  roleChip: { marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: '#EEF2FF' },
  roleChipText: { color: '#6366F1', fontWeight: '600', fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginTop: 20, marginBottom: 10 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  logoutRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  itemIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  itemSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 16 },
});
