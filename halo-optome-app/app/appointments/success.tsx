import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function PaymentSuccessScreen() {
    const router = useRouter();
    const { type } = useLocalSearchParams();
    const isHomecare = type === 'homecare';

    const handleBackToHome = () => {
        router.replace('/patient');
    };

    const handleViewAppointments = () => {
        router.replace('/patient/schedule');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Success Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="checkmark" size={64} color="#fff" />
                    </View>
                </View>

                {/* Success Message */}
                <Text style={styles.title}>{isHomecare ? 'Booking Berhasil' : 'Pembayaran Berhasil!'}</Text>
                <Text style={styles.message}>
                    {isHomecare
                        ? 'Terima kasih! Janji temu Anda telah dikonfirmasi.\nSilakan lakukan pembayaran saat optometris datang.'
                        : 'Terima kasih! Pembayaran Anda telah berhasil diproses.\nAppointment Anda sudah dikonfirmasi.'
                    }
                </Text>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Ionicons name="information-circle-outline" size={20} color="#1876B8" />
                        <Text style={styles.infoText}>
                            Anda akan menerima notifikasi sebelum waktu appointment
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={handleViewAppointments}
                        style={styles.primaryButton}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#fff" />
                        <Text style={styles.primaryButtonText}>Lihat Appointment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleBackToHome}
                        style={styles.secondaryButton}
                    >
                        <Text style={styles.secondaryButtonText}>Kembali ke Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconContainer: {
        marginBottom: 32,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    infoCard: {
        backgroundColor: '#e0f2fe',
        borderRadius: 12,
        padding: 16,
        marginBottom: 32,
        width: '100%',
        borderWidth: 1,
        borderColor: '#7dd3fc',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    infoText: {
        marginLeft: 12,
        fontSize: 14,
        color: '#0c4a6e',
        flex: 1,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
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
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: '#cbd5e1',
    },
    secondaryButtonText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
