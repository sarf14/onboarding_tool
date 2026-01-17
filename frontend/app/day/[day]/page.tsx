'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function DayContentPage() {
  const params = useParams();
  const router = useRouter();
  const day = parseInt(params.day as string);
  const { user, token } = useAuthStore();
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchContent();
  }, [day, token, router]);

  const fetchContent = async () => {
    try {
      const response = await api.get(`/content/day/${day}`);
      setContent(response.data.content);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !content) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: '#ffffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#ffffff', fontSize: '20px', fontWeight: 700 }}>Loading content...</p>
        </div>
      </div>
    );
  }

  const renderVideoEmbed = (videoUrl: string, title: string) => {
    if (!videoUrl) return null;
    
    const fileIdMatch = videoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const fileId = fileIdMatch ? fileIdMatch[1] : null;
    
    let embedUrl = videoUrl;
    if (fileId) {
      embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    } else {
      embedUrl = videoUrl.replace('/view', '/preview').replace('?usp=sharing', '').split('?')[0];
    }
    
    return (
      <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h4 style={{
          fontSize: '24px',
          fontWeight: 900,
          color: '#333',
          textTransform: 'uppercase'
        }}>{title}</h4>
        <div style={{
          position: 'relative',
          width: '100%',
          borderRadius: '25px',
          overflow: 'hidden',
          border: '4px solid #fff',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
          paddingBottom: '56.25%'
        }}>
          <iframe
            src={embedUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={title}
          ></iframe>
        </div>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '18px 45px',
            background: 'linear-gradient(135deg, #ff006e, #8338ec)',
            color: '#fff',
            borderRadius: '50px',
            fontWeight: 900,
            fontSize: '18px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(131, 56, 236, 0.5)',
            transition: 'all 0.3s',
            letterSpacing: '1px',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(131, 56, 236, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(131, 56, 236, 0.5)';
          }}
        >
          Open in Google Drive
        </a>
      </div>
    );
  };

  const renderDocuments = (documents: any[]) => {
    if (!documents || documents.length === 0) return null;

    return (
      <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h4 style={{
          fontSize: '24px',
          fontWeight: 900,
          color: '#333',
          textTransform: 'uppercase',
          marginBottom: '20px'
        }}>Documents & Resources</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px'
        }}>
          {documents.map((doc, idx) => (
            <a
              key={idx}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '25px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid #e5e7eb',
                borderRadius: '25px',
                cursor: 'pointer',
                transition: 'all 0.4s',
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-15px) rotate(2deg)';
                e.currentTarget.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = '#8338ec';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) rotate(0deg)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <div style={{
                padding: '15px',
                background: 'linear-gradient(135deg, #ff006e, #8338ec)',
                borderRadius: '20px'
              }}>
                <svg style={{ width: '32px', height: '32px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  color: '#333',
                  fontWeight: 900,
                  fontSize: '18px',
                  textTransform: 'uppercase',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>{doc.name}</p>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '5px', fontWeight: 600 }}>{doc.type || 'Document'}</p>
              </div>
              <svg style={{ width: '24px', height: '24px', color: '#8338ec' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderSession = (session: any, sessionNumber: number) => {
    if (!session) return null;

    // Determine session type for routing
    const getSessionType = (num: number) => {
      if (num === 1) return 'morning';
      if (num === 2) return 'afternoon';
      if (num === 2.5) return 'midday';
      return 'morning';
    };

    const sessionType = getSessionType(sessionNumber);

    return (
      <section style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '30px',
        padding: '50px',
        marginBottom: '30px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '25px',
          marginBottom: '30px',
          paddingBottom: '30px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #ff006e, #8338ec)',
            borderRadius: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid #fff',
            boxShadow: '0 10px 25px rgba(131, 56, 236, 0.4)'
          }}>
            <span style={{
              fontSize: '36px',
              fontWeight: 900,
              color: '#fff'
            }}>{sessionNumber}</span>
          </div>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #ff006e, #8338ec, #3a86ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>{session.title}</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Topics */}
          <div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#333',
              marginBottom: '20px',
              textTransform: 'uppercase'
            }}>Topics Covered</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px'
            }}>
              {session.topics?.map((topic: string, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '15px',
                    padding: '20px',
                    background: '#ffffff',
                    border: '2px solid #e5e7eb',
                    borderRadius: '25px',
                    transition: 'all 0.3s',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#8338ec';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(131, 56, 236, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #3a86ff, #8338ec)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <svg style={{ width: '20px', height: '20px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span style={{
                    color: '#333',
                    fontWeight: 700,
                    fontSize: '16px'
                  }}>{topic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#333',
              marginBottom: '20px',
              textTransform: 'uppercase'
            }}>Activities</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '15px', listStyle: 'none', padding: 0 }}>
              {session.activities?.map((activity: string | { name?: string }, idx: number) => (
                <li 
                  key={idx} 
                  onClick={() => router.push(`/day/${day}/activity/${sessionType}/${idx}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '15px',
                    padding: '20px',
                    background: '#ffffff',
                    border: '2px solid #e5e7eb',
                    borderRadius: '25px',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.4s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-15px) rotate(2deg)';
                    e.currentTarget.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.borderColor = '#8338ec';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) rotate(0deg)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #ff006e, #8338ec)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: '20px' }}>•</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{
                      color: '#333',
                      fontWeight: 700,
                      fontSize: '16px'
                    }}>{typeof activity === 'string' ? activity : (activity as any).name || String(activity)}</span>
                    <div style={{
                      marginTop: '8px',
                      fontSize: '14px',
                      color: '#8338ec',
                      fontWeight: 600
                    }}>Click to view details →</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Video */}
          {session.videoUrl && renderVideoEmbed(
            session.videoUrl, 
            session.videoUrl.includes('1fjbC8MeyBfmUL5ZWofzoR-UXbmSgWEo6') ? 'Introductory video' : 
            session.videoUrl.includes('1M2xoiXDG30jI_BhO0CfaWRVJVxkPJWl3') ? 'Autonex QC Reviewing Process' : 
            session.videoUrl.includes('1UqiPQ-0NCNB3ba3g5emssNltapH5Op0j') ? 'Video 3 - Tracking the Critical Error' :
            'Video'
          )}

          {/* Documents */}
          {session.documents && renderDocuments(session.documents)}
        </div>
      </section>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
      fontFamily: "'Inter', sans-serif",
      color: '#ffffff'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '25px 40px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '25px',
          marginBottom: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            fontSize: '36px',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #ff006e, #8338ec, #3a86ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '3px'
          }}>Day {day}: {content.title}</div>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #ff006e, #8338ec)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: '50px',
              transition: 'all 0.3s',
              boxShadow: '0 5px 15px rgba(131, 56, 236, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(131, 56, 236, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(131, 56, 236, 0.4)';
            }}
          >
            ← Dashboard
          </button>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Morning Session */}
          {renderSession(content.morningSession, 1)}

          {/* Afternoon Session */}
          {content.afternoonSession && renderSession(content.afternoonSession, 2)}


          {/* Navigation Footer */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '30px',
            padding: '50px',
            marginTop: '40px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <button
                onClick={() => router.push(`/day/${day - 1}`)}
                disabled={day === 1}
                style={{
                  padding: '18px 45px',
                  background: '#ffffff',
                  border: '2px solid #e5e7eb',
                  color: '#333',
                  borderRadius: '50px',
                  fontWeight: 900,
                  fontSize: '18px',
                  textTransform: 'uppercase',
                  cursor: day === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  letterSpacing: '1px',
                  opacity: day === 1 ? 0.5 : 1,
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (day !== 1) {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
                }}
              >
                ← Previous Day
              </button>
              
              <div style={{
                padding: '15px 30px',
                background: 'linear-gradient(135deg, #ff006e, #8338ec)',
                border: '4px solid #fff',
                borderRadius: '25px',
                boxShadow: '0 10px 25px rgba(131, 56, 236, 0.4)'
              }}>
                <span style={{
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>Day {day} of 5</span>
              </div>

              <button
                onClick={() => router.push(`/day/${day + 1}`)}
                disabled={day === 5}
                style={{
                  padding: '18px 45px',
                  background: 'linear-gradient(135deg, #ff006e, #8338ec)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '18px',
                  textTransform: 'uppercase',
                  cursor: day === 7 ? 'not-allowed' : 'pointer',
                  borderRadius: '50px',
                  boxShadow: '0 10px 30px rgba(131, 56, 236, 0.5)',
                  transition: 'all 0.3s',
                  letterSpacing: '1px',
                  opacity: day === 7 ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (day !== 7) {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(131, 56, 236, 0.7)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(131, 56, 236, 0.5)';
                }}
              >
                Next Day →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
