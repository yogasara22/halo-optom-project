import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type PaymentMethod = 'bank_transfer' | 'payment_gateway';

interface PaymentMethodSelectorProps {
    selectedMethod: PaymentMethod;
    onMethodChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pilih Metode Pembayaran</Text>

            {/* Bank Transfer Option */}
            <TouchableOpacity
                style={[
                    styles.optionCard,
                    selectedMethod === 'bank_transfer' && styles.selectedCard
                ]}
                onPress={() => onMethodChange('bank_transfer')}
            >
                <View style={styles.optionHeader}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name="business-outline"
                            size={24}
                            color={selectedMethod === 'bank_transfer' ? '#1876B8' : '#64748b'}
                        />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={[
                            styles.optionTitle,
                            selectedMethod === 'bank_transfer' && styles.selectedText
                        ]}>
                            Transfer Bank Manual
                        </Text>
                        <Text style={styles.optionDescription}>
                            Transfer ke rekening bank kami
                        </Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>REKOMENDASI</Text>
                        </View>
                    </View>
                    <View style={styles.radioContainer}>
                        <View style={[
                            styles.radioOuter,
                            selectedMethod === 'bank_transfer' && styles.radioOuterSelected
                        ]}>
                            {selectedMethod === 'bank_transfer' && (
                                <View style={styles.radioInner} />
                            )}
                        </View>
                    </View>
                </View>
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={16} color="#1876B8" />
                    <Text style={styles.infoText}>
                        Batas waktu pembayaran 24 jam. Upload bukti transfer setelah melakukan pembayaran.
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Payment Gateway Option */}
            <TouchableOpacity
                style={[
                    styles.optionCard,
                    selectedMethod === 'payment_gateway' && styles.selectedCard
                ]}
                onPress={() => onMethodChange('payment_gateway')}
            >
                <View style={styles.optionHeader}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name="card-outline"
                            size={24}
                            color={selectedMethod === 'payment_gateway' ? '#1876B8' : '#64748b'}
                        />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={[
                            styles.optionTitle,
                            selectedMethod === 'payment_gateway' && styles.selectedText
                        ]}>
                            Payment Gateway
                        </Text>
                        <Text style={styles.optionDescription}>
                            Bayar dengan kartu kredit, e-wallet, dll
                        </Text>
                    </View>
                    <View style={styles.radioContainer}>
                        <View style={[
                            styles.radioOuter,
                            selectedMethod === 'payment_gateway' && styles.radioOuterSelected
                        ]}>
                            {selectedMethod === 'payment_gateway' && (
                                <View style={styles.radioInner} />
                            )}
                        </View>
                    </View>
                </View>
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={16} color="#1876B8" />
                    <Text style={styles.infoText}>
                        Pembayaran langsung diproses secara otomatis.
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 16,
    },
    optionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedCard: {
        borderColor: '#1876B8',
        backgroundColor: '#f0f9ff',
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 4,
    },
    selectedText: {
        color: '#1876B8',
    },
    optionDescription: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 4,
    },
    badge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#16a34a',
    },
    radioContainer: {
        marginLeft: 8,
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: '#1876B8',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#1876B8',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#e0f2fe',
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: '#7dd3fc',
    },
    infoText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 12,
        color: '#0c4a6e',
        lineHeight: 18,
    },
});
