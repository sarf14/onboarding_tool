'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function ActivityPage() {
  const params = useParams();
  const router = useRouter();
  const section = params.section as string;
  const activityIndex = parseInt(params.activityIndex as string);
  const { token } = useAuthStore();
  const [activityData, setActivityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchActivity();
  }, [section, activityIndex, token, router]);

  const fetchActivity = async () => {
    try {
      const response = await api.get(`/content/activity/${section}/${activityIndex}`);
      setActivityData(response.data);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !activityData) {
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
          }}>Loading activity...</p>
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
          color: '#efefef',
          textTransform: 'uppercase',
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: '2px'
        }}>{title}</h4>
        <div style={{
          position: 'relative',
          width: '100%',
          borderRadius: '0',
          overflow: 'hidden',
          border: '3px solid #163791',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
          paddingBottom: '56.25%',
          clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
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
            background: '#163791',
            border: '2px solid #001a62',
            color: '#efefef',
            borderRadius: '0',
            fontWeight: 900,
            fontSize: '18px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(22, 55, 145, 0.5)',
            transition: 'all 0.3s',
            letterSpacing: '2px',
            textDecoration: 'none',
            fontFamily: "'Orbitron', sans-serif",
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(22, 55, 145, 0.7)';
            e.currentTarget.style.background = '#001a62';
            e.currentTarget.style.borderColor = '#163791';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(22, 55, 145, 0.5)';
            e.currentTarget.style.background = '#163791';
            e.currentTarget.style.borderColor = '#001a62';
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
          color: '#efefef',
          textTransform: 'uppercase',
          marginBottom: '20px',
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: '2px'
        }}>Related Documents</h4>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
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
                background: '#001e49',
                border: '2px solid #163791',
                borderRadius: '0',
                cursor: 'pointer',
                transition: 'all 0.4s',
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
                textDecoration: 'none',
                position: 'relative',
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(5px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(22, 55, 145, 0.5)';
                e.currentTarget.style.borderColor = '#001a62';
                e.currentTarget.style.background = '#141943';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = '#163791';
                e.currentTarget.style.background = '#001e49';
              }}
            >
              <div style={{
                padding: '15px',
                background: '#163791',
                borderRadius: '0',
                border: '2px solid #001a62',
                clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
              }}>
                <svg style={{ width: '32px', height: '32px', color: '#efefef' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  color: '#efefef',
                  fontWeight: 900,
                  fontSize: '18px',
                  textTransform: 'uppercase',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: '1px'
                }}>{doc.name}</p>
                <p style={{ color: '#efefef', fontSize: '14px', marginTop: '5px', fontWeight: 600, opacity: 0.8, fontFamily: "'Inter', sans-serif" }}>{doc.type || 'Document'}</p>
              </div>
              <svg style={{ width: '24px', height: '24px', color: '#163791' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const getActivityIcon = (activityType: string) => {
    if (activityType === 'read') return '📖';
    if (activityType === 'study') return '📚';
    if (activityType === 'watch') return '🎥';
    if (activityType === 'practice') return '✏️';
    return '📋';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#001e49',
      fontFamily: "'Inter', sans-serif",
      color: '#efefef',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '30px 50px',
          background: '#141943',
          borderRadius: '0',
          marginBottom: '40px',
          border: '3px solid #163791',
          borderLeft: '8px solid #163791',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
          flexWrap: 'wrap',
          gap: '20px'
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
          
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '36px',
              fontWeight: 900,
              color: '#efefef',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '10px',
              fontFamily: "'Orbitron', sans-serif"
            }}>Section {section}: {activityData.sectionTitle}</div>
            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#efefef',
              textTransform: 'uppercase',
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '2px',
              opacity: 0.9
            }}>{activityData.activity}</div>
          </div>
          <button
            onClick={() => router.push(`/section/${section}`)}
            style={{
              padding: '12px 28px',
              background: '#163791',
              border: '2px solid #001a62',
              color: '#efefef',
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: '0',
              transition: 'all 0.3s',
              boxShadow: '0 5px 15px rgba(22, 55, 145, 0.4)',
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '1px',
              textTransform: 'uppercase',
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(22, 55, 145, 0.6)';
              e.currentTarget.style.background = '#001a62';
              e.currentTarget.style.borderColor = '#163791';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(22, 55, 145, 0.4)';
              e.currentTarget.style.background = '#163791';
              e.currentTarget.style.borderColor = '#001a62';
            }}
          >
            ← Back to Section {section}
          </button>
        </div>

        {/* Activity Content */}
        <div style={{
          background: '#141943',
          borderRadius: '0',
          padding: '50px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          border: '3px solid #163791',
          borderLeft: '8px solid #163791',
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
          {/* Activity Content - Moved to top */}
          {activityData.content && (
            <div style={{
              marginBottom: '40px',
              padding: '30px',
              background: '#001e49',
              borderRadius: '0',
              border: '2px solid #163791',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
            }}>
              <div style={{
                color: '#efefef',
                fontSize: '16px',
                lineHeight: 1.6,
                fontWeight: 400,
                whiteSpace: 'pre-line',
                fontFamily: "'Inter', sans-serif"
              }}>
                {activityData.content}
              </div>
            </div>
          )}

          {/* Image - Display if available */}
          {activityData.imageUrl && (
            <div style={{ marginBottom: '40px' }}>
              <h4 style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#efefef',
                marginBottom: '20px',
                textTransform: 'uppercase',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '2px'
              }}>Reference Image</h4>
              <div style={{
                borderRadius: '0',
                overflow: 'hidden',
                border: '3px solid #163791',
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
                background: '#001e49',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}>
                <img
                  src={activityData.imageUrl}
                  alt="Activity reference"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </div>
            </div>
          )}

          {/* Video - Moved right after content */}
          {activityData.videoUrl && activityData.activityType === 'watch' && renderVideoEmbed(
            activityData.videoUrl,
            activityData.videoUrl.includes('1fjbC8MeyBfmUL5ZWofzoR-UXbmSgWEo6') ? 'Introductory video' :
            activityData.videoUrl.includes('1M2xoiXDG30jI_BhO0CfaWRVJVxkPJWl3') ? 'Autonex QC Reviewing Process' :
            activityData.videoUrl.includes('1UqiPQ-0NCNB3ba3g5emssNltapH5Op0j') ? 'Video 3 - Tracking the Critical Error' :
            'Video'
          )}
          
          {/* Second Video if available */}
          {activityData.videoUrl2 && activityData.activityType === 'watch' && renderVideoEmbed(
            activityData.videoUrl2,
            activityData.videoUrl2.includes('1UqiPQ-0NCNB3ba3g5emssNltapH5Op0j') ? 'Video 3 - Tracking the Critical Error' :
            activityData.videoUrl2.includes('1M2xoiXDG30jI_BhO0CfaWRVJVxkPJWl3') ? 'Autonex QC Reviewing Process' :
            'Video 2'
          )}

          {/* Related Topics */}
          {activityData.topics && activityData.topics.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#efefef',
                marginBottom: '20px',
                textTransform: 'uppercase',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '2px'
              }}>Related Topics</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '15px'
              }}>
                {activityData.topics.map((topic: string, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '15px',
                      padding: '20px',
                      background: '#001e49',
                      border: '2px solid #163791',
                      borderRadius: '0',
                      transition: 'all 0.3s',
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
                      position: 'relative',
                      clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#001a62';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(22, 55, 145, 0.5)';
                      e.currentTarget.style.background = '#141943';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#163791';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
                      e.currentTarget.style.background = '#001e49';
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: '#163791',
                      borderRadius: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      border: '2px solid #001a62',
                      clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
                    }}>
                      <svg style={{ width: '20px', height: '20px', color: '#efefef' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span style={{
                      color: '#efefef',
                      fontWeight: 700,
                      fontSize: '16px',
                      fontFamily: "'Inter', sans-serif"
                    }}>{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {activityData.documents && activityData.documents.length > 0 && renderDocuments(activityData.documents)}

          {/* Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '40px',
            paddingTop: '30px',
            borderTop: '2px solid #163791',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <button
              onClick={() => {
                if (activityIndex > 0) {
                  router.push(`/section/${section}/activity/${activityIndex - 1}`);
                } else {
                  router.push(`/section/${section}`);
                }
              }}
              style={{
                padding: '18px 45px',
                background: activityIndex > 0 ? '#163791' : '#141943',
                border: `2px solid ${activityIndex > 0 ? '#001a62' : '#163791'}`,
                color: '#efefef',
                borderRadius: '0',
                fontWeight: 900,
                fontSize: '18px',
                textTransform: 'uppercase',
                cursor: activityIndex > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                letterSpacing: '2px',
                opacity: activityIndex > 0 ? 1 : 0.5,
                boxShadow: activityIndex > 0 ? '0 10px 30px rgba(22, 55, 145, 0.5)' : 'none',
                fontFamily: "'Orbitron', sans-serif",
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
              onMouseEnter={(e) => {
                if (activityIndex > 0) {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(22, 55, 145, 0.7)';
                  e.currentTarget.style.background = '#001a62';
                  e.currentTarget.style.borderColor = '#163791';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = activityIndex > 0 ? '0 10px 30px rgba(22, 55, 145, 0.5)' : 'none';
                e.currentTarget.style.background = activityIndex > 0 ? '#163791' : '#141943';
                e.currentTarget.style.borderColor = activityIndex > 0 ? '#001a62' : '#163791';
              }}
            >
              ← Previous Activity
            </button>

            <div style={{
              padding: '15px 30px',
              background: '#163791',
              border: '3px solid #001a62',
              borderRadius: '0',
              boxShadow: '0 10px 25px rgba(22, 55, 145, 0.4)',
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
            }}>
              <span style={{
                color: '#efefef',
                fontWeight: 900,
                fontSize: '16px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontFamily: "'Orbitron', sans-serif"
              }}>Activity {activityIndex + 1} of {activityData.allActivities?.length || 0}</span>
            </div>

            <button
              onClick={() => {
                if (activityIndex < (activityData.allActivities?.length || 0) - 1) {
                  router.push(`/section/${section}/activity/${activityIndex + 1}`);
                } else {
                  router.push(`/section/${section}`);
                }
              }}
              style={{
                padding: '18px 45px',
                background: activityIndex < (activityData.allActivities?.length || 0) - 1 ? '#163791' : '#141943',
                border: `2px solid ${activityIndex < (activityData.allActivities?.length || 0) - 1 ? '#001a62' : '#163791'}`,
                color: '#efefef',
                borderRadius: '0',
                fontWeight: 900,
                fontSize: '18px',
                textTransform: 'uppercase',
                cursor: activityIndex < (activityData.allActivities?.length || 0) - 1 ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                letterSpacing: '2px',
                opacity: activityIndex < (activityData.allActivities?.length || 0) - 1 ? 1 : 0.5,
                boxShadow: activityIndex < (activityData.allActivities?.length || 0) - 1 ? '0 10px 30px rgba(22, 55, 145, 0.5)' : 'none',
                fontFamily: "'Orbitron', sans-serif",
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
              onMouseEnter={(e) => {
                if (activityIndex < (activityData.allActivities?.length || 0) - 1) {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(22, 55, 145, 0.7)';
                  e.currentTarget.style.background = '#001a62';
                  e.currentTarget.style.borderColor = '#163791';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = activityIndex < (activityData.allActivities?.length || 0) - 1 ? '0 10px 30px rgba(22, 55, 145, 0.5)' : 'none';
                e.currentTarget.style.background = activityIndex < (activityData.allActivities?.length || 0) - 1 ? '#163791' : '#141943';
                e.currentTarget.style.borderColor = activityIndex < (activityData.allActivities?.length || 0) - 1 ? '#001a62' : '#163791';
              }}
            >
              Next Activity →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
