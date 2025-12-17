import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { shopService, Product } from '../../../services/shopService';
import { useCart } from '../../../context/CartContext';
import { formatRupiah } from '../../../utils/format';
import { API_BASE_URL } from '../../../constants/config';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (id) {
            loadProduct(id as string);
        }
    }, [id]);

    const loadProduct = async (productId: string) => {
        try {
            setLoading(true);
            const data = await shopService.getProductById(productId);
            if (data) {
                setProduct(data);
            } else {
                setError('Produk tidak ditemukan');
            }
        } catch (err) {
            console.error(err);
            setError('Gagal memuat produk');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;
        setAdding(true);

        // Resolve image URL for cart
        const base = API_BASE_URL.replace(/\/?api$/, '');
        let imageUrl = product.image_url;
        if (imageUrl && !/^https?:\/\//i.test(imageUrl)) imageUrl = base + imageUrl;
        if (imageUrl && /localhost|127\.0\.0\.1/.test(imageUrl)) imageUrl = imageUrl.replace(/^https?:\/\/[^/]+/, base);

        // Add to cart multiple times based on qty
        for (let i = 0; i < qty; i++) {
            await addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: imageUrl || ''
            });
        }

        setAdding(false);
        router.push('/patient/cart');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1876B8" />
                <Text style={styles.loadingText}>Memuat detail produk...</Text>
            </View>
        );
    }

    if (error || !product) {
        return (
            <SafeAreaView style={styles.root}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                    <Text style={styles.errorText}>{error || 'Produk tidak ditemukan'}</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Kembali</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Image resolution
    const base = API_BASE_URL.replace(/\/?api$/, '');
    let imageUrl = product.image_url;
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) imageUrl = base + imageUrl;
    if (imageUrl && /localhost|127\.0\.0\.1/.test(imageUrl)) imageUrl = imageUrl.replace(/^https?:\/\/[^/]+/, base);

    return (
        <View style={styles.root}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header Image Area */}
                <View style={styles.imageContainer}>
                    <Image
                        source={imageUrl ? { uri: imageUrl } : require('../../../assets/images/logo.png')}
                        style={styles.productImage}
                        resizeMode="contain"
                    />
                    <TouchableOpacity style={styles.headerBackBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerCartBtn} onPress={() => router.push('/patient/cart')}>
                        <Ionicons name="cart-outline" size={24} color="#0f172a" />
                    </TouchableOpacity>
                </View>

                {/* Content Body */}
                <View style={styles.contentBody}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.category}>{product.category || 'Umum'}</Text>
                            <Text style={styles.name}>{product.name}</Text>
                        </View>
                        <View style={styles.ratingBox}>
                            <Ionicons name="star" size={16} color="#f59e0b" />
                            <Text style={styles.ratingText}>{product.rating || '4.5'}</Text>
                        </View>
                    </View>

                    <Text style={styles.price}>{formatRupiah(product.price)}</Text>

                    {/* Stock Status */}
                    <View style={styles.stockRow}>
                        <View style={[styles.stockDot, { backgroundColor: (product.stock || 0) > 0 ? '#10b981' : '#ef4444' }]} />
                        <Text style={styles.stockText}>
                            {(product.stock || 0) > 0 ? `Stok Tersedia (${product.stock})` : 'Stok Habis'}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Deskripsi</Text>
                    <Text style={styles.description}>
                        {product.description || 'Tidak ada deskripsi tersedia untuk produk ini.'}
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.qtyContainer}>
                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQty(Math.max(1, qty - 1))}
                        disabled={qty <= 1}
                    >
                        <Ionicons name="remove" size={20} color={qty <= 1 ? '#cbd5e1' : '#0f172a'} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{qty}</Text>
                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQty(Math.min((product.stock || 99), qty + 1))}
                        disabled={qty >= (product.stock || 99)}
                    >
                        <Ionicons name="add" size={20} color={qty >= (product.stock || 99) ? '#cbd5e1' : '#0f172a'} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.addToCartBtn, (product.stock || 0) <= 0 && styles.disabledBtn]}
                    onPress={handleAddToCart}
                    disabled={(product.stock || 0) <= 0 || adding}
                >
                    {adding ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Ionicons name="cart" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.addToCartText}>
                                {(product.stock || 0) <= 0 ? 'Stok Habis' : 'Tambah keranjang'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        color: '#64748b',
        fontSize: 14,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 24,
    },
    backButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
    },
    backButtonText: {
        color: '#0f172a',
        fontWeight: '600',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    imageContainer: {
        width: '100%',
        height: 320,
        backgroundColor: '#f8fafc',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImage: {
        width: '80%',
        height: '80%',
    },
    headerBackBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    headerCartBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    contentBody: {
        marginTop: -24,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 0,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    category: {
        fontSize: 14,
        color: '#1876B8',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
        lineHeight: 28,
        marginRight: 10,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff7ed',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#b45309',
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1876B8',
        marginBottom: 12,
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    stockDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    stockText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 24,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 16,
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 4,
    },
    qtyBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    qtyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        width: 40,
        textAlign: 'center',
    },
    addToCartBtn: {
        flex: 1,
        backgroundColor: '#1876B8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        shadowColor: '#1876B8',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledBtn: {
        backgroundColor: '#94a3b8',
        shadowOpacity: 0,
        elevation: 0,
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
