'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import bankAccountService, { type BankAccount, type CreateBankAccountDto } from '@/services/bankAccountService';

export default function BankAccountsPage() {
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
    const [formData, setFormData] = useState<CreateBankAccountDto>({
        bank_name: '',
        account_number: '',
        account_holder_name: '',
        branch: '',
        is_active: true,
    });

    useEffect(() => {
        fetchBankAccounts();
    }, []);

    const fetchBankAccounts = async () => {
        try {
            setLoading(true);
            const accounts = await bankAccountService.getBankAccounts();
            setBankAccounts(accounts);
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAccount) {
                await bankAccountService.updateBankAccount(editingAccount.id, formData);
            } else {
                await bankAccountService.createBankAccount(formData);
            }
            setShowModal(false);
            setEditingAccount(null);
            resetForm();
            fetchBankAccounts();
        } catch (error) {
            console.error('Error saving bank account:', error);
            alert('Failed to save bank account');
        }
    };

    const handleEdit = (account: BankAccount) => {
        setEditingAccount(account);
        setFormData({
            bank_name: account.bank_name,
            account_number: account.account_number,
            account_holder_name: account.account_holder_name,
            branch: account.branch || '',
            is_active: account.is_active,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this bank account?')) return;
        try {
            await bankAccountService.deleteBankAccount(id);
            fetchBankAccounts();
        } catch (error) {
            console.error('Error deleting bank account:', error);
            alert('Failed to delete bank account');
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await bankAccountService.toggleBankAccountStatus(id, !currentStatus);
            fetchBankAccounts();
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Failed to update status');
        }
    };

    const resetForm = () => {
        setFormData({
            bank_name: '',
            account_number: '',
            account_holder_name: '',
            branch: '',
            is_active: true,
        });
    };

    const openAddModal = () => {
        setEditingAccount(null);
        resetForm();
        setShowModal(true);
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Bank Accounts</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage bank accounts for manual transfers</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 rounded-xl bg-linear-to-r from-[#2563EB] to-[#3DBD61] px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Rekening Bank
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {bankAccounts.map((account) => (
                            <div key={account.id} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-gray-900">{account.bank_name}</h3>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${account.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                {account.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="mt-3 space-y-2">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Account Number:</span> {account.account_number}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Account Holder:</span> {account.account_holder_name}
                                            </p>
                                            {account.branch && (
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Branch:</span> {account.branch}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleToggleStatus(account.id, account.is_active)}
                                            className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            {account.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(account)}
                                            className="rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(account.id)}
                                            className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {bankAccounts.length === 0 && (
                            <div className="rounded-xl bg-gray-50 p-12 text-center">
                                <p className="text-gray-600">No bank accounts found. Add one to get started.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">
                                {editingAccount ? 'Edit Bank Account' : 'Tambah Rekening Bank'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.bank_name}
                                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g. BCA, Mandiri, BNI"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.account_number}
                                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.account_holder_name}
                                        onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Branch (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.branch}
                                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                                        Active
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 transition-colors"
                                    >
                                        {editingAccount ? 'Update' : 'Simpan'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingAccount(null);
                                            resetForm();
                                        }}
                                        className="flex-1 rounded-lg bg-gray-100 py-2 text-gray-700 hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
