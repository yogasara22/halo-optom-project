'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

const SetupAdminPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validasi
    if (!name || !email || !password || !confirmPassword) {
      setError('Semua field wajib diisi');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/users/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Setup admin gagal');
      }

      // Simpan token
      localStorage.setItem('admin_token', data.token);
      
      toast.success('Admin berhasil dibuat! Redirecting...');
      
      // Redirect ke dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Setup admin gagal');
      toast.error(err.message || 'Setup admin gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Halo Optom</h1>
          <p className="mt-2 text-gray-600">Setup Admin Dashboard</p>
          <p className="mt-1 text-sm text-gray-500">Buat akun admin pertama untuk mengakses dashboard</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Setup Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <Input
                label="Nama Lengkap"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Masukkan nama lengkap"
              />
              
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@halooptom.com"
              />
              
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Masukkan password (min. 6 karakter)"
              />
              
              <Input
                label="Konfirmasi Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Konfirmasi password"
              />
              
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={!name || !email || !password || !confirmPassword}
              >
                {isLoading ? 'Membuat Admin...' : 'Buat Admin'}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Sudah punya akun admin?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Login di sini
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupAdminPage;