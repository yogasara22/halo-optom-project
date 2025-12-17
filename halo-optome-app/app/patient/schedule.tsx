import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import { Calendar, Clock, MapPin, Video, CheckCircle, XCircle } from 'lucide-react-native';

type AppointmentStatus = 'active' | 'completed' | 'cancelled';
type AppointmentType = 'offline' | 'online';

interface Appointment {
    id: string;
    doctorName: string;
    doctorSpeciality: string;
    date: string;
    time: string;
    status: AppointmentStatus;
    type: AppointmentType;
    location?: string;
    price: string;
    avatarUrl: string;
}

const mockActiveAppointments: Appointment[] = [
    {
        id: '1',
        doctorName: 'Dr. Indah Putri',
        doctorSpeciality: 'Spesialis Mata',
        date: 'Senin, 20 Des 2025',
        time: '14:00 - 15:00',
        status: 'active',
        type: 'online',
        price: 'Rp 150.000',
        avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    },
    {
        id: '2',
        doctorName: 'Dr. Rizky Permana',
        doctorSpeciality: 'Optometris Senior',
        date: 'Rabu, 22 Des 2025',
        time: '10:00 - 11:00',
        status: 'active',
        type: 'offline',
        location: 'Klinik Mata Jakarta Selatan',
        price: 'Rp 200.000',
        avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    }
];

const mockHistoryAppointments: Appointment[] = [
    {
        id: '3',
        doctorName: 'Dr. Yoga Ramadhan',
        doctorSpeciality: 'Spesialis Lensa Kontak',
        date: '10 Nov 2025',
        time: '09:00',
        status: 'completed',
        type: 'offline',
        location: 'Klinik Mata Jakarta Pusat',
        price: 'Rp 180.000',
        avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026703d',
    },
    {
        id: '4',
        doctorName: 'Dr. Sarah Amalia',
        doctorSpeciality: 'Pediatric Optometrist',
        date: '05 Okt 2025',
        time: '14:00',
        status: 'cancelled',
        type: 'online',
        price: 'Rp 150.000',
        avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
    }
];

export default function ScheduleScreen() {
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    const renderAppointmentCard = ({ item }: { item: Appointment }) => {
        const isHistory = activeTab === 'history';

        return (
            <View style={styles.card}>
                {/* Header: Doctor Info */}
                <View style={styles.cardHeader}>
                    <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                    <View style={styles.headerInfo}>
                        <Text style={styles.doctorName}>{item.doctorName}</Text>
                        <Text style={styles.speciality}>{item.doctorSpeciality}</Text>
                    </View>
                    <View style={[styles.statusBadge,
                    item.status === 'active' ? styles.bgBlue :
                        item.status === 'completed' ? styles.bgGreen : styles.bgRed
                    ]}>
                        <Text style={[styles.statusText,
                        item.status === 'active' ? styles.textBlue :
                            item.status === 'completed' ? styles.textGreen : styles.textRed
                        ]}>
                            {item.status === 'active' ? 'Upcoming' :
                                item.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                        </Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Details */}
                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Calendar size={16} color="#64748b" />
                        <Text style={styles.detailText}>{item.date}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Clock size={16} color="#64748b" />
                        <Text style={styles.detailText}>{item.time}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        {item.type === 'online' ? <Video size={16} color="#64748b" /> : <MapPin size={16} color="#64748b" />}
                        <Text style={styles.detailText}>
                            {item.type === 'online' ? 'Konsultasi Online' : item.location}
                        </Text>
                    </View>
                </View>

                {/* Footer Actions (Only for Active) */}
                {!isHistory && (
                    <View style={styles.cardFooter}>
                        <TouchableOpacity style={styles.outlineButton}>
                            <Text style={styles.outlineButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.primaryButton}>
                            <Text style={styles.primaryButtonText}>Reschedule</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Footer for History (Re-book) */}
                {isHistory && item.status === 'completed' && (
                    <View style={styles.cardFooter}>
                        <TouchableOpacity style={[styles.outlineButton, { flex: 1 }]}>
                            <Text style={styles.outlineButtonText}>Beri Ulasan</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.pageTitle}>Jadwal Saya</Text>

            {/* Segmented Control */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Jadwal Aktif</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                    onPress={() => setActiveTab('history')}
                >
                    <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Riwayat</Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={activeTab === 'active' ? mockActiveAppointments : mockHistoryAppointments}
                keyExtractor={(item) => item.id}
                renderItem={renderAppointmentCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Tidak ada jadwal {activeTab === 'active' ? 'aktif' : 'riwayat'}</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 24,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#fff',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    activeTabText: {
        color: '#2563EB',
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
            android: { elevation: 3 },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e2e8f0',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    speciality: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    bgBlue: { backgroundColor: '#eff6ff' },
    bgGreen: { backgroundColor: '#f0fdf4' },
    bgRed: { backgroundColor: '#fef2f2' },
    textBlue: { color: '#2563EB', fontSize: 12, fontWeight: '600' },
    textGreen: { color: '#16a34a', fontSize: 12, fontWeight: '600' },
    textRed: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
    statusText: { fontSize: 12, fontWeight: '600' },

    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 16,
    },
    detailsContainer: {
        gap: 10,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#475569',
    },
    cardFooter: {
        flexDirection: 'row',
        gap: 12,
    },
    outlineButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    outlineButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    primaryButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#2563EB',
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
    },
});
