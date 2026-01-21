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
      background: '#000000',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <header style={{
        background: '#111111',
        borderBottom: '1px solid #333333',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'transparent',
              border: '1px solid #333333',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back
          </button>
          <h1 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, margin: 0 }}>
            Support Chat
          </h1>
        </div>
        {user && (
          <div style={{ color: '#888888', fontSize: '14px' }}>
            {user.name || user.email}
          </div>
        )}
      </header>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#888888',
            marginTop: '100px',
            fontSize: '16px'
          }}>
            <p>Start a conversation with the support assistant</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
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
              padding: '12px 16px',
              borderRadius: '12px',
              background: message.role === 'user' ? '#62AADE' : '#1a1a1a',
              color: '#ffffff',
              border: message.role === 'assistant' ? '1px solid #333333' : 'none',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}>
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
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#1a1a1a',
              color: '#888888',
              border: '1px solid #333333'
            }}>
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div style={{
        background: '#111111',
        borderTop: '1px solid #333333',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
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
              background: '#1a1a1a',
              border: '1px solid #333333',
              borderRadius: '8px',
              padding: '12px',
              color: '#ffffff',
              fontSize: '14px',
              resize: 'none',
              minHeight: '50px',
              maxHeight: '150px',
              fontFamily: 'inherit',
              outline: 'none'
            }}
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            style={{
              background: isLoading || !inputMessage.trim() ? '#333333' : '#62AADE',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              opacity: isLoading || !inputMessage.trim() ? 0.5 : 1
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
