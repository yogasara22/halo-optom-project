import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import notificationService, { ApiNotification } from '../../services/notificationService';

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<ApiNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        const data = await notificationService.getNotifications();
        setNotifications(data);
        setLoading(false);
        setRefreshing(false);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleMarkAllRead = async () => {
        await notificationService.markAllAsRead();
        fetchNotifications();
    };

    const handlePress = async (item: ApiNotification) => {
        if (!item.is_read) {
            await notificationService.markAsRead(item.id);
            // Update local state to reflect read status
            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
        }

        // Navigate based on type
        if (item.type === 'appointment' && item.meta?.appointment_id) {
            router.push(`/patient/appointment/${item.meta.appointment_id}`);
        }
    };

    const renderItem = ({ item }: { item: ApiNotification }) => (
        <TouchableOpacity
            style={[styles.card, !item.is_read && styles.unreadCard]}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <Ionicons
                    name={item.type === 'appointment' ? 'calendar' : 'notifications'}
                    size={24}
                    color={item.is_read ? '#94a3b8' : '#2563EB'}
                />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.title, !item.is_read && styles.unreadTitle]}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>
                    {new Date(item.created_at).toLocaleDateString()}{' '}
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            {!item.is_read && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifikasi</Text>
                <TouchableOpacity onPress={handleMarkAllRead}>
                    <Text style={styles.readAllText}>Baca Semua</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={64} color="#cbd5e1" />
                            <Text style={styles.emptyText}>Belum ada notifikasi</Text>
                        </View>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    readAllText: {
        fontSize: 14,
        color: '#2563EB',
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    unreadCard: {
        backgroundColor: '#eff6ff',
        borderLeftWidth: 4,
        borderLeftColor: '#2563EB',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 4,
    },
    unreadTitle: {
        color: '#0f172a',
        fontWeight: '700',
    },
    body: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 6,
        lineHeight: 20,
    },
    time: {
        fontSize: 12,
        color: '#94a3b8',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        marginLeft: 8,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        color: '#94a3b8',
        fontSize: 16,
    },
});
