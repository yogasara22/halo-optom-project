'use client';

import React, { useReducer, Suspense } from 'react';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { User } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import CreateUserForm, { CreateUserFormData } from '@/components/forms/CreateUserForm';
import { GetUsersParams } from '@/services/userService';
import { userReducer, initialUserState } from '@/reducers/userReducer';
import { useUsers, useUserStats, useCreateUser, useUpdateUser, useDeleteUser, useToggleUserStatus } from '@/hooks/useUsers';

const UsersPage = () => {
  const [state, dispatch] = useReducer(userReducer, initialUserState);
  const {
    currentPage,
    searchTerm,
    roleFilter,
    sortConfig,
    isCreateModalOpen,
    isCreatingUser,
    isEditModalOpen,
    editingUser,
    limit
  } = state;

  // Menggunakan React Query untuk data fetching dan caching
  const params: GetUsersParams = {
    page: currentPage,
    limit,
    search: searchTerm || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    sortBy: sortConfig.key,
    sortOrder: sortConfig.direction,
  };

  const {
    data: userData,
    isLoading: loading,
    error: queryError
  } = useUsers(params);

  const users = userData?.data || [];
  const totalPages = userData?.totalPages || 1;
  const total = userData?.total || 0;

  // Menggunakan React Query untuk stats
  const { data: userStats = {
    total: 0,
    admin: 0,
    optometris: 0,
    pasien: 0,
    active: 0,
    inactive: 0
  } } = useUserStats();

  // Tidak perlu fetchUserStats dan fetchUsers karena React Query menanganinya

  // Menggunakan React Query mutation untuk create user
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const toggleUserStatusMutation = useToggleUserStatus();

  const handleCreateUser = async (userData: CreateUserFormData) => {
    try {
      dispatch({ type: 'SET_CREATING_USER', payload: true });
      await createUserMutation.mutateAsync(userData);
      dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: false });
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Gagal membuat pengguna');
    } finally {
      dispatch({ type: 'SET_CREATING_USER', payload: false });
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatusMutation.mutateAsync({ id: userId, isActive: !currentStatus });
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast.error(error.message || 'Gagal mengubah status pengguna');
    }
  };

  const handleEditUser = (user: User) => {
    dispatch({ type: 'SET_EDITING_USER', payload: user });
    dispatch({ type: 'TOGGLE_EDIT_MODAL', payload: true });
  };

  const handleUpdateUser = async (userData: CreateUserFormData) => {
    if (!editingUser) return;

    try {
      dispatch({ type: 'SET_CREATING_USER', payload: true });

      // Prepare update data, exclude password if empty
      const updateData: any = {
        id: editingUser.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        date_of_birth: userData.date_of_birth,
        gender: userData.gender,
        address: userData.address,
        bio: userData.bio,
        experience: userData.experience,
        certifications: userData.certifications,
        chat_commission_percentage: userData.chat_commission_percentage,
        video_commission_percentage: userData.video_commission_percentage,
      };

      // Upload avatar jika ada file baru
      if (userData.avatarFile) {
        const form = new FormData();
        form.append('avatar', userData.avatarFile);
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/users/${editingUser.id}/avatar`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
          },
          body: form,
        });
        let data: any = null;
        try { data = await resp.json(); } catch { data = { message: await resp.text() }; }
        if (!resp.ok) throw new Error(data?.message || 'Gagal upload avatar');
        updateData.avatar_url = data.avatar_url;
      }

      // Only include password if it's provided
      if (userData.password && userData.password.trim()) {
        updateData.password = userData.password;
      }

      await updateUserMutation.mutateAsync({ id: editingUser.id, data: updateData });
      dispatch({ type: 'TOGGLE_EDIT_MODAL', payload: false });
      dispatch({ type: 'SET_EDITING_USER', payload: null });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Gagal memperbarui pengguna');
    } finally {
      dispatch({ type: 'SET_CREATING_USER', payload: false });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengguna "${userName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(userId);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Gagal menghapus pengguna');
    }
  };

  const handleSort = (key: string) => {
    dispatch({
      type: 'SET_SORT_CONFIG',
      payload: {
        key,
        direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
      }
    });
  };

  const handlePageChange = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value });
  };

  const handleRoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_ROLE_FILTER', payload: e.target.value });
  };

  // Tidak perlu useEffect untuk fetching data karena React Query menanganinya

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Admin', className: 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border border-red-200 shadow-sm' },
      optometris: { label: 'Optometris', className: 'bg-blue-100 text-blue-800' },
      pasien: { label: 'Pasien', className: 'bg-green-100 text-green-800' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {role === 'admin' && (
          <ShieldCheckIcon className="w-3 h-3 mr-1" />
        )}
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
        {isActive ? (
          <>
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Aktif
          </>
        ) : (
          <>
            <XCircleIcon className="w-3 h-3 mr-1" />
            Nonaktif
          </>
        )}
      </span>
    );
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      title: 'Pengguna',
      sortable: true,
      render: (_, user) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="h-10 w-10 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#3DBD61] flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Peran',
      sortable: true,
      render: (role) => getRoleBadge(role),
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      render: (isActive) => getStatusBadge(isActive),
    },
    {
      key: 'phone',
      title: 'Telepon',
      sortable: true,
      render: (phone) => (
        <span className="text-sm text-gray-600">
          {phone || '-'}
        </span>
      ),
    },
    {
      key: 'gender',
      title: 'Jenis Kelamin',
      sortable: true,
      render: (gender) => (
        <span className="text-sm text-gray-600 capitalize">
          {gender || '-'}
        </span>
      ),
    },
    {
      key: 'address',
      title: 'Alamat',
      sortable: true,
      render: (address) => (
        <span className="text-sm text-gray-600 truncate max-w-[150px] block" title={address}>
          {address || '-'}
        </span>
      ),
    },
    {
      key: 'str_number',
      title: 'No. STR',
      sortable: true,
      render: (str_number, user) => (
        <span className="text-sm text-gray-600 font-mono">
          {user.role === 'optometris' ? (str_number || '-') : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Aksi',
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditUser(user)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            title="Edit Pengguna"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
            className={user.isActive ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}
            title={user.isActive ? 'Nonaktifkan Pengguna' : 'Aktifkan Pengguna'}
          >
            {user.isActive ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteUser(user.id, user.name)}
            className="text-red-600 border-red-200 hover:bg-red-50"
            title="Hapus Pengguna"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
            <p className="text-gray-600 mt-1">Kelola pengguna, optometris, dan pasien dalam sistem</p>
          </div>
          <Button
            onClick={() => dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: true })}
            className="flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Tambah Pengguna</span>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/5 to-[#2563EB]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#2563EB]/70 text-sm font-semibold uppercase tracking-wide">Total Pengguna</p>
                  <p className="text-3xl font-bold text-[#2563EB] mt-2 group-hover:scale-105 transition-transform duration-300">{userStats.total}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-pulse"></div>
                    <span className="text-xs text-[#2563EB]/60 ml-2 font-medium">Aktif</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#2563EB]/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-[#3DBD61] to-[#3DBD61]/80 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{userStats.total > 99 ? '99+' : userStats.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3DBD61]/5 to-[#3DBD61]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#3DBD61]/70 text-sm font-semibold uppercase tracking-wide">Admin</p>
                  <p className="text-3xl font-bold text-[#3DBD61] mt-2 group-hover:scale-105 transition-transform duration-300">{userStats.admin}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-[#3DBD61] rounded-full animate-pulse"></div>
                    <span className="text-xs text-[#3DBD61]/60 ml-2 font-medium">Sistem</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#3DBD61] to-[#3DBD61]/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <ShieldCheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-[#2563EB] to-[#2563EB]/80 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{userStats.admin}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/5 to-[#2563EB]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#2563EB]/70 text-sm font-semibold uppercase tracking-wide">Optometris</p>
                  <p className="text-3xl font-bold text-[#2563EB] mt-2 group-hover:scale-105 transition-transform duration-300">{userStats.optometris}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-pulse"></div>
                    <span className="text-xs text-[#2563EB]/60 ml-2 font-medium">Profesional</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#2563EB]/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-[#3DBD61] to-[#3DBD61]/80 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{userStats.optometris}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3DBD61]/5 to-[#3DBD61]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#3DBD61]/70 text-sm font-semibold uppercase tracking-wide">Pasien</p>
                  <p className="text-3xl font-bold text-[#3DBD61] mt-2 group-hover:scale-105 transition-transform duration-300">{userStats.pasien}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-[#3DBD61] rounded-full animate-pulse"></div>
                    <span className="text-xs text-[#3DBD61]/60 ml-2 font-medium">Terdaftar</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#3DBD61] to-[#3DBD61]/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-[#2563EB] to-[#2563EB]/80 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{userStats.pasien > 99 ? '99+' : userStats.pasien}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar - Integrated above DataTable */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[#2563EB] transition-colors duration-200" />
                </div>
                <Input
                  type="text"
                  placeholder="Cari berdasarkan nama atau email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-12 pr-4 py-3 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
            <div className="lg:w-56">
              <div className="relative group">
                <select
                  value={roleFilter}
                  onChange={handleRoleFilter}
                  className="w-full px-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white/80 backdrop-blur-sm text-gray-900 appearance-none cursor-pointer hover:border-[#2563EB]/50 transition-all duration-200 font-medium"
                >
                  <option value="all" className="py-2">🔍 Semua Peran</option>
                  <option value="admin" className="py-2">🛡️ Admin</option>
                  <option value="optometris" className="py-2">👨‍⚕️ Optometris</option>
                  <option value="pasien" className="py-2">👤 Pasien</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-[#2563EB] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="font-medium">Total:</span>
              <span className="px-2 py-1 bg-[#2563EB]/10 text-[#2563EB] rounded-lg font-semibold">{total}</span>
              <span>pengguna</span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={users}
          columns={columns}
          isLoading={loading}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: handlePageChange,
          }}
          sortConfig={sortConfig}
          onSort={handleSort}
          emptyMessage="Tidak ada pengguna ditemukan"
        />

        {/* Create User Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: false })}
          title="Tambah Pengguna Baru"
          size="lg"
        >
          <CreateUserForm
            onSubmit={handleCreateUser}
            isLoading={isCreatingUser}
            onCancel={() => dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: false })}
          />
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            dispatch({ type: 'TOGGLE_EDIT_MODAL', payload: false });
            dispatch({ type: 'SET_EDITING_USER', payload: null });
          }}
          title="Edit Pengguna"
          size="lg"
        >
          {editingUser && (
            <CreateUserForm
              onSubmit={handleUpdateUser}
              isLoading={isCreatingUser}
              onCancel={() => {
                dispatch({ type: 'TOGGLE_EDIT_MODAL', payload: false });
                dispatch({ type: 'SET_EDITING_USER', payload: null });
              }}
              initialData={{
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role === 'admin' ? 'optometris' : editingUser.role as 'optometris' | 'pasien',
                phone: editingUser.phone || '',
                date_of_birth: editingUser.date_of_birth || '',
                gender: (editingUser.gender === 'laki-laki' || editingUser.gender === 'perempuan') ? editingUser.gender : undefined,
                address: editingUser.address || '',
                bio: editingUser.bio || '',
                experience: editingUser.experience || '',
                chat_commission_percentage: editingUser.chat_commission_percentage || 0,
                video_commission_percentage: editingUser.video_commission_percentage || 0,
                avatar_url: editingUser.avatar_url || '',
              }}
              isEdit={true}
            />
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;
