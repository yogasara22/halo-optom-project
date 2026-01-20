import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// TODO: Move types to a shared file
type NotificationType = 'appointment' | 'payment' | 'promo' | 'general';
type Notification = {
    id: string;
    title: string;
    body: string;
    type: NotificationType;
    is_read: boolean;
    created_at: string;
    meta?: any;
};

const API_URL = 'http://10.0.2.2:4000/api'; // Adjust for your environment

export default function NotificationScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const response = await fetch(`${API_URL}/notifications?limit=20`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.data) {
                setNotifications(data.data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'payment':
                return 'wallet-outline';
            case 'appointment':
                return 'calendar-outline';
            case 'promo':
                return 'pricetag-outline';
            default:
                return 'notifications-outline';
        }
    };

    const getIconColor = (type: NotificationType) => {
        switch (type) {
            case 'payment': return '#10b981';
            case 'appointment': return '#3b82f6';
            case 'promo': return '#f59e0b';
            default: return '#64748b';
        }
    }

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.item, !item.is_read && styles.unreadItem]}
            onPress={() => markAsRead(item.id)}
        >
            <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) + '20' }]}>
                <Ionicons name={getIcon(item.type)} size={24} color={getIconColor(item.type)} />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, !item.is_read && styles.unreadTitle]}>{item.title}</Text>
                    <Text style={styles.time}>
                        {format(new Date(item.created_at), 'dd MMM, HH:mm', { locale: id })}
                    </Text>
                </View>
                <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
            </View>
            {!item.is_read && <View style={styles.badge} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifikasi</Text>
                <TouchableOpacity onPress={markAllAsRead}>
                    <Text style={styles.markAllRead}>Baca Semua</Text>
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
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={48} color="#cbd5e1" />
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
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
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
    markAllRead: {
        fontSize: 14,
        color: '#2563EB',
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    unreadItem: {
        backgroundColor: '#f8fafc',
        borderColor: '#e2e8f0',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        flex: 1,
        marginRight: 8,
    },
    unreadTitle: {
        color: '#0f172a',
        fontWeight: '700',
    },
    body: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    time: {
        fontSize: 12,
        color: '#94a3b8',
    },
    badge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3b82f6',
        marginLeft: 8,
        marginTop: 6,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#94a3b8',
    },
});
