import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    balanceFormatted?: string;
    onPayout?: () => void;
}

export default function CommissionCard({ balanceFormatted = 'Rp 0', onPayout }: Props) {
    return (
        <LinearGradient
            colors={['#16a34a', '#15803d']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.content}>
                <View>
                    <Text style={styles.label}>Saldo Komisi Saat Ini</Text>
                    <Text style={styles.balance}>{balanceFormatted}</Text>
                </View>
                <TouchableOpacity style={styles.payoutButton} activeOpacity={0.8} onPress={onPayout}>
                    <Text style={styles.payoutText}>Tarik Saldo</Text>
                    <Ionicons name="arrow-forward-circle" size={20} color="#16a34a" style={{ marginLeft: 4 }} />
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
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    label: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    balance: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
    },
    payoutButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    payoutText: {
        color: '#16a34a',
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
