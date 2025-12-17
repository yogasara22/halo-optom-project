import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../constants/config';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        Alert.alert(
            'Konfirmasi Logout',
            'Apakah Anda yakin ingin keluar?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/auth/login');
                    }
                }
            ]
        );
    };

    const base = API_BASE_URL.replace(/\/?api$/, '');
    const avatarSource = (() => {
        let url = user?.avatar_url;
        if (url && !/^https?:\/\//i.test(url)) url = base + url;
        if (url && /localhost|127\.0\.0\.1/.test(url)) url = url.replace(/^https?:\/\/[^/]+/, base);
        return url ? { uri: url } : require('../../assets/images/avatar.png');
    })();

    const MenuSection = ({ title, items }: { title: string, items: any[] }) => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.menuGroup}>
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.menuItem, index === items.length - 1 && styles.menuItemLast]}
                        onPress={item.action}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuLeft}>
                            <View style={[styles.iconBox, { backgroundColor: item.color || '#eff6ff' }]}>
                                <Ionicons name={item.icon} size={20} color={item.iconColor || '#1876B8'} />
                            </View>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const accountItems = [
        { icon: 'person', label: 'Edit Profil', action: () => router.push('/settings/edit-profile'), color: '#eff6ff', iconColor: '#2563EB' },
        { icon: 'lock-closed', label: 'Ubah Password', action: () => Alert.alert('Info', 'Fitur ubah password akan segera hadir'), color: '#fff1f2', iconColor: '#e11d48' },
        { icon: 'wallet', label: 'Riwayat Transaksi', action: () => router.push('/patient/shop'), color: '#f0fdf4', iconColor: '#16a34a' },
    ];

    const supportItems = [
        { icon: 'help-circle', label: 'Bantuan & Dukungan', action: () => Alert.alert('Info', 'Hubungi customer service kami'), color: '#fff7ed', iconColor: '#ea580c' },
        { icon: 'information-circle', label: 'Tentang Aplikasi', action: () => Alert.alert('Halo Optom', 'Versi 1.0.0 (Build 12)'), color: '#f8fafc', iconColor: '#475569' },
    ];

    return (
        <View style={styles.root}>
            {/* Header Background */}
            <View style={styles.headerBackground}>
                <LinearGradient
                    colors={['#1876B8', '#3b82f6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                />
                <View style={styles.headerDecorationCircle1} />
                <View style={styles.headerDecorationCircle2} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <SafeAreaView edges={['top']} style={{ marginBottom: 10 }}>
                    <Text style={styles.pageTitle}>Profil Saya</Text>
                </SafeAreaView>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatarContainer}>
                            <Image source={avatarSource} style={styles.avatar} />
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                            </View>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName} numberOfLines={1}>{user?.name || 'Pengguna'}</Text>
                            <Text style={styles.userEmail} numberOfLines={1}>{user?.email || 'email@example.com'}</Text>
                            <View style={styles.roleTag}>
                                <Text style={styles.roleText}>Pasien Member</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Menu Sections */}
                <MenuSection title="Akun Saya" items={accountItems} />
                <MenuSection title="Lainnya" items={supportItems} />

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                    <Text style={styles.logoutText}>Keluar Aplikasi</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Halo Optom v1.0.0</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 280,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    headerGradient: {
        width: '100%',
        height: '100%',
    },
    headerDecorationCircle1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerDecorationCircle2: {
        position: 'absolute',
        top: 100,
        left: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#1876B8',
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
        marginBottom: 30,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#f0f9ff',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#16a34a',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8,
    },
    roleTag: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    roleText: {
        color: '#2563EB',
        fontSize: 11,
        fontWeight: '700',
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94a3b8',
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuGroup: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 6,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    menuLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    logoutButton: {
        marginTop: 10,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fecaca',
        backgroundColor: '#fffafa',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoutText: {
        color: '#dc2626',
        fontSize: 16,
        fontWeight: '700',
    },
    versionText: {
        textAlign: 'center',
        color: '#cbd5e1',
        fontSize: 12,
        fontWeight: '500',
    },
});
