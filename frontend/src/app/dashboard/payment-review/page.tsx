'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getPendingPayments, verifyPayment, rejectPayment } from '@/services/payment.service';

interface PendingPayment {
    id: string;
    payment_type: 'order' | 'appointment';
    amount: number;
    payment_proof_url?: string;
    payment_deadline: string;
    created_at: string;
    order?: {
        patient: { name: string; email: string };
    };
    appointment?: {
        id: string;
        date: string;
        start_time: string;
        end_time: string;
        type: 'online' | 'homecare';
        method: 'chat' | 'video';
        status: string;
        patient: {
            id: string;
            name: string;
            email: string;
            phone?: string;
        };
        optometrist: {
            id: string;
            name: string;
            email: string;
            specialization?: string;
        };
    };
}

export default function PaymentReviewPage() {
    const [payments, setPayments] = useState<PendingPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchPendingPayments();
    }, []);

    const fetchPendingPayments = async () => {
        try {
            setLoading(true);
            const response = await getPendingPayments();
            const paymentsData = response.data || [];
            console.log('Pending payments:', paymentsData); // Debug log
            setPayments(paymentsData);
        } catch (error) {
            console.error('Error fetching pending payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (paymentId: string) => {
        if (!confirm('Apakah Anda yakin ingin menyetujui pembayaran ini?')) {
            return;
        }
        try {
            await verifyPayment(paymentId);
            fetchPendingPayments();
            setSelectedPayment(null);
        } catch (error) {
            console.error('Error verifying payment:', error);
            alert('Failed to verify payment');
        }
    };

    const handleReject = async () => {
        if (!selectedPayment || !rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }
        try {
            await rejectPayment(selectedPayment.id, rejectionReason);
            setShowRejectModal(false);
            setRejectionReason('');
            setSelectedPayment(null);
            fetchPendingPayments();
        } catch (error) {
            console.error('Error rejecting payment:', error);
            alert('Failed to reject payment');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getDeadlineCountdown = (deadline: string) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (diff < 0) return 'Expired';
        return `${hours}h ${minutes}m remaining`;
    };

    const getPatientInfo = (payment: PendingPayment) => {
        if (payment.payment_type === 'order' && payment.order) {
            return payment.order.patient;
        }
        if (payment.payment_type === 'appointment' && payment.appointment) {
            return payment.appointment.patient;
        }
        return { name: 'Unknown', email: 'N/A' };
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        // Remove seconds from time format (08:00:00 -> 08:00)
        if (!timeString) return '-';
        return timeString.substring(0, 5);
    };

    const getServiceTypeLabel = (type: string, method?: string) => {
        if (type === 'online') {
            return method === 'video' ? 'Konsultasi Video Call' : 'Konsultasi Chat';
        }
        return 'Kunjungan Homecare';
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Verifikasi Pembayaran</h1>
                    <p className="mt-2 text-sm text-gray-600">Tinjau dan verifikasi pembayaran transfer bank dari pasien</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {/* Info about local file paths */}
                        {payments.some(p => p.payment_proof_url?.startsWith('file://')) && (
                            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-yellow-800 text-sm">Image Upload Implementation Required</h4>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Payment proofs are stored as local file paths. Please implement server image upload (AWS S3, Cloudinary, etc.) to display images properly.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {payments.map((payment) => {
                            const patient = getPatientInfo(payment);
                            const deadlineStatus = getDeadlineCountdown(payment.payment_deadline);
                            const isExpired = deadlineStatus === 'Expired';

                            return (
                                <div key={payment.id} className="rounded-lg bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex gap-4">
                                        {/* Payment Proof Preview */}
                                        {payment.payment_proof_url ? (
                                            <div className="shrink-0">
                                                <img
                                                    src={payment.payment_proof_url}
                                                    alt="Payment Proof"
                                                    className="h-32 w-32 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => {
                                                        setSelectedImageUrl(payment.payment_proof_url!);
                                                        setShowImageModal(true);
                                                    }}
                                                    onError={(e) => {
                                                        console.warn('Cannot load image (local file path):', payment.payment_proof_url);
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="12"%3ELocal File%3C/text%3E%3Ctext x="50%25" y="60%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="10"%3ECannot Display%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="shrink-0 h-32 w-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                                <div className="text-center">
                                                    <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="mt-2 text-xs text-gray-500">No proof uploaded</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Payment Details */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Pembayaran {payment.payment_type === 'order' ? 'Produk' : 'Appointment'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        <span className="font-medium">Pasien:</span> {patient.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {patient.email}
                                                    </p>
                                                </div>
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${isExpired ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {deadlineStatus}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Jumlah</p>
                                                    <p className="text-xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dikirim</p>
                                                    <p className="text-sm text-gray-900">
                                                        {new Date(payment.created_at).toLocaleString('id-ID', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Appointment Details Section */}
                                            {payment.payment_type === 'appointment' && payment.appointment && (
                                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Detail Appointment
                                                    </h4>

                                                    {/* Optometrist & Schedule Info */}
                                                    <div className="grid grid-cols-2 gap-3 mb-2">
                                                        <div>
                                                            <p className="text-xs text-blue-600 font-medium mb-1">👨‍⚕️ Optometrist</p>
                                                            <p className="text-sm font-semibold text-blue-900">
                                                                {payment.appointment.optometrist.name}
                                                            </p>
                                                            <p className="text-xs text-blue-700">
                                                                {payment.appointment.optometrist.email}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs text-blue-600 font-medium mb-1">📅 Jadwal</p>
                                                            <p className="text-sm font-semibold text-blue-900">
                                                                {formatDate(payment.appointment.date)}
                                                            </p>
                                                            <p className="text-xs text-blue-700">
                                                                ⏰ {formatTime(payment.appointment.start_time)} - {formatTime(payment.appointment.end_time)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Service Type & Method Badges */}
                                                    <div className="flex gap-2 flex-wrap">
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                                                            {payment.appointment.type === 'online' ? '🌐' : '🏠'}
                                                            {payment.appointment.type === 'online' ? 'Online' : 'Homecare'}
                                                        </span>
                                                        {payment.appointment.method && (
                                                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                                                                {payment.appointment.method === 'video' ? '📹' : '💬'}
                                                                {payment.appointment.method === 'video' ? 'Video' : 'Chat'}
                                                            </span>
                                                        )}
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                                            {getServiceTypeLabel(payment.appointment.type, payment.appointment.method)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => handleVerify(payment.id)}
                                                    className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-white font-medium hover:bg-green-700 transition-colors shadow-sm"
                                                    disabled={isExpired}
                                                >
                                                    ✓ Setujui
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedPayment(payment);
                                                        setShowRejectModal(true);
                                                    }}
                                                    className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-white font-medium hover:bg-red-700 transition-colors shadow-sm"
                                                >
                                                    ✗ Tolak
                                                </button>
                                                {payment.payment_proof_url && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedImageUrl(payment.payment_proof_url!);
                                                            setShowImageModal(true);
                                                        }}
                                                        className="rounded-lg bg-blue-50 px-4 py-2.5 text-blue-700 font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                                                    >
                                                        🖼️ Lihat Gambar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {payments.length === 0 && (
                            <div className="rounded-xl bg-gray-50 p-12 text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-600 font-medium">Tidak ada pembayaran yang perlu diverifikasi</p>
                                <p className="text-sm text-gray-500 mt-1">Semua pembayaran sudah diproses</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Rejection Modal */}
                {showRejectModal && selectedPayment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">Tolak Pembayaran</h2>
                            <p className="mb-4 text-sm text-gray-600">
                                Berikan alasan penolakan pembayaran ini
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 p-3 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                                rows={4}
                                placeholder="Contoh: Bukti pembayaran tidak jelas, nominal tidak sesuai, dll."
                            />
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={handleReject}
                                    className="flex-1 rounded-lg bg-red-600 py-2.5 text-white font-medium hover:bg-red-700 transition-colors"
                                >
                                    Tolak Pembayaran
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectionReason('');
                                        setSelectedPayment(null);
                                    }}
                                    className="flex-1 rounded-lg bg-gray-100 py-2.5 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Image Modal */}
                {showImageModal && selectedImageUrl && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm"
                        onClick={() => setShowImageModal(false)}
                    >
                        <div className="relative max-w-4xl max-h-[90vh] p-4">
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                            >
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <img
                                src={selectedImageUrl}
                                alt="Payment Proof Full"
                                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
