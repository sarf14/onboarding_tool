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
    <div style={{
      minHeight: '100vh',
      background: '#001e49',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      position: 'relative'
    }}>
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: '4px solid #141943',
          borderTopColor: '#163791',
          borderRadius: '0',
          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px',
          borderRightColor: '#001a62',
          borderBottomColor: '#001a62',
          borderLeftColor: '#001a62'
        }}></div>
        <p style={{ 
          color: '#efefef', 
          fontSize: '20px', 
          fontWeight: 700,
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: '2px'
        }}>Loading...</p>
      </div>
    </div>
  );
}
