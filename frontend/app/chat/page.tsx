'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
  }, [token, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await api.post('/chat', {
        message: userMessage.content,
        history,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.data.response || response.data.message || 'No response received',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: error.response?.data?.error || 'Failed to send message. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#001e49',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif",
      color: '#efefef',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Header */}
      <header style={{
        background: '#141943',
        borderBottom: '3px solid #163791',
        borderLeft: '8px solid #163791',
        padding: '30px 50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => router.back()}
            style={{
              background: '#001a62',
              border: '2px solid #163791',
              color: '#efefef',
              padding: '12px 24px',
              borderRadius: '0',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: 700,
              transition: 'all 0.3s',
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#163791';
              e.currentTarget.style.borderColor = '#001a62';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#001a62';
              e.currentTarget.style.borderColor = '#163791';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ← Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* AUTONEX Logo */}
            <img 
              src="https://autonex-onboard.vercel.app/logo.png" 
              alt="AUTONEX Logo" 
              style={{
                height: '50px',
                width: 'auto',
                filter: 'brightness(0) invert(1)',
                display: 'block'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const logoDiv = document.createElement('div');
                  logoDiv.style.cssText = 'font-size: 42px; font-weight: 900; font-family: "Orbitron", sans-serif; color: #efefef; text-transform: uppercase; letter-spacing: 6px;';
                  logoDiv.textContent = 'AUTONEX';
                  parent.insertBefore(logoDiv, parent.firstChild);
                }
              }}
            />
            <h1 style={{ 
              color: '#efefef', 
              fontSize: '28px', 
              fontWeight: 900, 
              margin: 0,
              fontFamily: "'Orbitron', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '4px'
            }}>
              Support Chat
            </h1>
          </div>
        </div>
        {user && (
          <div style={{ 
            color: '#efefef', 
            fontSize: '14px',
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: '1px',
            opacity: 0.9
          }}>
            {user.name || user.email}
          </div>
        )}
      </header>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background: '#001e49'
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#efefef',
            marginTop: '100px',
            fontSize: '18px',
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: '2px'
          }}>
            <p style={{ marginBottom: '15px', opacity: 0.9 }}>Start a conversation with the support assistant</p>
            <p style={{ fontSize: '14px', opacity: 0.7, fontFamily: "'Inter', sans-serif", letterSpacing: 'normal' }}>
              Ask questions about the onboarding process, error categorization, or any other topics.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '10px'
            }}
          >
            <div style={{
              maxWidth: '70%',
              padding: '15px 20px',
              borderRadius: '0',
              background: message.role === 'user' ? '#163791' : '#141943',
              color: '#efefef',
              border: message.role === 'user' ? '2px solid #001a62' : '2px solid #163791',
              borderLeft: message.role === 'assistant' ? '8px solid #163791' : 'none',
              borderRight: message.role === 'user' ? '8px solid #001a62' : 'none',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              position: 'relative',
              clipPath: message.role === 'user' 
                ? 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                : 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              fontFamily: "'Inter', sans-serif",
              fontSize: '15px',
              lineHeight: '1.6'
            }}>
              {/* Angular corner accent for assistant messages */}
              {message.role === 'assistant' && (
                <>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '0',
                    height: '0',
                    borderLeft: '8px solid transparent',
                    borderTop: '8px solid #001a62'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '0',
                    height: '0',
                    borderRight: '8px solid transparent',
                    borderBottom: '8px solid #001a62'
                  }}></div>
                </>
              )}
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '10px'
          }}>
            <div style={{
              padding: '15px 20px',
              borderRadius: '0',
              background: '#141943',
              color: '#efefef',
              border: '2px solid #163791',
              borderLeft: '8px solid #163791',
              position: 'relative',
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '2px'
            }}>
              {/* Angular corner accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '0',
                height: '0',
                borderLeft: '8px solid transparent',
                borderTop: '8px solid #001a62'
              }}></div>
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div style={{
        background: '#141943',
        borderTop: '3px solid #163791',
        borderLeft: '8px solid #163791',
        padding: '30px',
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
        
        <div style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'flex-end'
        }}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            style={{
              flex: 1,
              background: '#001e49',
              border: '2px solid #163791',
              borderRadius: '0',
              padding: '15px 20px',
              color: '#efefef',
              fontSize: '15px',
              resize: 'none',
              minHeight: '60px',
              maxHeight: '150px',
              fontFamily: "'Inter', sans-serif",
              outline: 'none',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#001a62';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(22, 55, 145, 0.5)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#163791';
              e.currentTarget.style.boxShadow = 'none';
            }}
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            style={{
              background: isLoading || !inputMessage.trim() ? '#001a62' : '#163791',
              color: '#efefef',
              border: '2px solid #001a62',
              borderRadius: '0',
              padding: '15px 32px',
              cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 900,
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '2px',
              textTransform: 'uppercase',
              opacity: isLoading || !inputMessage.trim() ? 0.5 : 1,
              transition: 'all 0.3s',
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && inputMessage.trim()) {
                e.currentTarget.style.background = '#001a62';
                e.currentTarget.style.borderColor = '#163791';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && inputMessage.trim()) {
                e.currentTarget.style.background = '#163791';
                e.currentTarget.style.borderColor = '#001a62';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
