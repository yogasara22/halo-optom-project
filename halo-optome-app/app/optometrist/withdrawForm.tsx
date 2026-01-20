import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import walletService from '../../services/walletService';

const MINIMUM_WITHDRAWAL = 50000;

const BANKS = [
    'BCA', 'Mandiri', 'BNI', 'BRI', 'BSI', 'CIMB Niaga',
    'Permata', 'Danamon', 'BTN', 'Maybank', 'OCBC NISP'
];

export default function WithdrawFormScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        bank_name: '',
        bank_account_number: '',
        bank_account_name: '',
    });
    const [showBankDropdown, setShowBankDropdown] = useState(false);

    const formatToIDR = (value: string) => {
        const num = parseInt(value.replace(/\D/g, ''), 10);
        if (isNaN(num)) return '';
        return num.toLocaleString('id-ID');
    };

    const handleAmountChange = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        setFormData({ ...formData, amount: cleaned });
    };

    const handleBankSelect = (bank: string) => {
        setFormData({ ...formData, bank_name: bank });
        setShowBankDropdown(false);
    };

    const handleSubmit = async () => {
        const amount = parseInt(formData.amount);

        // Validation
        if (!amount || amount < MINIMUM_WITHDRAWAL) {
            Alert.alert(
                'Jumlah Tidak Valid',
                `Minimum penarikan adalah Rp ${MINIMUM_WITHDRAWAL.toLocaleString('id-ID')}`
            );
            return;
        }

        if (!formData.bank_name.trim()) {
            Alert.alert('Bank Belum Dipilih', 'Silakan pilih bank tujuan');
            return;
        }

        if (!formData.bank_account_number.trim()) {
            Alert.alert('Nomor Rekening Kosong', 'Silakan isi nomor rekening');
            return;
        }

        if (!formData.bank_account_name.trim()) {
            Alert.alert('Nama Pemilik Rekening Kosong', 'Silakan isi nama pemilik rekening');
            return;
        }

        Alert.alert(
            'Konfirmasi Penarikan',
            `Anda akan menarik Rp ${amount.toLocaleString('id-ID')} ke rekening ${formData.bank_name} atas nama ${formData.bank_account_name}.\n\nDana akan masuk setelah admin menyetujui permintaan Anda.`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Ya, Ajukan',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await walletService.createWithdrawRequest({
                                amount,
                                bank_name: formData.bank_name,
                                bank_account_number: formData.bank_account_number,
                                bank_account_name: formData.bank_account_name,
                            });

                            Alert.alert(
                                'Permintaan Berhasil Diajukan! ✅',
                                'Permintaan penarikan Anda sudah diterima dan sedang dalam proses review oleh admin. Anda akan mendapat notifikasi setelah disetujui.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => router.back(),
                                    },
                                ]
                            );
                        } catch (error: any) {
                            Alert.alert('Gagal Mengajukan Penarikan', error.message || 'Terjadi kesalahan. Silakan coba lagi.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tarik Saldo</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 300 }}
                >
                    <View style={styles.content}>
                        {/* Info Card */}
                        <LinearGradient
                            colors={['#eff6ff', '#dbeafe']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.infoCard}
                        >
                            <Ionicons name="information-circle" size={24} color="#2563eb" />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoTitle}>Informasi Penting</Text>
                                <Text style={styles.infoText}>
                                    • Penarikan minimum Rp {MINIMUM_WITHDRAWAL.toLocaleString('id-ID')}{'\n'}
                                    • Proses memerlukan persetujuan admin{'\n'}
                                    • Transfer dilakukan secara manual
                                </Text>
                            </View>
                        </LinearGradient>

                        {/* Amount Input */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Jumlah Penarikan</Text>
                            <View style={styles.amountInputContainer}>
                                <Text style={styles.currencyLabel}>Rp</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={formatToIDR(formData.amount)}
                                    onChangeText={handleAmountChange}
                                    editable={!loading}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                            <Text style={styles.helperText}>
                                Minimum penarikan: Rp {MINIMUM_WITHDRAWAL.toLocaleString('id-ID')}
                            </Text>
                        </View>

                        {/* Bank Selection */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Bank Tujuan</Text>
                            <TouchableOpacity
                                style={styles.bankSelector}
                                onPress={() => setShowBankDropdown(!showBankDropdown)}
                                disabled={loading}
                            >
                                <Ionicons name="business-outline" size={20} color="#64748b" />
                                <Text style={[styles.bankSelectorText, !formData.bank_name && styles.placeholder]}>
                                    {formData.bank_name || 'Pilih Bank'}
                                </Text>
                                <Ionicons
                                    name={showBankDropdown ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color="#64748b"
                                />
                            </TouchableOpacity>

                            {showBankDropdown && (
                                <View style={styles.dropdown}>
                                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                                        {BANKS.map((bank) => (
                                            <TouchableOpacity
                                                key={bank}
                                                style={styles.dropdownItem}
                                                onPress={() => handleBankSelect(bank)}
                                            >
                                                <Text style={styles.dropdownItemText}>{bank}</Text>
                                                {formData.bank_name === bank && (
                                                    <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Account Number */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Nomor Rekening</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="card-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contoh: 1234567890"
                                    keyboardType="numeric"
                                    value={formData.bank_account_number}
                                    onChangeText={(text) =>
                                        setFormData({ ...formData, bank_account_number: text.replace(/\D/g, '') })
                                    }
                                    editable={!loading}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                        </View>

                        {/* Account Holder Name */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Nama Pemilik Rekening</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Sesuai nama di rekening"
                                    value={formData.bank_account_name}
                                    onChangeText={(text) =>
                                        setFormData({ ...formData, bank_account_name: text })
                                    }
                                    editable={!loading}
                                    autoCapitalize="words"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                            <Text style={styles.helperText}>
                                Pastikan nama sesuai dengan rekening bank Anda
                            </Text>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Text style={styles.submitButtonText}>Ajukan Penarikan</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    infoCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    infoTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e40af',
        marginBottom: 6,
    },
    infoText: {
        fontSize: 12,
        color: '#1e40af',
        lineHeight: 18,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 10,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 60,
    },
    currencyLabel: {
        fontSize: 20,
        fontWeight: '700',
        color: '#475569',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
    },
    bankSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    bankSelectorText: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        marginLeft: 12,
        fontWeight: '500',
    },
    placeholder: {
        color: '#94a3b8',
    },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginTop: 8,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        maxHeight: 200,
        overflow: 'hidden',
    },
    dropdownScroll: {
        maxHeight: 200,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dropdownItemText: {
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        marginLeft: 12,
        fontWeight: '500',
    },
    helperText: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 8,
        marginLeft: 4,
    },
    submitButton: {
        backgroundColor: '#16a34a',
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 24,
        alignItems: 'center',
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#94a3b8',
        shadowOpacity: 0,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginRight: 8,
    },
});
