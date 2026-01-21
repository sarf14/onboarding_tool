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
      background: '#001e49',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '30px'
          }}>
            {/* AUTONEX Logo */}
            <img 
              src="https://autonex-onboard.vercel.app/logo.png" 
              alt="AUTONEX Logo" 
              style={{
                height: '60px',
                width: 'auto',
                filter: 'brightness(0) invert(1)',
                display: 'block'
              }}
              onError={(e) => {
                // Fallback to text if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const logoDiv = document.createElement('div');
                  logoDiv.style.cssText = 'font-size: 48px; font-weight: 900; font-family: "Orbitron", sans-serif; color: #efefef; text-transform: uppercase; letter-spacing: 6px;';
                  logoDiv.textContent = 'AUTONEX';
                  parent.insertBefore(logoDiv, parent.firstChild);
                }
              }}
            />
          </div>
          <p style={{ 
            color: '#efefef', 
            fontSize: '20px', 
            fontWeight: 600,
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: '3px',
            opacity: 0.9
          }}>ONBOARDING PLATFORM</p>
        </div>

        {/* Login Form Card */}
        <div style={{
          background: '#141943',
          padding: '50px',
          borderRadius: '0',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          border: '3px solid #163791',
          borderLeft: '8px solid #163791',
          transition: 'all 0.4s',
          position: 'relative',
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 15px 50px rgba(22, 55, 145, 0.4)';
          e.currentTarget.style.borderColor = '#001a62';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.borderColor = '#163791';
        }}
        >
          {/* Angular corner accents */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '0',
            height: '0',
            borderLeft: '20px solid transparent',
            borderTop: '20px solid #001a62'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '0',
            height: '0',
            borderRight: '20px solid transparent',
            borderBottom: '20px solid #001a62'
          }}></div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {error && (
              <div style={{
                background: '#001e49',
                border: '2px solid #ef4444',
                color: '#efefef',
                padding: '15px 20px',
                borderRadius: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px'
              }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontWeight: 700 }}>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label htmlFor="email" style={{
                color: '#efefef',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontFamily: "'Orbitron', sans-serif"
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
                  background: '#001e49',
                  border: '2px solid #163791',
                  borderRadius: '0',
                  color: '#efefef',
                  fontSize: '16px',
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'all 0.3s',
                  fontFamily: "'Inter', sans-serif"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#001a62';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(22, 55, 145, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#163791';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Enter your email"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label htmlFor="password" style={{
                color: '#efefef',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontFamily: "'Orbitron', sans-serif"
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
                  background: '#001e49',
                  border: '2px solid #163791',
                  borderRadius: '0',
                  color: '#efefef',
                  fontSize: '16px',
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'all 0.3s',
                  fontFamily: "'Inter', sans-serif"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#001a62';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(22, 55, 145, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#163791';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '18px 45px',
                background: '#163791',
                border: '2px solid #001a62',
                color: '#efefef',
                fontWeight: 900,
                fontSize: '18px',
                fontFamily: "'Orbitron', sans-serif",
                textTransform: 'uppercase',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                borderRadius: '0',
                boxShadow: '0 10px 30px rgba(22, 55, 145, 0.3)',
                transition: 'all 0.3s',
                letterSpacing: '2px',
                opacity: isLoading ? 0.5 : 1,
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(22, 55, 145, 0.5)';
                  e.currentTarget.style.background = '#001a62';
                  e.currentTarget.style.borderColor = '#163791';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(22, 55, 145, 0.3)';
                e.currentTarget.style.background = '#163791';
                e.currentTarget.style.borderColor = '#001a62';
              }}
            >
              {isLoading ? 'SIGNING IN...' : 'SIGN IN →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
