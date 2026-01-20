import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    balanceFormatted?: string;
    onPayout?: () => void;
    onViewHistory?: () => void;
}

export default function CommissionCard({ balanceFormatted = 'Rp 0', onPayout, onViewHistory }: Props) {
    return (
        <LinearGradient
            colors={['#16a34a', '#15803d']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.content}>
                <View style={styles.leftContent}>
                    <Text style={styles.label}>Saldo Komisi Saat Ini</Text>
                    <Text style={styles.balance}>{balanceFormatted}</Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.payoutButton} activeOpacity={0.8} onPress={onPayout}>
                    <Ionicons name="wallet-outline" size={18} color="#16a34a" style={{ marginRight: 6 }} />
                    <Text style={styles.payoutText}>Tarik Saldo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.historyButton} activeOpacity={0.8} onPress={onViewHistory}>
                    <Ionicons name="time-outline" size={16} color="#dcfce7" />
                    <Text style={styles.historyText}>Riwayat</Text>
                </TouchableOpacity>
            </View>

            {/* Decorative Circles */}
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
        marginBottom: 12,
        position: 'relative',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    content: {
        zIndex: 10,
        marginBottom: 16,
    },
    leftContent: {
        flex: 1,
    },
    label: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    balance: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '700',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
        zIndex: 10,
    },
    payoutButton: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    payoutText: {
        color: '#16a34a',
        fontWeight: '700',
        fontSize: 14,
    },
    historyButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    historyText: {
        color: '#dcfce7',
        fontWeight: '600',
        fontSize: 13,
    },
    circle: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 100,
    },
    circle1: {
        width: 100,
        height: 100,
        top: -30,
        right: -20,
    },
    circle2: {
        width: 80,
        height: 80,
        bottom: -20,
        left: -10,
    },
});
