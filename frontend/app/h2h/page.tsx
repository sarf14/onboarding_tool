'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function H2HPage() {
  const router = useRouter();
  const [type, setType] = useState('Process Performance');
  const [preference, setPreference] = useState('Neutral');
  const [keyReq, setKeyReq] = useState('');
  const [suppInfo, setSuppInfo] = useState('');
  const [extra, setExtra] = useState('');
  const [formatted, setFormatted] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFormat = async () => {
    if (!keyReq && !suppInfo && !extra) {
      setError('Please fill in at least one field (Key Requirements, Supplementary Info, or Extra Details)');
      return;
    }

    setIsLoading(true);
    setError('');
    setFormatted('');

    try {
      const response = await api.post('/h2h/format', {
        type,
        preference,
        key_req: keyReq,
        supp_info: suppInfo,
        extra,
      });

      setFormatted(response.data.formatted || '');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to format text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (formatted) {
      navigator.clipboard.writeText(formatted);
      alert('Copied to clipboard!');
    }
  };

  const handleClear = () => {
    setKeyReq('');
    setSuppInfo('');
    setExtra('');
    setFormatted('');
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#001e49',
      color: '#efefef',
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          padding: '30px 50px',
          background: '#141943',
          borderRadius: '0',
          border: '3px solid #163791',
          borderLeft: '8px solid #163791',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
        }}>
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img 
              src="https://autonex-onboard.vercel.app/logo.png" 
              alt="AUTONEX Logo" 
              style={{
                height: '45px',
                width: 'auto',
                filter: 'brightness(0) invert(1)',
                display: 'block'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div>
              <h1 style={{
                fontSize: '42px',
                fontWeight: 900,
                fontFamily: "'Orbitron', sans-serif",
                color: '#efefef',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '4px'
              }}>H2H Writing Tool</h1>
              <p style={{ color: '#efefef', fontSize: '16px', fontFamily: "'Orbitron', sans-serif", letterSpacing: '1px', opacity: 0.9 }}>
                Format and polish Head-to-Head comparison text
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '14px 32px',
              background: '#163791',
              border: '2px solid #001a62',
              color: '#efefef',
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: '0',
              transition: 'all 0.3s',
              boxShadow: '0 0 15px rgba(22, 55, 145, 0.5)',
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontSize: '13px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#001a62';
              e.currentTarget.style.borderColor = '#163791';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(22, 55, 145, 0.8)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#163791';
              e.currentTarget.style.borderColor = '#001a62';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(22, 55, 145, 0.5)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >Back to Dashboard</button>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* Input Section */}
          <div style={{
            background: '#141943',
            padding: '30px',
            borderRadius: '0',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            border: '3px solid #163791',
            borderLeft: '8px solid #163791',
            position: 'relative',
            clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))'
          }}>
            {/* Angular corner accents */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '0',
              height: '0',
              borderLeft: '15px solid transparent',
              borderTop: '15px solid #001a62'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '0',
              height: '0',
              borderRight: '15px solid transparent',
              borderBottom: '15px solid #001a62'
            }}></div>
            
            <h2 style={{
              color: '#efefef',
              fontSize: '24px',
              fontWeight: 900,
              fontFamily: "'Orbitron', sans-serif",
              marginBottom: '25px',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>Input Fields</h2>

            {/* Type Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#efefef',
                fontWeight: 600,
                marginBottom: '8px',
                fontSize: '13px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase',
                opacity: 0.9
              }}>Comparison Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '0',
                  border: '2px solid #163791',
                  fontSize: '15px',
                  color: '#efefef',
                  background: '#001e49',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                }}
              >
                <option value="Process Performance">Process Performance</option>
                <option value="Outcome Performance">Outcome Performance</option>
              </select>
            </div>

            {/* Preference Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#efefef',
                fontWeight: 600,
                marginBottom: '8px',
                fontSize: '13px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase',
                opacity: 0.9
              }}>Preference *</label>
              <select
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '0',
                  border: '2px solid #163791',
                  fontSize: '15px',
                  color: '#efefef',
                  background: '#001e49',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                }}
              >
                <option value="Model A Strongly">Model A Strongly</option>
                <option value="Model A Slightly">Model A Slightly</option>
                <option value="Neutral">Neutral</option>
                <option value="Model B Slightly">Model B Slightly</option>
                <option value="Model B Strongly">Model B Strongly</option>
                <option value="Unsure">Unsure</option>
              </select>
            </div>

            {/* Key Requirements */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#efefef',
                fontWeight: 600,
                marginBottom: '8px',
                fontSize: '13px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase',
                opacity: 0.9
              }}>Key Requirements</label>
              <textarea
                value={keyReq}
                onChange={(e) => setKeyReq(e.target.value)}
                placeholder="What key requirements did both models meet?"
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  borderRadius: '0',
                  border: '2px solid #163791',
                  fontSize: '14px',
                  color: '#efefef',
                  background: '#001e49',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                }}
              />
            </div>

            {/* Supplementary Info */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#efefef',
                fontWeight: 600,
                marginBottom: '8px',
                fontSize: '13px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase',
                opacity: 0.9
              }}>Supplementary Information</label>
              <textarea
                value={suppInfo}
                onChange={(e) => setSuppInfo(e.target.value)}
                placeholder="What supplementary information did the models provide?"
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  borderRadius: '0',
                  border: '2px solid #163791',
                  fontSize: '14px',
                  color: '#efefef',
                  background: '#001e49',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                }}
              />
            </div>

            {/* Extra Details */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                color: '#efefef',
                fontWeight: 600,
                marginBottom: '8px',
                fontSize: '13px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase',
                opacity: 0.9
              }}>Extra Details / Errors</label>
              <textarea
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Additional details, errors, or mistakes made"
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  borderRadius: '0',
                  border: '2px solid #163791',
                  fontSize: '14px',
                  color: '#efefef',
                  background: '#001e49',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={handleFormat}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '15px',
                  background: isLoading ? '#001a62' : '#163791',
                  border: '2px solid #001a62',
                  color: '#efefef',
                  fontWeight: 700,
                  fontSize: '15px',
                  fontFamily: "'Orbitron', sans-serif",
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  borderRadius: '0',
                  transition: 'all 0.3s',
                  boxShadow: isLoading ? 'none' : '0 0 15px rgba(22, 55, 145, 0.5)',
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  opacity: isLoading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = '#001a62';
                    e.currentTarget.style.borderColor = '#163791';
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(22, 55, 145, 0.8)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = '#163791';
                    e.currentTarget.style.borderColor = '#001a62';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(22, 55, 145, 0.5)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {isLoading ? 'Formatting...' : 'Format Text'}
              </button>
              <button
                onClick={handleClear}
                style={{
                  padding: '15px 25px',
                  background: '#001a62',
                  border: '2px solid #163791',
                  color: '#efefef',
                  fontWeight: 600,
                  fontSize: '15px',
                  fontFamily: "'Orbitron', sans-serif",
                  cursor: 'pointer',
                  borderRadius: '0',
                  transition: 'all 0.3s',
                  clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#163791';
                  e.currentTarget.style.borderColor = '#001a62';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(22, 55, 145, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#001a62';
                  e.currentTarget.style.borderColor = '#163791';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >Clear</button>
            </div>

            {error && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#001e49',
                border: '2px solid #163791',
                borderRadius: '0',
                color: '#efefef',
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Output Section */}
          <div style={{
            background: '#141943',
            padding: '30px',
            borderRadius: '0',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            border: '3px solid #163791',
            borderLeft: '8px solid #163791',
            position: 'relative',
            clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))'
          }}>
            {/* Angular corner accents */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '0',
              height: '0',
              borderLeft: '15px solid transparent',
              borderTop: '15px solid #001a62'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '0',
              height: '0',
              borderRight: '15px solid transparent',
              borderBottom: '15px solid #001a62'
            }}></div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px'
            }}>
              <h2 style={{
                color: '#efefef',
                fontSize: '24px',
                fontWeight: 900,
                fontFamily: "'Orbitron', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}>Formatted Output</h2>
              {formatted && (
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '10px 20px',
                    background: '#163791',
                    border: '2px solid #001a62',
                    color: '#efefef',
                    fontWeight: 600,
                    fontSize: '13px',
                    fontFamily: "'Orbitron', sans-serif",
                    cursor: 'pointer',
                    borderRadius: '0',
                    transition: 'all 0.3s',
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    boxShadow: '0 0 10px rgba(22, 55, 145, 0.5)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#001a62';
                    e.currentTarget.style.borderColor = '#163791';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(22, 55, 145, 0.8)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#163791';
                    e.currentTarget.style.borderColor = '#001a62';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(22, 55, 145, 0.5)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >Copy</button>
              )}
            </div>

            {formatted ? (
              <div style={{
                background: '#001e49',
                padding: '20px',
                borderRadius: '0',
                border: '2px solid #163791',
                minHeight: '400px',
                whiteSpace: 'pre-wrap',
                color: '#efefef',
                fontSize: '15px',
                lineHeight: '1.6',
                fontFamily: 'inherit',
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
              }}>
                {formatted}
              </div>
            ) : (
              <div style={{
                background: '#001e49',
                padding: '20px',
                borderRadius: '0',
                border: '2px dashed #163791',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#efefef',
                fontSize: '16px',
                textAlign: 'center',
                opacity: 0.6,
                clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px'
              }}>
                Fill in the form and click "Format Text" to see the formatted output here
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: '#141943',
          padding: '25px',
          borderRadius: '0',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          marginTop: '30px',
          border: '3px solid #163791',
          borderLeft: '8px solid #163791',
          position: 'relative',
          clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))'
        }}>
          {/* Angular corner accents */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '0',
            height: '0',
            borderLeft: '15px solid transparent',
            borderTop: '15px solid #001a62'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '0',
            height: '0',
            borderRight: '15px solid transparent',
            borderBottom: '15px solid #001a62'
          }}></div>
          
          <h3 style={{
            color: '#efefef',
            fontSize: '20px',
            fontWeight: 900,
            fontFamily: "'Orbitron', sans-serif",
            marginBottom: '15px',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>How to Use</h3>
          <ul style={{
            color: '#efefef',
            lineHeight: '1.8',
            paddingLeft: '20px',
            opacity: 0.9
          }}>
            <li><strong>Comparison Type:</strong> Choose between Process Performance (how models executed) or Outcome Performance (final results quality)</li>
            <li><strong>Preference:</strong> Select which model performed better and by how much (Strongly/Slightly) or mark as Neutral/Unsure</li>
            <li><strong>Key Requirements:</strong> Describe what both models accomplished regarding the core task</li>
            <li><strong>Supplementary Information:</strong> Note any additional information provided by the models</li>
            <li><strong>Extra Details:</strong> Include specific errors, mistakes, or additional context</li>
            <li>The tool will format your input into polished H2H comparison text with proper grammar and structure</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
