import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import { API_BASE_URL } from '../../constants/config';
let ImagePicker: any = null;
try { ImagePicker = require('expo-image-picker'); } catch {}

export default function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState((user as any)?.phone || '');
  const [gender, setGender] = useState<'laki-laki'|'perempuan'>(((user as any)?.gender === 'perempuan' ? 'perempuan' : 'laki-laki'));
  const [address, setAddress] = useState((user as any)?.address || '');
  const [strNumber, setStrNumber] = useState((user as any)?.str_number || '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>((user as any)?.avatar_url || undefined);
  const [saving, setSaving] = useState(false);

  const base = API_BASE_URL.replace(/\/?api$/, '');
  const resolvedAvatar = (() => {
    let url = avatarUrl;
    if (url && !/^https?:\/\//i.test(url)) url = base + url;
    if (url && /localhost|127\.0\.0\.1/.test(url)) url = url.replace(/^https?:\/\/[^/]+/, base);
    return url;
  })();

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (insets.bottom || 8) + 60 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={{width:24}} />
        </View>

        <View style={styles.card}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={styles.avatarCircleLarge}>
              {resolvedAvatar ? (
                <Image source={{ uri: resolvedAvatar }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Image source={require('../../assets/images/avatar.png')} style={{ width: '100%', height: '100%' }} />
              )}
            </View>
            <TouchableOpacity
              style={styles.changePhotoBtn}
              onPress={async () => {
                try {
                  if (!ImagePicker) {
                    Alert.alert('Fitur tidak tersedia', 'Image picker belum terpasang.');
                    return;
                  }
                  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (perm?.status !== 'granted') {
                    Alert.alert('Izin diperlukan', 'Berikan izin galeri untuk memilih foto');
                    return;
                  }
                  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker?.MediaTypeOptions?.Images, quality: 0.8 });
                  if (res.canceled) return;
                  const asset = res.assets?.[0];
                  if (!asset) return;
                  const url = await patientService.uploadMyAvatar({ uri: asset.uri, name: asset.fileName || 'avatar.jpg', type: asset.mimeType || 'image/jpeg' });
                  setAvatarUrl(url);
                  Alert.alert('Berhasil', 'Foto profil diperbarui');
                } catch (e: any) {
                  Alert.alert('Gagal', e?.message || 'Tidak dapat mengunggah foto');
                }
              }}
            >
              <Text style={styles.changePhotoText}>Ubah Foto</Text>
            </TouchableOpacity>
            {!!avatarUrl && (
              <Text style={styles.avatarUrlText}>{avatarUrl}</Text>
            )}
          </View>

          <Text style={styles.label}>Nama</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Nama" />

          <Text style={styles.label}>Nomor HP</Text>
          <TextInput value={phone} onChangeText={setPhone} style={styles.input} placeholder="08xxxxxxxxxx" keyboardType="phone-pad" />

          <Text style={styles.label}>Email</Text>
          <TextInput value={user?.email || ''} editable={false} style={[styles.input, { backgroundColor: '#f1f5f9' }]} />

          <Text style={styles.label}>Jenis Kelamin</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 8 }}>
            {(['laki-laki','perempuan'] as const).map(g => (
              <TouchableOpacity key={g} onPress={() => setGender(g)} style={[styles.chip, gender === g && styles.chipActive]}>
                <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>{g === 'laki-laki' ? 'Laki-laki' : 'Perempuan'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Alamat</Text>
          <TextInput value={address} onChangeText={setAddress} style={styles.input} placeholder="Alamat" />

          {((user as any)?.role === 'OPTOMETRIST' || (user as any)?.role === 'optometris') && (
            <>
              <Text style={styles.label}>Nomor STR</Text>
              <TextInput value={strNumber} onChangeText={setStrNumber} style={styles.input} placeholder="Nomor STR Optometris" />
            </>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, { opacity: saving ? 0.7 : 1 }]}
            disabled={saving}
            onPress={async () => {
              try {
                setSaving(true);
                await patientService.updateMyProfile({ name, phone, gender, address, str_number: strNumber, avatar_url: avatarUrl });
                Alert.alert('Berhasil', 'Profil diperbarui');
                router.back();
              } catch (e: any) {
                Alert.alert('Gagal', e?.message || 'Tidak dapat memperbarui profil');
              } finally {
                setSaving(false);
              }
            }}
          >
            <Text style={styles.saveText}>{saving ? 'Menyimpan...' : 'Simpan'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  headerRow: { paddingHorizontal: 0, paddingTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  avatarCircleLarge: { width: 96, height: 96, borderRadius: 48, overflow: 'hidden', backgroundColor: '#E0E7FF', borderWidth: 2, borderColor: '#cbd5e1' },
  changePhotoBtn: { marginTop: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2563EB' },
  changePhotoText: { color: '#fff', fontWeight: 'bold' },
  avatarUrlText: { marginTop: 6, fontSize: 12, color: '#64748b' },
  label: { fontSize: 14, color: '#64748b', marginTop: 12 },
  input: { marginTop: 6, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#f1f5f9' },
  chipActive: { backgroundColor: '#e0f2fe', borderWidth: 1, borderColor: '#93c5fd' },
  chipText: { color: '#0f172a', fontSize: 12 },
  chipTextActive: { color: '#2563EB', fontWeight: '600' },
  saveBtn: { backgroundColor: '#1876B8', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  saveText: { color: '#fff', fontWeight: '600' },
});
