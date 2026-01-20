import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Dimensions,
    NativeModules,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getConsultationDetails, ConsultationDetails } from '../../services/consultationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/config';

// Safe import for VideoSDK to prevent crash in Expo Go
let MeetingProvider: any = null;
let useMeeting: any = null;
let useParticipant: any = null;
let RTCView: any = null;

try {
    // Check for native modules first to avoid side-effect crashes in Expo Go
    if (!NativeModules.WebRTCModule) {
        throw new Error("WebRTC Native Module not found");
    }
    const sdk = require('@videosdk.live/react-native-sdk');
    MeetingProvider = sdk.MeetingProvider;
    useMeeting = sdk.useMeeting;
    useParticipant = sdk.useParticipant;
    RTCView = sdk.RTCView;
} catch (error) {
    console.warn("Video SDK dependencies not found. Please use a Development Build.");
}

const { width, height } = Dimensions.get('window');

// Video View Component
function ParticipantView({ participantId }: { participantId: string }) {
    if (!useParticipant) return null;
    const { webcamStream, webcamOn, displayName } = useParticipant(participantId);

    return (
        <View style={styles.participantContainer}>
            {webcamOn && webcamStream && RTCView ? (
                <RTCView
                    streamURL={(new MediaStream([webcamStream.track]) as any).toURL()}
                    objectFit="cover"
                    style={styles.videoStream}
                />
            ) : (
                <View style={styles.videoPlaceholder}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarLargeText}>{displayName?.[0] || 'U'}</Text>
                    </View>
                    <Text style={styles.participantName}>{displayName || 'Participant'}</Text>
                </View>
            )}
        </View>
    );
}

// Meeting View Component
function MeetingView({ onLeave, appointmentId, currentUserRole }: { onLeave: () => void; appointmentId: string; currentUserRole: string | null }) {
    if (!useMeeting) return null;
    const router = useRouter();
    const { join, leave, toggleMic, toggleWebcam, participants, localParticipant } = useMeeting({
        onMeetingJoined: () => {
            console.log('Meeting joined successfully');
        },
        onMeetingLeft: () => {
            console.log('Meeting left');
            onLeave();
        },
        onError: (error: any) => {
            console.error('Meeting error:', error);
            Alert.alert('Error', 'Terjadi kesalahan pada video call');
        },
    });

    const [micOn, setMicOn] = useState(true);
    const [webcamOn, setWebcamOn] = useState(true);

    useEffect(() => {
        join();
    }, []);

    const handleToggleMic = () => {
        toggleMic();
        setMicOn((prev: boolean) => !prev);
    };

    const handleToggleWebcam = () => {
        toggleWebcam();
        setWebcamOn((prev: boolean) => !prev);
    };

    const handleLeave = async () => {
        // If optometrist, show completion flow
        if (currentUserRole === 'optometris') {
            Alert.alert(
                'Akhiri Konsultasi?',
                'Apakah Anda yakin ingin mengakhiri konsultasi video? Anda akan diarahkan untuk mengisi rekam medis.',
                [
                    { text: 'Batal', style: 'cancel' },
                    {
                        text: 'Ya, Akhiri',
                        style: 'destructive',
                        onPress: async () => {
                            leave();
                            // Complete consultation and navigate to medical record
                            await completeAndNavigate();
                        },
                    },
                ]
            );
        } else {
            // Patient just leaves
            Alert.alert(
                'Akhiri Konsultasi?',
                'Apakah Anda yakin ingin mengakhiri konsultasi video?',
                [
                    { text: 'Batal', style: 'cancel' },
                    {
                        text: 'Ya, Akhiri',
                        style: 'destructive',
                        onPress: () => {
                            leave();
                        },
                    },
                ]
            );
        }
    };

    const completeAndNavigate = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Error', 'Tidak dapat melanjutkan. Silakan login kembali.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/complete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                // Navigate to medical record form
                router.replace({
                    pathname: '/optometrist/medicalRecordForm',
                    params: {
                        appointmentId: appointmentId,
                        patientId: data.appointment.patient.id,
                        patientName: data.appointment.patient.name,
                    },
                });
            } else {
                Alert.alert('Error', 'Gagal menyelesaikan konsultasi');
            }
        } catch (err) {
            console.error('Error completing consultation:', err);
            Alert.alert('Error', 'Terjadi kesalahan saat menyelesaikan konsultasi');
        }
    };

    const participantIds = [...participants.keys()];
    const remoteParticipant = participantIds.find((id) => id !== localParticipant?.id);

    return (
        <View style={styles.meetingContainer}>
            {/* Remote Participant (Full Screen) */}
            {remoteParticipant ? (
                <ParticipantView participantId={remoteParticipant} />
            ) : (
                <View style={styles.waitingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.waitingText}>Menunggu optometrist bergabung...</Text>
                </View>
            )}

            {/* Local Participant (Small Floating View) */}
            {localParticipant && (
                <View style={styles.localVideoContainer}>
                    <ParticipantView participantId={localParticipant.id} />
                </View>
            )}

            {/* Controls */}
            <View style={styles.controlsContainer}>
                <View style={styles.controls}>
                    <TouchableOpacity
                        onPress={handleToggleMic}
                        style={[styles.controlButton, !micOn && styles.controlButtonOff]}
                    >
                        <Ionicons
                            name={micOn ? 'mic' : 'mic-off'}
                            size={24}
                            color="#fff"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleToggleWebcam}
                        style={[styles.controlButton, !webcamOn && styles.controlButtonOff]}
                    >
                        <Ionicons
                            name={webcamOn ? 'videocam' : 'videocam-off'}
                            size={24}
                            color="#fff"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLeave}
                        style={[styles.controlButton, styles.endCallButton]}
                    >
                        <Ionicons name="call" size={24} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.controlButton}>
                        <Ionicons name="chatbubble" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// Main Screen Component
