import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    getConsultationDetails,
    getChatMessages,
    ChatMessage,
    ConsultationDetails,
} from '../../services/consultationService';
import { API_BASE_URL } from '../../constants/config';
import {
    initializeSocket,
    joinChatRoom,
    leaveChatRoom,
    sendSocketMessage,
    sendTypingIndicator,
    getSocket,
    disconnectSocket,
} from '../../lib/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatConsultationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const appointmentId = params.id as string;
    const flatListRef = useRef<FlatList>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [consultationDetails, setConsultationDetails] = useState<ConsultationDetails | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await loadCurrentUser();
            await loadConsultation();
            // loadConsultation sets loading=false in finally, so we might need to change that
            // Actually, simplest is to just wait for both
        };
        init();

        return () => {
            // Cleanup socket on unmount
            if (consultationDetails?.chat?.room_id) {
                leaveChatRoom(consultationDetails.chat.room_id);
            }
            disconnectSocket();
        };
    }, []);

    useEffect(() => {
        if (consultationDetails?.chat?.room_id) {
            setImageError(false); // Reset error state on new consultation
            setupSocket();
        }
    }, [consultationDetails]);

    const loadCurrentUser = async () => {
        const userId = await AsyncStorage.getItem('userId');
        const userRole = await AsyncStorage.getItem('userRole');
        setCurrentUserId(userId);
        setCurrentUserRole(userRole);
    };

    const loadConsultation = async () => {
        try {
            // setLoading(true); // Don't reset loading here if called from init
            setError(null);

            const details = await getConsultationDetails(appointmentId);
            setConsultationDetails(details);

            if (!details.chat?.room_id) {
                setError('Chat room tidak tersedia');
                return;
            }

            // Load chat history
            const chatHistory = await getChatMessages(details.chat.room_id);
            setMessages(chatHistory);
        } catch (e: any) {
            setError(e?.message || 'Gagal memuat konsultasi');
        } finally {
            setLoading(false);
        }
    };

    const setupSocket = async () => {
        try {
            const socket = await initializeSocket();

            if (consultationDetails?.chat?.room_id) {
                joinChatRoom(consultationDetails.chat.room_id);

                // Listen for new messages
                socket.on('newMessage', (data: ChatMessage) => {
                    console.log('Received new message:', data.id, 'from:', data.from.name, 'role:', data.from.role);

                    setMessages((prev) => {
                        // Check if this message already exists
                        const isDuplicate = prev.some(msg => msg.id === data.id);
                        if (isDuplicate) {
                            console.log('Skipping duplicate message:', data.id);
                            return prev;
                        }
                        // Add new message
                        return [...prev, data];
                    });

                    // Auto scroll to bottom
                    setTimeout(() => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                });

                // Listen for user joined
                socket.on('user_joined', (data: { user_id: string; user_name: string }) => {
                    console.log('User joined:', data.user_name);
                });
            }
        } catch (e) {
            console.error('Socket setup error:', e);
        }
    };

    const markMessagesRead = async () => {
        if (!consultationDetails?.chat?.room_id) return;
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                console.warn('No auth token found, skipping mark as read');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/chats/${consultationDetails.chat.room_id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                console.log('Messages marked as read successfully');
            } else {
                console.error('Failed to mark messages as read:', response.status);
            }
        } catch (e) {
            console.error('Failed to mark messages read:', e);
        }
    };

    useEffect(() => {
        if (consultationDetails?.chat?.room_id) {
            markMessagesRead();
        }
    }, [consultationDetails]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !consultationDetails?.chat?.room_id) return;

        try {
            setSending(true);
            const messageText = inputMessage.trim();
            setInputMessage('');

            // Send via socket for real-time delivery
            // The message will be added when we receive it back via socket (with proper role data)
            sendSocketMessage(consultationDetails.chat.room_id, messageText, currentUserId || '');

            // Auto scroll after a short delay to allow socket response
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 300);
        } catch (e: any) {
            console.error('Send message error:', e);
            setInputMessage(inputMessage); // Restore message on error
        } finally {
            setSending(false);
        }
    };

    const handleTyping = (text: string) => {
        setInputMessage(text);

        if (!consultationDetails?.chat?.room_id) return;

        // Send typing indicator
        if (text.length > 0 && !isTyping) {
            setIsTyping(true);
            sendTypingIndicator(consultationDetails.chat.room_id, true);
        } else if (text.length === 0 && isTyping) {
            setIsTyping(false);
            sendTypingIndicator(consultationDetails.chat.room_id, false);
        }
    };

    const handleEndConsultation = () => {
        Alert.alert(
            'Akhiri Konsultasi',
            'Apakah Anda yakin ingin mengakhiri konsultasi ini? Setelah diakhiri, Anda akan diarahkan untuk mengisi rekam medis pasien.',
            [
                {
                    text: 'Batal',
                    style: 'cancel',
                },
                {
                    text: 'Akhiri',
                    style: 'destructive',
                    onPress: completeConsultation,
                },
            ]
        );
    };

    const completeConsultation = async () => {
        try {
            setCompleting(true);
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Error', 'Tidak ada token autentikasi');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                Alert.alert('Berhasil', data.message, [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate to medical record form
                            router.push({
                                pathname: '/optometrist/medicalRecordForm',
                                params: {
                                    appointmentId: appointmentId,
                                    patientId: data.appointment.patient.id,
                                    patientName: data.appointment.patient.name,
                                },
                            });
                        },
                    },
                ]);
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Gagal mengakhiri konsultasi');
            }
        } catch (e: any) {
            console.error('Error completing consultation:', e);
            Alert.alert('Error', 'Terjadi kesalahan saat mengakhiri konsultasi');
        } finally {
            setCompleting(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        if (!item || !item.from) {
            console.warn('Invalid message item:', item);
            return null;
        }

        // Position based on role: Patient on LEFT, Optometrist on RIGHT
        const isOptometrist = item.from.role === 'optometris'; // Indonesian: optometris not optometrist
        const isMyMessage = item.from.id === currentUserId;

        return (
            <View
                style={[
                    styles.messageContainer,
                    isOptometrist ? styles.optometristMessageContainer : styles.patientMessageContainer,
                ]}
            >
                {!isOptometrist && (
                    <View style={styles.avatarContainer}>
                        {item.from.avatar_url ? (
                            <Image source={{ uri: item.from.avatar_url }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={styles.avatarText}>{(item.from.name || '?')[0]}</Text>
                            </View>
                        )}
                    </View>
                )}

                <View style={[
                    styles.messageBubble,
                    isOptometrist ? styles.optometristMessage : styles.patientMessage
                ]}>
                    <Text style={[
                        styles.senderName,
                        isOptometrist ? styles.optometristName : styles.patientName
                    ]}>
                        {isMyMessage ? 'You' : item.from.name}
                    </Text>
                    <Text style={[
                        styles.messageText,
                        isOptometrist && styles.optometristMessageText
                    ]}>
                        {item.message}
                    </Text>
                    <Text style={[
                        styles.messageTime,
                        isOptometrist && styles.optometristMessageTime
                    ]}>
                        {formatTime(item.created_at)}
                    </Text>
                </View>

                {isOptometrist && (
                    <View style={[styles.avatarContainer, { marginLeft: 8, marginRight: 0 }]}>
                        {item.from.avatar_url ? (
                            <Image source={{ uri: item.from.avatar_url }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder, styles.optometristAvatar]}>
                                <Text style={[styles.avatarText, styles.optometristAvatarText]}>{(item.from.name || '?')[0]}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1876B8" />
                    <Text style={styles.loadingText}>Memuat konsultasi...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !consultationDetails) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chat Konsultasi</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text style={styles.errorTitle}>Terjadi Kesalahan</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity onPress={loadConsultation} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Coba Lagi</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const otherUser = currentUserId === consultationDetails.patient.id
        ? consultationDetails.optometrist
        : consultationDetails.patient;

    // Debug logic for header
    // console.log('DEBUG: currentUserId:', currentUserId, 'patientId:', consultationDetails.patient.id, 'Showing:', otherUser.name);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>
                            {consultationDetails.method === 'video' ? 'Konsultasi Video' : 'Konsultasi Chat'}
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            {consultationDetails?.date && consultationDetails?.start_time ? (
                                `${otherUser.name} • ${new Date(consultationDetails.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • ${consultationDetails.start_time.slice(0, 5)}`
                            ) : otherUser.name}
                        </Text>
                        {otherUserTyping && <Text style={styles.typingIndicator}>mengetik...</Text>}
                    </View>
                </View>

                {/* End Consultation Button (Optometrist Only) */}
                {currentUserRole === 'optometris' && (
                    <TouchableOpacity
                        style={styles.endConsultationButton}
                        onPress={handleEndConsultation}
                        disabled={completing}
                    >
                        {completing ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                                <Text style={styles.endButtonText}>Akhiri</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Messages List */}
            <KeyboardAvoidingView
                style={styles.chatContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 30}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                />

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ketik pesan..."
                            placeholderTextColor="#94a3b8"
                            value={inputMessage}
                            onChangeText={handleTyping}
                            multiline
                            maxLength={1000}
                        />
                        <TouchableOpacity style={styles.attachButton}>
                            <Ionicons name="attach-outline" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={handleSendMessage}
                        style={[styles.sendButton, (!inputMessage.trim() || sending) && styles.sendButtonDisabled]}
                        disabled={!inputMessage.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EFE7DD', // Soft WhatsApp-like warm background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        zIndex: 10,
    },
    backButton: {
        padding: 8,
        marginRight: 4,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    headerAvatarPlaceholder: {
        backgroundColor: '#e1e4e8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerAvatarText: {
        color: '#5f6368',
        fontSize: 18,
        fontWeight: '600',
    },
    headerTextContainer: {
        marginLeft: 0,
        flex: 1,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#202124',
        marginBottom: 2,
    },
    typingIndicator: {
        fontSize: 12,
        color: '#1876B8',
        fontStyle: 'italic',
        fontWeight: '500',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 1,
    },
    headerButton: {
        padding: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#f5f7fa',
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 16,
    },
    errorMessage: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 22,
    },
    retryButton: {
        marginTop: 24,
        backgroundColor: '#1876B8',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        elevation: 2,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    chatContainer: {
        flex: 1,
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 12, // Reduced margin for tighter chat feel
        maxWidth: '100%',
    },
    patientMessageContainer: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    optometristMessageContainer: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    avatarContainer: {
        marginRight: 8,
        alignSelf: 'flex-end', // Align avatar to bottom of message group
        marginBottom: 2,
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    avatarPlaceholder: {
        backgroundColor: '#BBDEFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optometristAvatar: {
        backgroundColor: '#A5D6A7',
    },
    avatarText: {
        color: '#1976D2',
        fontSize: 12,
        fontWeight: '600',
    },
    optometristAvatarText: {
        color: '#388E3C',
    },
    messageBubble: {
        maxWidth: '80%',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    patientMessage: {
        backgroundColor: '#E3F2FD', // Light Blue for Patient
        borderBottomLeftRadius: 4,
        alignSelf: 'flex-start',
    },
    optometristMessage: {
        backgroundColor: '#C8E6C9', // Light Green for Optometrist
        borderBottomRightRadius: 4,
        alignSelf: 'flex-end',
    },
    senderName: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 2,
    },
    patientName: {
        color: '#1976D2', // Blue for Patient name
    },
    optometristName: {
        color: '#388E3C', // Green for Optometrist name
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
        color: '#333',
    },
    optometristMessageText: {
        color: '#1a1a1a',
    },
    myMessageText: {
        color: '#111827',
    },
    messageTime: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    optometristMessageTime: {
        color: '#555',
    },
    myMessageTime: {
        color: '#94a3b8',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        paddingBottom: Platform.OS === 'ios' ? 10 : 16,
        // Transparent to let background show through
        backgroundColor: 'transparent',
        alignItems: 'flex-end',
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10, // Increased padding
        alignItems: 'center',
        marginRight: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
        maxHeight: 120,
        paddingTop: 0, // Fix alignment on Android
        paddingBottom: 0,
    },
    attachButton: {
        padding: 6,
        marginLeft: 4,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1876B8',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#1876B8',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    sendButtonDisabled: {
        backgroundColor: '#94a3b8',
        elevation: 0,
        shadowOpacity: 0,
    },
    endConsultationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dc2626',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    endButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
});
