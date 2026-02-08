'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface EmailPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailUpdated: () => void;
  canClose?: boolean; // Allow closing only if email is already set
}

export default function EmailPromptModal({ isOpen, onClose, onEmailUpdated, canClose = false }: EmailPromptModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (isOpen && user?.email) {
      setEmail(user.email);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await api.put('/auth/update-email', { email });
      onEmailUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: '#141943',
        padding: '40px',
        borderRadius: '0',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '3px solid #163791',
        borderLeft: '8px solid #163791',
        position: 'relative',
        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
      }}>
        {/* Angular corner accent */}
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

        <h2 style={{
          fontSize: '24px',
          fontWeight: 900,
          fontFamily: "'Orbitron', sans-serif",
          color: '#efefef',
          marginBottom: '15px',
          textTransform: 'uppercase',
          letterSpacing: '3px'
        }}>{user?.email ? 'Change Your Email' : 'Welcome! Add Your Email'}</h2>

        <p style={{
          color: '#efefef',
          marginBottom: '25px',
          fontSize: '15px',
          lineHeight: '1.6',
          opacity: 0.9
        }}>
          {user?.email 
            ? 'Update your email address to receive important notifications about mentor assignments, training progress updates, and other communications.'
            : 'This is your first login! Please provide your email address to receive important notifications about mentor assignments, training progress updates, and other communications.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              fontFamily: "'Orbitron', sans-serif",
              color: '#efefef',
              letterSpacing: '1px',
              fontSize: '14px'
            }}>
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: '#001e49',
                border: error ? '2px solid #ef4444' : '2px solid #163791',
                borderRadius: '0',
                fontSize: '16px',
                outline: 'none',
                color: '#efefef',
                fontFamily: "'Inter', sans-serif"
              }}
              placeholder="your.email@example.com"
              autoFocus
            />
            {error && (
              <p style={{
                color: '#ef4444',
                fontSize: '13px',
                marginTop: '8px',
                marginBottom: 0
              }}>{error}</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '15px',
                background: isLoading ? '#666666' : '#163791',
                border: '2px solid #001a62',
                color: '#efefef',
                fontWeight: 700,
                borderRadius: '0',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                transition: 'all 0.3s',
                opacity: isLoading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#001a62';
                  e.currentTarget.style.borderColor = '#163791';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#163791';
                  e.currentTarget.style.borderColor = '#001a62';
                }
              }}
            >
              {isLoading ? 'Saving...' : user?.email ? 'Update Email' : 'Save Email'}
            </button>
            {canClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '15px',
                  background: '#001a62',
                  border: '2px solid #163791',
                  color: '#efefef',
                  fontWeight: 700,
                  borderRadius: '0',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                  transition: 'all 0.3s',
                  opacity: isLoading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = '#163791';
                    e.currentTarget.style.borderColor = '#001a62';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = '#001a62';
                    e.currentTarget.style.borderColor = '#163791';
                  }
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
