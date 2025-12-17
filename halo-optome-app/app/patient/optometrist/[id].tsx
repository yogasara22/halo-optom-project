import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { toBoolean } from '../../../utils/boolean';
import { useAuth } from '../../../context/AuthContext';
import optometristService, { Optometrist } from '../../../services/optometristService';
import reviewService, { Review } from '../../../services/reviewService';
import { API_BASE_URL } from '../../../constants/config';

const { width } = Dimensions.get('window');

export default function OptometristDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    const [optometrist, setOptometrist] = useState<Optometrist | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [optData, reviewData] = await Promise.all([
                optometristService.getOptometristById(id as string),
                reviewService.getReviewsForOptometrist(id as string)
            ]);
            setOptometrist(optData);
            setReviews(reviewData);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Gagal memuat data optometris');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async () => {
        if (rating === 0) {
            Alert.alert('Peringatan', 'Mohon berikan rating bintang');
            return;
        }
        setSubmitting(true);
        try {
            await reviewService.createReview({
                optometrist_id: id as string,
                rating,
                comment
            });
            Alert.alert('Berhasil', 'Ulasan Anda telah dikirim');
            setModalVisible(false);
            setRating(0);
            setComment('');
            loadData(); // Reload reviews
        } catch (e) {
            console.error(e);
            Alert.alert('Gagal', 'Tidak dapat mengirim ulasan saat ini');
        } finally {
            setSubmitting(false);
        }
    };

    const resolveImage = (url?: string) => {
        const base = API_BASE_URL.replace(/\/?api$/, '');
        if (url && !/^https?:\/\//i.test(url)) return { uri: base + url };
        if (url && /localhost|127\.0\.0\.1/.test(url)) return { uri: url.replace(/^https?:\/\/[^/]+/, base) };
        return require('../../../assets/images/avatar.png');
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        } catch {
            return '-';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1876B8" />
            </View>
        );
    }

    if (!optometrist) {
        return (
            <SafeAreaView style={styles.root}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#0f172a" /></TouchableOpacity>
                </View>
                <View style={styles.center}>
                    <Text>Optometris tidak ditemukan</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.root}>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header Gradient & Info Section */}
                <LinearGradient colors={['#1876B8', '#2563EB']} style={styles.headerGradient}>
                    <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerSafe}>
                        <View style={styles.navBar}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.navTitle}>Profil Optometris</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <View style={styles.profileHeaderContent}>
                            <View style={styles.avatarWrapper}>
                                <Image source={resolveImage(optometrist.photo)} style={styles.avatar} />
                            </View>
                            <Text style={styles.name}>{optometrist.name}</Text>
                            <Text style={styles.speciality}>{optometrist.specialization || 'Optometris Profesional'}</Text>

                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Ionicons name="star" size={16} color="#fff" style={{ opacity: 0.9 }} />
                                    <Text style={styles.statValue}>{optometrist.rating || '0.0'}</Text>
                                    <Text style={styles.statLabel}>Rating</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Ionicons name="briefcase" size={16} color="#fff" style={{ opacity: 0.9 }} />
                                    <Text style={styles.statValue}>{optometrist.experience || '1 Thn'}</Text>
                                    <Text style={styles.statLabel}>Pengalaman</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Ionicons name="people" size={16} color="#fff" style={{ opacity: 0.9 }} />
                                    <Text style={styles.statValue}>100+</Text>
                                    <Text style={styles.statLabel}>Pasien</Text>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {/* Main Content (Rounded Sheet) */}
                <View style={styles.mainContent}>
                    {/* About Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tentang Saya</Text>
                        <Text style={styles.aboutText}>
                            {optometrist.bio || `Halo, saya ${optometrist.name}, seorang optometris berdedikasi dengan pengalaman dalam membantu pasien mendapatkan penglihatan terbaik mereka. Saya siap membantu Anda melakukan pemeriksaan dan konsultasi kesehatan mata.`}
                        </Text>
                    </View>

                    {/* Qualifications Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Kualifikasi</Text>

                        <View style={styles.qualItem}>
                            <View style={styles.qualIcon}>
                                <Ionicons name="school" size={22} color="#1876B8" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.qualLabel}>Sertifikasi</Text>
                                <Text style={styles.qualValue}>{optometrist.certifications || 'Sertifikasi Optometris Nasional'}</Text>
                            </View>
                        </View>

                        <View style={styles.qualItem}>
                            <View style={styles.qualIcon}>
                                <Ionicons name="card" size={22} color="#1876B8" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.qualLabel}>Nomor STR</Text>
                                <Text style={styles.qualValue}>{optometrist.str_number || '-'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Reviews Section */}
                    <View style={styles.section}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.sectionTitle}>Ulasan Pasien ({reviews.length})</Text>
                            <TouchableOpacity onPress={() => setModalVisible(true)}>
                                <Text style={styles.seeAll}>Tulis Ulasan</Text>
                            </TouchableOpacity>
                        </View>

                        {reviews.length > 0 ? (
                            reviews.map((rev) => (
                                <View key={rev.id} style={styles.reviewItem}>
                                    <View style={styles.reviewHeader}>
                                        <View style={styles.reviewerInfo}>
                                            <Image source={resolveImage(rev.user?.avatar_url)} style={styles.reviewerAvatar} />
                                            <View>
                                                <Text style={styles.reviewerName}>{rev.user?.name || 'Pasien'}</Text>
                                                <View style={{ flexDirection: 'row' }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Ionicons key={i} name="star" size={12} color={i < rev.rating ? "#f59e0b" : "#cbd5e1"} />
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                        <Text style={styles.reviewDate}>
                                            {formatDate(rev.created_at)}
                                        </Text>
                                    </View>
                                    <Text style={styles.reviewText}>{rev.comment}</Text>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyReview}>
                                <Ionicons name="chatbubble-outline" size={32} color="#cbd5e1" />
                                <Text style={styles.emptyText}>Belum ada ulasan.</Text>
                                <Text style={styles.emptySubText}>Jadilah yang pertama memberikan ulasan!</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Bottom CTA */}
            <SafeAreaView style={styles.footer} edges={['bottom']}>
                <TouchableOpacity style={styles.bookBtn} onPress={() => router.push({ pathname: '/appointments/book', params: { optometristId: id } })}>
                    <Text style={styles.bookBtnText}>Buat Janji Pemeriksaan</Text>
                </TouchableOpacity>
            </SafeAreaView>

            {/* Review Modal */}
            <Modal
                animationType="slide"
                transparent={toBoolean(true)}
                visible={toBoolean(modalVisible)}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Berikan Ulasan</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>Bagaimana pengalaman Anda dengan {optometrist.name}?</Text>

                        <View style={styles.starContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                    <Ionicons
                                        name={star <= rating ? "star" : "star-outline"}
                                        size={36}
                                        color="#f59e0b"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={styles.inputComment}
                            placeholder="Tulis komentar Anda di sini..."
                            multiline
                            numberOfLines={4}
                            value={comment}
                            onChangeText={setComment}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            style={[styles.submitBtn, (rating === 0 || submitting) && styles.disabledBtn]}
                            onPress={handleSubmitReview}
                            disabled={rating === 0 || submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitBtnText}>Kirim Ulasan</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#f8fafc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headerGradient: {
        paddingBottom: 40,
    },
    headerSafe: {
        paddingHorizontal: 0,
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    navTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },

    profileHeaderContent: {
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 20,
    },
    avatarWrapper: {
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 60,
        marginBottom: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
        textAlign: 'center',
    },
    speciality: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 20,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
    },

    mainContent: {
        backgroundColor: '#f8fafc',
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 30,
        minHeight: 500,
    },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
    aboutText: { fontSize: 14, color: '#475569', lineHeight: 24 },

    qualItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 2,
    },
    qualIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#e0f2fe',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    qualLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 2,
    },
    qualValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a',
    },

    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    seeAll: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
    reviewItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    reviewerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    reviewerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e2e8f0' },
    reviewerName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
    reviewDate: { fontSize: 12, color: '#94a3b8' },
    reviewText: { fontSize: 14, color: '#475569', lineHeight: 20 },

    emptyReview: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        borderStyle: 'dashed',
    },
    emptyText: { marginTop: 12, color: '#94a3b8', fontSize: 14, fontWeight: '500' },
    emptySubText: { marginTop: 4, color: '#cbd5e1', fontSize: 12 },

    footer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    bookBtn: {
        backgroundColor: '#1876B8',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#1876B8',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    bookBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
    modalSubtitle: { fontSize: 16, color: '#475569', marginBottom: 20, textAlign: 'center' },
    starContainer: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 24 },
    inputComment: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        minHeight: 120,
        textAlignVertical: 'top',
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 24,
    },
    submitBtn: {
        backgroundColor: '#1876B8',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    disabledBtn: { backgroundColor: '#cbd5e1' },
    submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
