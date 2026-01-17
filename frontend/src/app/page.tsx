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
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#62AADE] mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
