import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, CheckCircleIcon, ExclamationCircleIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';
import { io } from 'socket.io-client';

interface Notification {
    id: string;
    title: string;
    body: string;
    type: string;
    is_read: boolean;
    created_at: string;
    meta?: any;
}

export default function NotificationDropdown() {
    const { user } = useAuth();
    const [token, setToken] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    useEffect(() => {
        const storedToken = localStorage.getItem('admin_token');
        setToken(storedToken);
    }, []);

    useEffect(() => {
        if (token) {
            fetchNotifications();
            fetchUnreadCount();

            // Setup Socket.IO
            const socket = io(API_URL.replace('/api', ''), {
                query: { token },
                transports: ['websocket']
            });

            socket.on('new_notification', (notification: Notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [token]);

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/notifications?limit=10`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.data) setNotifications(data.data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const fetchUnreadCount = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.count !== undefined) setUnreadCount(data.count);
        } catch (error) {
            console.error('Failed to fetch count', error);
        }
    };

    const markAsRead = async (id: string) => {
        if (!token) return;
        try {
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const markAllAsRead = async () => {
        if (!token) return;
        try {
            await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'payment':
            case 'withdrawal':
                return <BanknotesIcon className="w-5 h-5 text-green-600" />;
            case 'appointment':
                return <CheckCircleIcon className="w-5 h-5 text-blue-600" />;
            default:
                return <BellIcon className="w-5 h-5 text-gray-600" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                className="p-3 rounded-2xl text-gray-500 hover:text-gray-700 hover:bg-white/60 hover:shadow-md transition-all duration-300 group relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <BellIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-linear-to-r from-red-500 to-pink-500 rounded-full animate-pulse border-2 border-white"></div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <BellIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                                        className={clsx(
                                            "p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3",
                                            !notification.is_read && "bg-blue-50/30"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                            !notification.is_read ? "bg-white shadow-sm" : "bg-gray-100"
                                        )}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={clsx("text-sm font-medium truncate", !notification.is_read ? "text-gray-900" : "text-gray-600")}>
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                                                {notification.body}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(notification.created_at).toLocaleDateString()} • {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
