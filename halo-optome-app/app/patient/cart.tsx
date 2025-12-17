import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import { formatRupiah } from '../../utils/format';
import { toBoolean } from '../../utils/boolean';

export default function CartScreen() {
    const router = useRouter();
    const { cart, addToCart, decreaseQuantity, removeFromCart, clearCart } = useCart();
    const [isCheckingOut, setCheckingOut] = useState(false);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal;

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setCheckingOut(true);
        // Simulate API call
        setTimeout(() => {
            setCheckingOut(false);
            Alert.alert(
                'Checkout Berhasil',
                'Terima kasih telah berbelanja! Pesanan Anda sedang diproses.',
                [{
                    text: 'OK', onPress: () => {
                        clearCart();
                        router.back();
                    }
                }]
            );
        }, 1500);
    };

    if (cart.length === 0) {
        return (
            <SafeAreaView style={styles.root}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Keranjang Belanja</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="cart-outline" size={64} color="#cbd5e1" />
                    </View>
                    <Text style={styles.emptyTitle}>Keranjang Kosong</Text>
                    <Text style={styles.emptyText}>Anda belum menambahkan produk apapun.</Text>
                    <TouchableOpacity style={styles.browseBtn} onPress={() => router.back()}>
                        <Text style={styles.browseText}>Mulai Belanja</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Keranjang ({cart.reduce((a, c) => a + c.quantity, 0)})</Text>
                <TouchableOpacity onPress={() => {
                    Alert.alert('Hapus Semua', 'Kosongkan keranjang?', [{ text: 'Batal' }, { text: 'Ya', style: 'destructive', onPress: clearCart }]);
                }}>
                    <Text style={styles.clearText}>Hapus</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {cart.map(item => (
                    <View key={item.id} style={styles.cartItem}>
                        <Image source={item.imageUrl ? { uri: item.imageUrl } : require('../../assets/images/logo.png')} style={styles.itemImage} resizeMode="contain" />
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                            <Text style={styles.itemPrice}>{formatRupiah(item.price)}</Text>
                            <View style={styles.qtyRow}>
                                <TouchableOpacity onPress={() => decreaseQuantity(item.id)} style={styles.qtyBtn}>
                                    <Ionicons name="remove" size={16} color="#475569" />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{item.quantity}</Text>
                                <TouchableOpacity onPress={() => addToCart(item)} style={styles.qtyBtn}>
                                    <Ionicons name="add" size={16} color="#475569" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                ))}

                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>{formatRupiah(subtotal)}</Text>
                    </View>

                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.checkoutBtn, isCheckingOut && styles.checkoutBtnDisabled]}
                    disabled={toBoolean(isCheckingOut)}
                    onPress={handleCheckout}
                >
                    <Text style={styles.checkoutText}>{isCheckingOut ? 'Memproses...' : 'Checkout Sekarang'}</Text>
                    {!isCheckingOut && <Ionicons name="arrow-forward" size={20} color="#fff" />}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    clearText: { color: '#ef4444', fontWeight: '600', fontSize: 14 },
    content: { padding: 20, paddingBottom: 100 },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
    emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 },
    browseBtn: {
        backgroundColor: '#1876B8',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 999,
    },
    browseText: { color: '#fff', fontWeight: 'bold' },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 16,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        marginRight: 12,
    },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
    itemPrice: { fontSize: 14, fontWeight: '700', color: '#1876B8', marginBottom: 8 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    qtyText: { fontSize: 14, fontWeight: '600', color: '#0f172a', minWidth: 20, textAlign: 'center' },
    removeBtn: { padding: 8 },
    summaryCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginTop: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: { fontSize: 14, color: '#64748b' },
    summaryValue: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
    totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: '#1876B8' },
    footer: {
        padding: 20,
        backgroundColor: '#white',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    checkoutBtn: {
        backgroundColor: '#1876B8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        shadowColor: '#1876B8',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    checkoutBtnDisabled: {
        backgroundColor: '#94a3b8',
        shadowOpacity: 0,
        elevation: 0,
    },
    checkoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
