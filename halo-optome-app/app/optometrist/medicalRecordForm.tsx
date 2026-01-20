import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/config';

export default function MedicalRecordFormScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const appointmentId = params.appointmentId as string;
    const patientId = params.patientId as string;
    const patientName = params.patientName as string;

    const [diagnosis, setDiagnosis] = useState('');
    const [prescription, setPrescription] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        // Validation
        if (!diagnosis.trim()) {
            Alert.alert('Error', 'Diagnosis harus diisi');
            return;
        }

        try {
            setSubmitting(true);
            const token = await AsyncStorage.getItem('authToken');

            if (!token) {
                Alert.alert('Error', 'Tidak ada token autentikasi');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/medicalRecords`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    patient_id: patientId,
                    appointment_id: appointmentId,
                    diagnosis,
                    prescription,
                    notes,
                }),
            });

            if (response.ok) {
                Alert.alert(
                    'Berhasil',
                    'Rekam medis berhasil disimpan',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Navigate back to optometrist dashboard
                                router.replace('/optometrist');
                            },
                        },
                    ]
                );
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Gagal menyimpan rekam medis');
            }
        } catch (e: any) {
            console.error('Error submitting medical record:', e);
            Alert.alert('Error', 'Terjadi kesalahan saat menyimpan rekam medis');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Rekam Medis</Text>
                    <Text style={styles.headerSubtitle}>{patientName}</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Patient Info */}
                    <View style={styles.infoCard}>
                        <Ionicons name="person-outline" size={20} color="#1876B8" />
                        <Text style={styles.infoText}>Pasien: {patientName}</Text>
                    </View>

                    {/* Diagnosis */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Diagnosis <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Masukkan diagnosis pasien..."
                            value={diagnosis}
                            onChangeText={setDiagnosis}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Prescription */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Resep / Tindakan</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Masukkan resep atau tindakan yang diberikan..."
                            value={prescription}
                            onChangeText={setPrescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Notes */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Catatan Tambahan</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Catatan tambahan (opsional)..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={styles.submitButtonText}>Simpan Rekam Medis</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        gap: 12,
    },
    infoText: {
        fontSize: 15,
        color: '#1e40af',
        fontWeight: '600',
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    required: {
        color: '#dc2626',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1e293b',
    },
    textArea: {
        minHeight: 120,
        paddingTop: 12,
    },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: '#1876B8',
        borderRadius: 12,
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#94a3b8',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
