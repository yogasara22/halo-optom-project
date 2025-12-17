import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import { shopService, Product } from '../../services/shopService';
import { API_BASE_URL } from '../../constants/config';
import { formatRupiah } from '../../utils/format';

const { width } = Dimensions.get('window');

// Mock Data for UI Structure
const CATEGORIES = [
    { id: '0', name: 'Semua', icon: 'grid' },
    { id: '1', name: 'Kacamata', icon: 'glasses' },
    { id: '2', name: 'Lensa Kontak', icon: 'eye' },
    { id: '3', name: 'Cairan Pembersih', icon: 'water' },
    { id: '4', name: 'Frame', icon: 'scan' },
    { id: '5', name: 'Aksesoris', icon: 'briefcase' },
    { id: '6', name: 'Lainnya', icon: 'ellipsis-horizontal' },
];

const PROMOS = [
    { id: '1', title: 'Diskon 50%', subtitle: 'Spesial Hari Raya', color: '#1876B8' },
    { id: '2', title: 'Beli 1 Gratis 1', subtitle: 'Lensa Kontak', color: '#0f172a' },
];

export default function ShopScreen() {
    const router = useRouter();
    const { cart, addToCart } = useCart();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Semua');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, [category, search]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            // In a real app, we would pass params to the backend filtering
            // For now, we fetch all and filter locally if needed, or pass search param
            const data = await shopService.getProducts({
                search: search.length > 2 ? search : undefined,
                category: category !== 'Semua' ? category : undefined
            });
            setProducts(data);
        } catch (e) {
            console.error("Failed to load products", e);
        } finally {
            setLoading(false);
        }
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const renderProduct = ({ item }: { item: Product }) => {
        // Resolve image URL
        const base = API_BASE_URL.replace(/\/?api$/, '');
        let imageUrl = item.image_url;
        if (imageUrl && !/^https?:\/\//i.test(imageUrl)) imageUrl = base + imageUrl;
        if (imageUrl && /localhost|127\.0\.0\.1/.test(imageUrl)) imageUrl = imageUrl.replace(/^https?:\/\/[^/]+/, base);

        const imageSource = imageUrl ? { uri: imageUrl } : require('../../assets/images/logo.png');

        return (
            <TouchableOpacity style={styles.productCard} activeOpacity={0.9} onPress={() => router.push(`/patient/item/${item.id}`)}>
                <View style={styles.productImageContainer}>
                    <Image source={imageSource} style={styles.productImage} resizeMode="cover" />
                    <TouchableOpacity style={styles.addBtn} onPress={() => addToCart({ id: item.id, name: item.name, price: item.price, imageUrl: imageUrl || '' })}>
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.productInfo}>
                    <Text style={styles.categoryTag}>{item.category}</Text>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color="#f59e0b" />
                        <Text style={styles.ratingText}>{item.rating || '4.5'} | Terjual {item.sold || '0'}</Text>
                    </View>
                    <Text style={styles.productPrice}>{formatRupiah(item.price)}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView style={styles.root}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari kacamata..."
                        placeholderTextColor="#94a3b8"
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={loadProducts}
                    />
                </View>
                <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/patient/cart')}>
                    <Ionicons name="cart-outline" size={26} color="#0f172a" />
                    {cartCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Banner Promo */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoContainer}>
                    {PROMOS.map(promo => (
                        <View key={promo.id} style={[styles.promoCard, { backgroundColor: promo.color }]}>
                            <View>
                                <Text style={styles.promoTitle}>{promo.title}</Text>
                                <Text style={styles.promoSubtitle}>{promo.subtitle}</Text>
                                <TouchableOpacity style={styles.promoBtn}>
                                    <Text style={[styles.promoBtnText, { color: promo.color }]}>Cek Sekarang</Text>
                                </TouchableOpacity>
                            </View>
                            <Image source={require('../../assets/images/logo.png')} style={styles.promoBgIcon} />
                        </View>
                    ))}
                </ScrollView>

                {/* Categories */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Kategori</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catContainer} contentContainerStyle={{ paddingRight: 20 }}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.catChip, category === cat.name && styles.catChipActive]}
                            onPress={() => setCategory(cat.name)}
                        >
                            <Ionicons name={cat.icon as any} size={16} color={category === cat.name ? '#fff' : '#64748b'} />
                            <Text style={[styles.catText, category === cat.name && styles.catTextActive]}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Product Grid */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Produk Terbaru</Text>
                </View>

                {loading ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#1876B8" />
                        <Text style={{ marginTop: 10, color: '#64748b' }}>Memuat produk...</Text>
                    </View>
                ) : (
                    <View style={styles.productGrid}>
                        {products.length > 0 ? (
                            products.map(item => (
                                <View key={item.id} style={styles.gridItemWrapper}>
                                    {renderProduct({ item })}
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={{ color: '#64748b' }}>Tidak ada produk ditemukan.</Text>
                            </View>
                        )}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#0f172a',
    },
    cartBtn: {
        position: 'relative',
        padding: 4,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#ef4444',
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    promoContainer: {
        paddingLeft: 20,
        marginTop: 20,
        marginBottom: 20,
    },
    promoCard: {
        width: 280,
        height: 140,
        borderRadius: 20,
        padding: 20,
        marginRight: 16,
        position: 'relative',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    promoTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    promoSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 16,
    },
    promoBtn: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        alignSelf: 'flex-start',
    },
    promoBtnText: {
        fontWeight: '700',
        fontSize: 12,
    },
    promoBgIcon: {
        position: 'absolute',
        right: -20,
        bottom: -20,
        width: 100,
        height: 100,
        opacity: 0.2,
        tintColor: '#fff',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    catContainer: {
        paddingLeft: 20,
        marginBottom: 24,
    },
    catChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 6,
    },
    catChipActive: {
        backgroundColor: '#1876B8',
        borderColor: '#1876B8',
    },
    catText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    catTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 14,
    },
    gridItemWrapper: {
        width: '50%',
        padding: 6,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        height: 260,
    },
    productImageContainer: {
        height: 140,
        width: '100%',
        backgroundColor: '#f8fafc',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    addBtn: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: '#1876B8',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    productInfo: {
        padding: 12,
        flex: 1,
        justifyContent: 'space-between',
    },
    categoryTag: {
        fontSize: 10,
        color: '#94a3b8',
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 6,
        lineHeight: 20,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 11,
        color: '#64748b',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1876B8',
    },
    emptyState: {
        width: '100%',
        alignItems: 'center',
        padding: 20,
    },
});
