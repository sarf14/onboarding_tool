'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { user, fetchUser, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  useEffect(() => {
    if (user) {
      // Redirect based on role
      if (user.roles.includes('ADMIN')) {
        router.push('/admin');
      } else if (user.roles.includes('MENTOR')) {
        router.push('/mentor');
      } else {
        router.push('/dashboard');
      }
    } else if (!token) {
      router.push('/login');
    }
  }, [user, router, token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}
