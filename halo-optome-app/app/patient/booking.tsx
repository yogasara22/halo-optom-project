import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { toBoolean } from '../../utils/boolean';
import { optometristService, Optometrist } from '../../services/optometristService';
import { patientService } from '../../services/patientService';
import { API_BASE_URL } from '../../constants/config';

export default function BookingScreen() {
    const router = useRouter();
    const [optometrists, setOptometrists] = useState<Optometrist[]>([]);
    const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
    const [type, setType] = useState<'homecare' | 'online'>('online');
    const [method, setMethod] = useState<'chat' | 'video'>('chat');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [dateObj, setDateObj] = useState<Date>(new Date());
    const [timeObj, setTimeObj] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([]);
    const [servicePrice, setServicePrice] = useState<number | null>(null);
    const [suggestedDates, setSuggestedDates] = useState<{ value: string; label: string }[]>([]);
    const [selectedScheduleKey, setSelectedScheduleKey] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const list = await optometristService.getOptometrists();
                setOptometrists(list);
            } catch (e) {
                setOptometrists([]);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if (!selectedOpt || !date) { setAvailableSlots([]); return; }
            try {
                const slots = await optometristService.getAvailableSchedules(selectedOpt, date);
                setAvailableSlots(slots);
            } catch {
                setAvailableSlots([]);
            }
        })();
    }, [selectedOpt, date]);

    useEffect(() => {
        (async () => {
            const price = await patientService.getServicePrice(type as any, method as any);
            setServicePrice(price);
        })();
    }, [type, method]);

    useEffect(() => {
        const target = optometrists.find(o => o.id === selectedOpt);
        if (!target || !target.schedule || target.schedule.length === 0) { setDate(''); return; }
        // Default ke jadwal terdekat dari item pertama
        const iso = nextDateForDay(target.schedule[0].day);
        setDate(iso);
        const parts = iso.split('-');
        setDateObj(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
        setSelectedScheduleKey(null);
    }, [selectedOpt, optometrists]);

    const fmtDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const fmtTime = (d: Date) => {
        const h = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        return `${h}:${mi}`;
    };

    const nextDateForDay = (day: string) => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetIdx = days.indexOf((day || '').toLowerCase());
        const now = new Date();
        const currentIdx = now.getDay();
        const diff = (targetIdx - currentIdx + 7) % 7;
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const toIndoDay = (d: string) => {
        const m: Record<string, string> = {
            sunday: 'Minggu',
            monday: 'Senin',
            tuesday: 'Selasa',
            wednesday: 'Rabu',
            thursday: 'Kamis',
            friday: 'Jumat',
            saturday: 'Sabtu',
        };
        return m[(d || '').toLowerCase()] || d;
    };

    const submit = async () => {
        if (!selectedOpt || !date || !time) {
            setError('Lengkapi optometris, tanggal, dan waktu');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await patientService.bookAppointment({
                optometrist_id: selectedOpt,
                type,
                method,
                date,
                start_time: time,
                location,
            });
            router.replace('/appointments/confirmation');
        } catch (e: any) {
            setError(e?.message || 'Gagal membuat janji');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <View style={styles.header}>
                {/* No back button for main tab */}
                <Text style={styles.headerTitle}>Booking Pemeriksaan</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>

                {!!error && (
                    <View style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444', borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 16 }}>
                        <Text style={{ color: '#991b1b' }}>{error}</Text>
                    </View>
                )}

                <Text style={{ marginBottom: 8, color: '#475569' }}>Pilih Optometris</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    {optometrists.map(opt => {
                        const active = selectedOpt === opt.id;
                        return (
                            <TouchableOpacity
                                key={opt.id}
                                onPress={() => setSelectedOpt(opt.id)}
                                style={{ marginRight: 12, alignItems: 'center' }}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.avatarRing, active && styles.avatarRingActive]}>
                                    {(() => {
                                        const base = API_BASE_URL.replace(/\/?api$/, '');
                                        let url = opt.photo;
                                        if (url && !/^https?:\/\//i.test(url)) url = base + url;
                                        if (url && /localhost|127\.0\.0\.1/.test(url)) url = url.replace(/^https?:\/\/[^/]+/, base);
                                        const src = url ? { uri: url } : require('../../assets/images/avatar.png');
                                        return <Image source={src} style={{ width: 60, height: 60, borderRadius: 30 }} />;
                                    })()}
                                </View>
                                <Text style={{ fontSize: 12, marginTop: 6, color: active ? '#16a34a' : '#111827' }}>{opt.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {!!selectedOpt && (
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{ marginBottom: 8, color: '#475569' }}>Jadwal Optometris</Text>
                        <Text style={{ marginTop: -4, marginBottom: 8, fontSize: 12, color: '#64748b' }}>Silahkan pilih janji pemeriksaan</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {(optometrists.find(o => o.id === selectedOpt)?.schedule || []).map((s, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.chip, selectedScheduleKey === `${s.day}|${s.time}` && styles.chipActive]}
                                    activeOpacity={0.85}
                                    onPress={() => {
                                        const iso = nextDateForDay(s.day);
                                        setDate(iso);
                                        const parts = iso.split('-');
                                        setDateObj(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
                                        const start = (s.time || '').split(' - ')[0];
                                        if (start) {
                                            setTime(start);
                                            setTimeObj(new Date(`${iso}T${start}:00`));
                                        }
                                        setSelectedScheduleKey(`${s.day}|${s.time}`);
                                    }}
                                >
                                    <Ionicons name="calendar" size={14} color="#2563EB" />
                                    <Text style={[styles.chipText, selectedScheduleKey === `${s.day}|${s.time}` && styles.chipTextActive]}>{toIndoDay(s.day)} {s.time}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <Text style={{ marginBottom: 8, color: '#475569' }}>Jenis Layanan</Text>
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                    {(['online', 'homecare'] as const).map(v => (
                        <TouchableOpacity key={v} onPress={() => setType(v)} style={[styles.optionPill, type === v && styles.optionPillActive]} activeOpacity={0.85}>
                            <Ionicons name={v === 'online' ? 'globe-outline' : 'home-outline'} size={16} color={type === v ? '#2563EB' : '#475569'} />
                            <Text style={[styles.optionText, type === v && styles.optionTextActive]}>{v === 'online' ? 'Online' : 'Homecare'}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {type !== 'homecare' && (
                    <>
                        <Text style={{ marginBottom: 8, color: '#475569' }}>Metode Konsultasi</Text>
                        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                            {(['chat', 'video'] as const).map(v => (
                                <TouchableOpacity key={v} onPress={() => setMethod(v)} style={[styles.optionPill, method === v && styles.optionPillActive]} activeOpacity={0.85}>
                                    <Ionicons name={v === 'chat' ? 'chatbubbles-outline' : 'videocam-outline'} size={16} color={method === v ? '#2563EB' : '#475569'} />
                                    <Text style={[styles.optionText, method === v && styles.optionTextActive]}>{v === 'chat' ? 'Chat' : 'Video'}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {availableSlots.length === 0 && (
                    <>
                        <Text style={{ marginBottom: 8, color: '#475569' }}>Waktu</Text>
                        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.inputButton}>
                            <Ionicons name="time-outline" size={18} color="#475569" />
                            <Text style={styles.inputButtonText}>{time || fmtTime(timeObj)}</Text>
                        </TouchableOpacity>
                        {showTimePicker && (
                            <DateTimePicker
                                value={timeObj}
                                mode="time"
                                display={Platform.OS === 'android' ? 'clock' : 'spinner'}
                                onChange={(_, selectedTime) => {
                                    setShowTimePicker(false);
                                    if (selectedTime) {
                                        setTimeObj(selectedTime);
                                        setTime(fmtTime(selectedTime));
                                    }
                                }}
                            />
                        )}
                    </>
                )}

                {type === 'homecare' && (
                    <>
                        <Text style={{ marginBottom: 8, color: '#475569' }}>Lokasi (opsional)</Text>
                        <TextInput value={location} onChangeText={setLocation} placeholder="Alamat jika Homecare" style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, padding: 10, marginBottom: 20 }} />
                    </>
                )}

                {availableSlots.length > 0 && (
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{ marginBottom: 8, color: '#475569' }}>Slot Tersedia</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {availableSlots.map((slot, idx) => (
                                <TouchableOpacity key={idx} onPress={() => { setTime(slot.time.split(' - ')[0]); setTimeObj(new Date(`${fmtDate(dateObj)}T${slot.time.split(' - ')[0]}:00`)); }} style={[styles.chip, { marginRight: 8 }]}>
                                    <Ionicons name="time-outline" size={14} color="#2563EB" />
                                    <Text style={styles.chipText}>{slot.time}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <TouchableOpacity disabled={toBoolean(isSubmitting)} onPress={submit} style={styles.submitBtn}>
                    <Text style={styles.submitText}>{isSubmitting ? 'Memproses...' : 'Buat Janji'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Centered title
        paddingTop: 8,
        paddingHorizontal: 16,
        paddingBottom: 8,
        backgroundColor: '#f8fafc',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f172a',
    },
    inputButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    inputButtonText: {
        color: '#0f172a',
    },
    submitBtn: {
        backgroundColor: '#1876B8',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontWeight: '600',
    },
    avatarRing: {
        padding: 2,
        borderRadius: 34,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    avatarRingActive: {
        borderColor: '#16a34a',
        backgroundColor: '#f0fdf4',
    },
    optionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        backgroundColor: '#fff',
        gap: 8,
    },
    optionPillActive: {
        borderColor: '#93c5fd',
        backgroundColor: '#e0f2fe',
    },
    optionText: { color: '#475569' },
    optionTextActive: { color: '#2563EB', fontWeight: '600' },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f1f5f9',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    chipActive: {
        borderColor: '#93c5fd',
        backgroundColor: '#e0f2fe',
        borderWidth: 1,
    },
    chipText: { color: '#0f172a', fontSize: 12 },
    chipTextActive: { color: '#2563EB', fontWeight: '600' },
});
