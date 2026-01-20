import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '../../components/patients/SearchBar';
import optometristService, { Optometrist } from '../../services/optometristService';
import InitialAvatar from '../../components/common/InitialAvatar';
import { API_BASE_URL } from '../../constants/config';
import _ from 'lodash';

export default function SearchScreen() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<Optometrist[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Debounce search to avoid too many API calls
    const debouncedSearch = useCallback(
        _.debounce(async (query: string) => {
            if (!query.trim()) {
                setResults([]);
                setLoading(false);
                return;
            }

            try {
                const data = await optometristService.getOptometrists({ search: query });
                setResults(data);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
                setHasSearched(true);
            }
        }, 500),
        []
    );

    const handleSearch = (text: string) => {
        setSearch(text);
        if (text.trim().length > 0) {
            setLoading(true);
            setHasSearched(false); // Reset to show loading/waiting
        }
        debouncedSearch(text);
    };

    const handlePress = (item: Optometrist) => {
        router.push(`/patient/optometrist/${item.id}`);
    };

    const renderItem = ({ item }: { item: Optometrist }) => {
        const base = API_BASE_URL.replace(/\/?api$/, '');
        let avatarUrl = item.avatar_url || item.photo;
        if (avatarUrl && !/^https?:\/\//i.test(avatarUrl)) avatarUrl = base + avatarUrl;
        if (avatarUrl && /localhost|127\.0\.0\.1/.test(avatarUrl)) avatarUrl = avatarUrl.replace(/^https?:\/\/[^/]+/, base);

        return (
            <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
                <InitialAvatar
                    name={item.name}
                    avatarUrl={avatarUrl}
                    size={50}
                    role="optometrist"
                    style={styles.avatar}
                />
                <View style={styles.cardContent}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.details}>⭐ {item.rating} • {item.experience} pengalaman</Text>
                    {item.specialization && (
                        <Text style={styles.specialization}>{item.specialization}</Text>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <View style={styles.searchContainer}>
                    <SearchBar
                        value={search}
                        onChangeText={handleSearch}
                        autoFocus={true}
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        search.trim().length > 0 && hasSearched ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Tidak ditemukan hasil untuk "{search}"</Text>
                            </View>
                        ) : null
                    }
                />
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
        alignItems: 'flex-start', // Align start because SearchBar has marginBottom
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 0,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        gap: 12,
    },
    backButton: {
        marginTop: 12, // Align with search bar input visually
        padding: 4,
    },
    searchContainer: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    cardContent: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
    },
    details: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    specialization: {
        fontSize: 13,
        color: '#2563EB',
        marginTop: 2,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
        textAlign: 'center',
    },
});
