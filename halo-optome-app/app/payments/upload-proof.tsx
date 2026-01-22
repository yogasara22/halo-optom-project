import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { uploadPaymentProof } from '../../services/paymentService';

export default function UploadProofScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const paymentId = params.payment_id as string;

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const pickImage = async (source: 'camera' | 'gallery') => {
        try {
            let result;

            if (source === 'camera') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Kami memerlukan izin kamera untuk melanjutkan');
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    quality: 0.8,
                });
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Kami memerlukan izin galeri untuk melanjutkan');
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    quality: 0.8,
                });
            }

            if (!result.canceled && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Gagal memilih gambar');
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) {
            Alert.alert('Peringatan', 'Silakan pilih bukti pembayaran terlebih dahulu');
            return;
        }

        try {
            setUploading(true);

            // Upload file to server
            await uploadPaymentProof(paymentId, selectedImage);

            Alert.alert(
                'Berhasil',
                'Bukti pembayaran berhasil diupload. Menunggu verifikasi admin.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            router.replace({
                                pathname: '/payments/pending',
                                params: { payment_id: paymentId }
                            });
                        }
                    }
                ]
            );
        } catch (error: any) {
            console.error('Error uploading proof:', error);
            Alert.alert('Error', error?.response?.data?.message || error?.message || 'Gagal mengupload bukti pembayaran');
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upload Bukti Transfer</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={20} color="#1876B8" />
                    <Text style={styles.infoText}>
                        Upload foto bukti transfer yang jelas. Pastikan nominal dan tanggal terlihat dengan jelas.
                    </Text>
                </View>

                {selectedImage ? (
                    <View style={styles.imagePreviewContainer}>
                        <Text style={styles.previewLabel}>Preview Bukti Transfer</Text>
                        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                        <TouchableOpacity
                            onPress={() => setSelectedImage(null)}
                            style={styles.removeImageButton}
                        >
                            <Ionicons name="close-circle" size={24} color="#ef4444" />
                            <Text style={styles.removeImageText}>Hapus Gambar</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.uploadOptions}>
                        <Text style={styles.optionsTitle}>Pilih Sumber Gambar</Text>

                        <TouchableOpacity
                            onPress={() => pickImage('camera')}
                            style={styles.optionButton}
                        >
                            <View style={styles.optionIcon}>
                                <Ionicons name="camera-outline" size={32} color="#1876B8" />
                            </View>
                            <Text style={styles.optionText}>Ambil Foto</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => pickImage('gallery')}
                            style={styles.optionButton}
                        >
                            <View style={styles.optionIcon}>
                                <Ionicons name="images-outline" size={32} color="#1876B8" />
                            </View>
                            <Text style={styles.optionText}>Pilih dari Galeri</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>Tips Upload Bukti Transfer:</Text>
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                        <Text style={styles.tipText}>Pastikan gambar tidak blur</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                        <Text style={styles.tipText}>Nominal transfer harus sesuai</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                        <Text style={styles.tipText}>Tanggal dan waktu terlihat jelas</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                        <Text style={styles.tipText}>Format gambar: JPG, PNG</Text>
                    </View>
                </View>
            </ScrollView>

            {selectedImage && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handleUpload}
                        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text style={styles.uploadButtonText}>Mengupload...</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                                <Text style={styles.uploadButtonText}>Upload Bukti Transfer</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f172a',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    infoCard: {
        backgroundColor: '#e0f2fe',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#7dd3fc',
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 13,
        color: '#0c4a6e',
        lineHeight: 18,
    },
    imagePreviewContainer: {
        marginBottom: 20,
    },
    previewLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 12,
    },
    imagePreview: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
    },
    removeImageButton: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#fee2e2',
        borderRadius: 8,
    },
    removeImageText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#ef4444',
    },
    uploadOptions: {
        marginBottom: 20,
    },
    optionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 16,
    },
    optionButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    optionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#e0f2fe',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
    },
    tipsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 12,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tipText: {
        marginLeft: 8,
        fontSize: 13,
        color: '#475569',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    uploadButton: {
        backgroundColor: '#1876B8',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#1876B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    uploadButtonDisabled: {
        opacity: 0.6,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
