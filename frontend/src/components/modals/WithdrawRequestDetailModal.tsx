'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import withdrawService, { WithdrawRequest, WithdrawStatus } from '@/services/withdrawService';

interface WithdrawRequestDetailModalProps {
    request: WithdrawRequest;
    onClose: () => void;
    onRequestUpdated: () => void;
}

const statusColors: Record<WithdrawStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
};

const statusIcons: Record<WithdrawStatus, string> = {
    PENDING: '🟡',
    APPROVED: '🔵',
    PAID: '🟢',
    REJECTED: '🔴',
};

export default function WithdrawRequestDetailModal({
    request,
    onClose,
    onRequestUpdated,
}: WithdrawRequestDetailModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleApprove = async () => {
        if (!confirm('Apakah Anda yakin ingin menyetujui permintaan penarikan ini?')) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await withdrawService.approveWithdrawRequest(request.id);
            onRequestUpdated();
        } catch (err: any) {
            setError(err.message || 'Failed to approve withdrawal request');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            setError('Alasan penolakan harus diisi');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await withdrawService.rejectWithdrawRequest(request.id, rejectReason);
            onRequestUpdated();
        } catch (err: any) {
            setError(err.message || 'Failed to reject withdrawal request');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async () => {
        if (!confirm('Apakah Anda yakin sudah melakukan transfer dan ingin menandai sebagai PAID?')) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await withdrawService.markAsPaid(request.id);
            onRequestUpdated();
        } catch (err: any) {
            setError(err.message || 'Failed to mark as paid');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Detail Permintaan Penarikan" size="xl">
            <div className="space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${statusColors[request.status]}`}>
                        {statusIcons[request.status]} {request.status}
                    </span>
                    <div className="text-sm text-gray-500">
                        ID: {request.id.slice(0, 8)}...
                    </div>
                </div>

                {/* Optometrist Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900">Detail Optometris</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Nama</p>
                            <p className="font-medium text-gray-900">{request.optometrist.name}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{request.optometrist.email}</p>
                        </div>
                        {request.optometrist.phone && (
                            <div>
                                <p className="text-gray-500">Telepon</p>
                                <p className="font-medium text-gray-900">{request.optometrist.phone}</p>
                            </div>
                        )}
                        {request.optometrist.str_number && (
                            <div>
                                <p className="text-gray-500">Nomor STR</p>
                                <p className="font-medium text-gray-900">{request.optometrist.str_number}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Withdrawal Details */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900">Detail Penarikan</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Jumlah Penarikan</span>
                            <span className="font-bold text-blue-600 text-lg">
                                {formatCurrency(Number(request.amount))}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Tanggal Pengajuan</span>
                            <span className="font-medium text-gray-900">
                                {formatDate(request.requested_at)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bank Details */}
                <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900">Informasi Rekening</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Nama Bank</span>
                            <span className="font-medium text-gray-900">{request.bank_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Nomor Rekening</span>
                            <span className="font-mono font-medium text-gray-900">{request.bank_account_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Nama Pemilik Rekening</span>
                            <span className="font-medium text-gray-900">{request.bank_account_name}</span>
                        </div>
                    </div>
                </div>

                {/* Audit Trail */}
                {(request.reviewed_by_admin || request.reviewed_at || request.note) && (
                    <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-gray-900">Audit Trail</h3>
                        <div className="space-y-2 text-sm">
                            {request.reviewed_by_admin && (
                                <div>
                                    <p className="text-gray-500">Direview oleh</p>
                                    <p className="font-medium text-gray-900">{request.reviewed_by_admin.name}</p>
                                    <p className="text-xs text-gray-500">{request.reviewed_by_admin.email}</p>
                                </div>
                            )}
                            {request.reviewed_at && (
                                <div>
                                    <p className="text-gray-500">Waktu Review</p>
                                    <p className="font-medium text-gray-900">{formatDate(request.reviewed_at)}</p>
                                </div>
                            )}
                            {request.note && (
                                <div>
                                    <p className="text-gray-500">Catatan</p>
                                    <p className="font-medium text-gray-900 bg-white p-2 rounded border">
                                        {request.note}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reject Dialog */}
                {showRejectDialog && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                        <h4 className="font-semibold text-red-900">Alasan Penolakan</h4>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Masukkan alasan penolakan..."
                            className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows={4}
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleReject}
                                disabled={loading || !rejectReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Memproses...' : 'Konfirmasi Penolakan'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectDialog(false);
                                    setRejectReason('');
                                }}
                                disabled={loading}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {!showRejectDialog && (
                    <div className="flex space-x-3 pt-4 border-t">
                        {request.status === 'PENDING' && (
                            <>
                                <button
                                    onClick={handleApprove}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Memproses...' : '✓ Setujui'}
                                </button>
                                <button
                                    onClick={() => setShowRejectDialog(true)}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    ✗ Tolak
                                </button>
                            </>
                        )}
                        {request.status === 'APPROVED' && (
                            <button
                                onClick={handleMarkAsPaid}
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Memproses...' : '✓ Tandai Sudah Dibayar'}
                            </button>
                        )}
                        {(request.status === 'PAID' || request.status === 'REJECTED') && (
                            <div className="flex-1 text-center py-3 text-gray-500">
                                Tidak ada aksi yang tersedia untuk request dengan status {request.status}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
