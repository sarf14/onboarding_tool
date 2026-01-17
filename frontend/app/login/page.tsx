'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Login form submitted with:', { email });
      await login(email, password);
      console.log('Login successful, redirecting to dashboard');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error in form:', err);
      const errorMsg = typeof err === 'string' ? err : err?.message || err?.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '25px',
            marginBottom: '30px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <span style={{
              fontSize: '48px',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #ff006e, #8338ec, #3a86ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
              letterSpacing: '3px'
            }}>A</span>
          </div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #ff006e, #8338ec, #3a86ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: '10px'
          }}>Autonex</h1>
          <p style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600 }}>Onboarding Platform</p>
        </div>

        {/* Login Form Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '50px',
          borderRadius: '30px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.4s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-15px) rotate(2deg)';
          e.currentTarget.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
        }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '2px solid #ef4444',
                color: '#ffffff',
                padding: '15px 20px',
                borderRadius: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontWeight: 700 }}>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label htmlFor="email" style={{
                color: '#333',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  background: '#ffffff',
                  border: '2px solid #e5e7eb',
                  borderRadius: '25px',
                  color: '#333',
                  fontSize: '16px',
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#8338ec';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
                placeholder="Enter your email"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label htmlFor="password" style={{
                color: '#333',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  background: '#ffffff',
                  border: '2px solid #e5e7eb',
                  borderRadius: '25px',
                  color: '#333',
                  fontSize: '16px',
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#8338ec';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '18px 45px',
                background: 'linear-gradient(135deg, #ff006e, #8338ec)',
                border: 'none',
                color: '#fff',
                fontWeight: 900,
                fontSize: '18px',
                textTransform: 'uppercase',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                borderRadius: '50px',
                boxShadow: '0 10px 30px rgba(131, 56, 236, 0.5)',
                transition: 'all 0.3s',
                letterSpacing: '1px',
                opacity: isLoading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(131, 56, 236, 0.7)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(131, 56, 236, 0.5)';
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
