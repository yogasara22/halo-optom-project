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
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [imageError, setImageError] = useState(false);

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
        setCurrentUserId(userId);
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
                    setMessages((prev) => [...prev, data]);

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

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !consultationDetails?.chat?.room_id) return;

        try {
            setSending(true);
            const messageText = inputMessage.trim();
            setInputMessage('');

            // Send via socket for real-time delivery
            sendSocketMessage(consultationDetails.chat.room_id, messageText, currentUserId || '');

            // Optimistic UI update
            const tempMessage: ChatMessage = {
                id: `temp-${Date.now()}`,
                room_id: consultationDetails.chat.room_id,
                from: {
                    id: currentUserId || '',
                    name: 'You',
                },
                message: messageText,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, tempMessage]);

            // Auto scroll
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
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

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isMyMessage = item.from.id === currentUserId;

        return (
            <View
                style={[
                    styles.messageContainer,
                    isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
                ]}
            >
                {!isMyMessage && (
                    <View style={styles.avatarContainer}>
                        {item.from.avatar_url ? (
                            <Image source={{ uri: item.from.avatar_url }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={styles.avatarText}>{item.from.name[0]}</Text>
                            </View>
                        )}
                    </View>
                )}

                <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.otherMessage]}>
                    {!isMyMessage && <Text style={styles.senderName}>{item.from.name}</Text>}
                    <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
                        {item.message}
                    </Text>
                    <Text style={[styles.messageTime, isMyMessage && styles.myMessageTime]}>
                        {formatTime(item.created_at)}
                    </Text>
                </View>
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
                    {otherUser.avatar_url && !imageError ? (
                        <Image
                            source={{
                                uri: (() => {
                                    // Helper logic to correct URL
                                    let url = otherUser.avatar_url || '';
                                    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');

                                    // If distinct absolute URL (valid http not localhost), return
                                    if (url.startsWith('http') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
                                        return url;
                                    }

                                    // If localhost, replace with actual IP from config
                                    if (url.includes('localhost') || url.includes('127.0.0.1')) {
                                        const apiHost = API_BASE_URL.split('://')[1].split(':')[0];
                                        return url.replace('localhost', apiHost).replace('127.0.0.1', apiHost);
                                    }

                                    // If relative, prepend base
                                    return `${baseUrl}/${url.replace(/^\//, '')}`;
                                })()
                            }}
                            style={styles.headerAvatar}
                            onError={(e) => {
                                console.log('Avatar load error:', e.nativeEvent.error);
                                setImageError(true);
                            }}
                        />
                    ) : (
                        <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
                            <Text style={styles.headerAvatarText}>{otherUser.name[0]}</Text>
                        </View>
                    )}
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>{otherUser.name}</Text>
                        {otherUserTyping && <Text style={styles.typingIndicator}>mengetik...</Text>}
                    </View>
                </View>

                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="information-circle-outline" size={24} color="#1876B8" />
                </TouchableOpacity>
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
        marginLeft: 10,
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
    myMessageContainer: {
        justifyContent: 'flex-end',
    },
    otherMessageContainer: {
        justifyContent: 'flex-start',
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
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#1876B8',
        fontSize: 12,
        fontWeight: '600',
    },
    messageBubble: {
        maxWidth: '80%',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        elevation: 1, // Subtle shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    myMessage: {
        // Let's stick to a soft Professional Blue for the user
        backgroundColor: '#E6F4FF',
        borderBottomRightRadius: 2, // Sharp corner for "speech bubble" effect
        marginLeft: 40, // Ensure space from left
    },
    otherMessage: {
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 2,
        marginRight: 40,
    },
    senderName: {
        fontSize: 11,
        fontWeight: '700',
        color: '#eab308', // Different color for name
        marginBottom: 2,
    },
    messageText: {
        fontSize: 15,
        color: '#111827',
        lineHeight: 21,
    },
    myMessageText: {
        color: '#111827',
    },
    messageTime: {
        fontSize: 10,
        color: '#94a3b8',
        alignSelf: 'flex-end',
        marginTop: 4,
        marginLeft: 8,
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
});