export default function VideoConsultationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const appointmentId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [consultationDetails, setConsultationDetails] = useState<ConsultationDetails | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

    useEffect(() => {
        // Load user role
        const loadUserRole = async () => {
            const role = await AsyncStorage.getItem('userRole');
            setCurrentUserRole(role);
        };
        loadUserRole();
        // If native modules are missing, show error immediately
        if (!MeetingProvider) {
            setLoading(false);
            return;
        }
        loadConsultation();
    }, []);

    const loadConsultation = async () => {
        try {
            setLoading(true);
            setError(null);

            const details = await getConsultationDetails(appointmentId);
            setConsultationDetails(details);

            if (!details.video?.room_id || !details.video?.token) {
                setError('Video room tidak tersedia');
            }
        } catch (e: any) {
            setError(e?.message || 'Gagal memuat konsultasi');
        } finally {
            setLoading(false);
        }
    };

    const handleMeetingLeft = () => {
        router.back();
    };

    if (!MeetingProvider) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="warning-outline" size={64} color="#f59e0b" />
                    <Text style={[styles.errorTitle, { color: '#fff' }]}>Fitur Belum Tersedia di Expo Go</Text>
                    <Text style={styles.errorMessage}>
                        Fitur video call memerlukan native library (WebRTC) yang tidak tersedia di Expo Go.
                        Silakan gunakan Development Build atau jalankan di real device/emulator dengan 'npx expo run:android'.
                    </Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Kembali</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1876B8" />
                    <Text style={styles.loadingText}>Mempersiapkan video call...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !consultationDetails?.video) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text style={[styles.errorTitle, { color: '#fff' }]}>Terjadi Kesalahan</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Kembali</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <MeetingProvider
            config={{
                meetingId: consultationDetails.video.room_id,
                micEnabled: true,
                webcamEnabled: true,
                name: consultationDetails.patient.name,
            }}
            token={consultationDetails.video.token}
        >
            <MeetingView onLeave={handleMeetingLeft} appointmentId={appointmentId} currentUserRole={currentUserRole} />
        </MeetingProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#1876B8',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0f172a',
        marginTop: 16,
    },
    errorMessage: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 8,
    },
    backButton: {
        marginTop: 24,
        backgroundColor: '#1876B8',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    meetingContainer: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    participantContainer: {
        flex: 1,
    },
    videoStream: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    videoPlaceholder: {
        flex: 1,
        backgroundColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLarge: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#1876B8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarLargeText: {
        color: '#fff',
        fontSize: 48,
        fontWeight: '700',
    },
    participantName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    waitingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    waitingText: {
        marginTop: 16,
        color: '#94a3b8',
        fontSize: 16,
    },
    localVideoContainer: {
        position: 'absolute',
        top: 60,
        right: 16,
        width: 120,
        height: 160,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#1876B8',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 40,
        paddingHorizontal: 24,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    controlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButtonOff: {
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
    },
    endCallButton: {
        backgroundColor: '#ef4444',
        width: 64,
        height: 64,
        borderRadius: 32,
    },
});
