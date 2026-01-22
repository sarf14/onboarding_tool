'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function SectionContentPage() {
  const params = useParams();
  const router = useRouter();
  const section = params.section as string;
  const { user, token } = useAuthStore();
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizStatus, setQuizStatus] = useState<{ passed: boolean; score: number } | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchContent();
    fetchQuizStatus();
  }, [section, token, router]);

  const fetchContent = async () => {
    try {
      const response = await api.get(`/content/section/${section}`);
      setContent(response.data.content);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuizStatus = async () => {
    try {
      // Only fetch quiz status for sections 1-4, not final
      if (section === 'final') {
        return;
      }
      const response = await api.get(`/quizzes/results?section=${section}&quizType=DAY_END_QUIZ`);
      const quizzes = response.data.quizzes || [];
      
      // Find the best quiz score for this section
      if (quizzes.length > 0) {
        const bestQuiz = quizzes.reduce((best: any, current: any) => {
          return current.percentage > (best?.percentage || 0) ? current : best;
        }, quizzes[0]);
        
        if (bestQuiz.percentage >= 80) {
          setQuizStatus({ passed: true, score: bestQuiz.percentage });
        } else {
          setQuizStatus({ passed: false, score: bestQuiz.percentage });
        }
      } else {
        setQuizStatus(null);
      }
    } catch (error) {
      console.error('Failed to fetch quiz status:', error);
      setQuizStatus(null);
    }
  };

  if (isLoading || !content) {
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
          }}>Loading content...</p>
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
        }}>Documents & Resources</h4>
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

  const sectionNum = parseInt(section);
  const totalSections = 4;

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
            }}>Section {section}: {content.title}</div>
            <div style={{
              fontSize: '18px',
              color: '#efefef',
              fontWeight: 500,
              opacity: 0.9,
              fontFamily: "'Inter', sans-serif"
            }}>{content.description}</div>
            {content.estimatedDuration && (
              <div style={{
                fontSize: '14px',
                color: '#efefef',
                marginTop: '5px',
                opacity: 0.8,
                fontFamily: "'Inter', sans-serif"
              }}>Estimated Duration: {content.estimatedDuration}</div>
            )}
          </div>
          <button
            onClick={() => router.push('/dashboard')}
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
            ← Dashboard
          </button>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <section style={{
            background: '#141943',
            borderRadius: '0',
            padding: '50px',
            marginBottom: '30px',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Topics */}
              {content.topics && content.topics.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#efefef',
                    marginBottom: '20px',
                    textTransform: 'uppercase',
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: '2px'
                  }}>Topics Covered</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '15px'
                  }}>
                    {content.topics.map((topic: string, idx: number) => (
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

              {/* Activities */}
              {content.activities && content.activities.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#efefef',
                    marginBottom: '20px',
                    textTransform: 'uppercase',
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: '2px'
                  }}>Activities</h3>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '15px', listStyle: 'none', padding: 0 }}>
                    {content.activities.map((activity: any, idx: number) => {
                      const activityName = typeof activity === 'string' ? activity : activity.name || '';
                      const isQuizActivity = activityName.toLowerCase().includes('quiz');
                      return (
                      <li 
                        key={idx} 
                        onClick={() => {
                          if (isQuizActivity) {
                            router.push(`/section/${section}/quiz`);
                          } else {
                            router.push(`/section/${section}/activity/${idx}`);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '15px',
                          padding: '20px',
                          background: '#001e49',
                          border: '2px solid #163791',
                          borderRadius: '0',
                          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.4s',
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
                          e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
                          e.currentTarget.style.borderColor = '#163791';
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
                          <span style={{ color: '#efefef', fontWeight: 900, fontSize: '20px' }}>•</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{
                            color: '#efefef',
                            fontWeight: 700,
                            fontSize: '16px',
                            fontFamily: "'Inter', sans-serif"
                          }}>{typeof activity === 'string' ? activity : (activity as any).name || String(activity)}</span>
                          <div style={{
                            marginTop: '8px',
                            fontSize: '14px',
                            color: '#163791',
                            fontWeight: 600,
                            fontFamily: "'Orbitron', sans-serif",
                            letterSpacing: '1px'
                          }}>Click to view details →</div>
                        </div>
                      </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Video */}
              {content.videoUrl && renderVideoEmbed(
                content.videoUrl, 
                content.videoUrl.includes('1fjbC8MeyBfmUL5ZWofzoR-UXbmSgWEo6') ? 'Introductory video' : 
                content.videoUrl.includes('1M2xoiXDG30jI_BhO0CfaWRVJVxkPJWl3') ? 'Autonex QC Reviewing Process' : 
                content.videoUrl.includes('1UqiPQ-0NCNB3ba3g5emssNltapH5Op0j') ? 'Video 3 - Tracking the Critical Error' :
                'Video'
              )}

              {/* Documents */}
              {content.documents && renderDocuments(content.documents)}
            </div>
          </section>

          {/* Quiz Button */}
          {content.hasQuiz && (
            <div style={{
              background: '#141943',
              borderRadius: '0',
              padding: '50px',
              marginBottom: '30px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
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
              
              <h3 style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#efefef',
                marginBottom: '20px',
                textTransform: 'uppercase',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '3px'
              }}>Ready to Test Your Knowledge?</h3>
              <p style={{
                color: '#efefef',
                fontSize: '18px',
                marginBottom: '10px',
                fontFamily: "'Inter', sans-serif",
                opacity: 0.9
              }}>Complete the quiz for this section to verify your understanding.</p>
              <p style={{
                color: '#ef4444',
                fontSize: '16px',
                fontWeight: 700,
                marginBottom: '30px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px'
              }}>⚠️ You must score 90% or higher to proceed to the next section</p>
              {quizStatus?.passed && (
                <div style={{
                  padding: '15px',
                  background: '#001e49',
                  borderRadius: '0',
                  marginBottom: '20px',
                  color: '#10b981',
                  fontWeight: 700,
                  border: '2px solid #10b981',
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: '1px',
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                }}>
                  ✓ Quiz Passed! Score: {quizStatus.score}%
                </div>
              )}
              <button
                onClick={() => router.push(`/section/${section}/quiz`)}
                style={{
                  padding: '18px 45px',
                  background: '#163791',
                  border: '2px solid #001a62',
                  color: '#efefef',
                  fontWeight: 900,
                  fontSize: '18px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '0',
                  boxShadow: '0 10px 30px rgba(22, 55, 145, 0.5)',
                  transition: 'all 0.3s',
                  letterSpacing: '2px',
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
                {quizStatus?.passed ? 'Retake Section Quiz' : 'Take Section Quiz →'}
              </button>
            </div>
          )}

          {/* Navigation Footer */}
          <div style={{
            background: '#141943',
            borderRadius: '0',
            padding: '50px',
            marginTop: '40px',
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <button
                onClick={() => router.push(`/section/${sectionNum - 1}`)}
                disabled={sectionNum === 1}
                style={{
                  padding: '18px 45px',
                  background: '#001e49',
                  border: '2px solid #163791',
                  color: '#efefef',
                  borderRadius: '0',
                  fontWeight: 900,
                  fontSize: '18px',
                  textTransform: 'uppercase',
                  cursor: sectionNum === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  letterSpacing: '2px',
                  opacity: sectionNum === 1 ? 0.5 : 1,
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
                  fontFamily: "'Orbitron', sans-serif",
                  clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                }}
                onMouseEnter={(e) => {
                  if (sectionNum !== 1) {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(22, 55, 145, 0.5)';
                    e.currentTarget.style.background = '#141943';
                    e.currentTarget.style.borderColor = '#001a62';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.background = '#001e49';
                  e.currentTarget.style.borderColor = '#163791';
                }}
              >
                ← Previous Section
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
                  fontSize: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontFamily: "'Orbitron', sans-serif"
                }}>Section {sectionNum} of {totalSections}</span>
              </div>

              <button
                onClick={() => {
                  // Check if quiz is passed before allowing next section or final quiz
                  if (content.hasQuiz && !quizStatus?.passed) {
                    alert('You must complete and pass the section quiz (90% or higher) before proceeding.');
                    return;
                  }
                  if (sectionNum < totalSections) {
                    router.push(`/section/${sectionNum + 1}`);
                  } else if (sectionNum === totalSections) {
                    // After section 4, go to final quiz
                    router.push('/section/final/quiz');
                  }
                }}
                disabled={sectionNum === totalSections && content.hasQuiz && !quizStatus?.passed}
                style={{
                  padding: '18px 45px',
                  background: sectionNum === totalSections ? '#10b981' : '#163791',
                  border: `2px solid ${sectionNum === totalSections ? '#059669' : '#001a62'}`,
                  color: '#efefef',
                  fontWeight: 900,
                  fontSize: '18px',
                  textTransform: 'uppercase',
                  cursor: (sectionNum === totalSections && content.hasQuiz && !quizStatus?.passed) ? 'not-allowed' : 'pointer',
                  borderRadius: '0',
                  boxShadow: '0 10px 30px rgba(22, 55, 145, 0.5)',
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: '2px',
                  clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                  transition: 'all 0.3s',
                  opacity: (sectionNum === totalSections && content.hasQuiz && !quizStatus?.passed) ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!(sectionNum === totalSections && content.hasQuiz && !quizStatus?.passed)) {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                    if (sectionNum === totalSections) {
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.7)';
                      e.currentTarget.style.background = '#059669';
                      e.currentTarget.style.borderColor = '#10b981';
                    } else {
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(22, 55, 145, 0.7)';
                      e.currentTarget.style.background = '#001a62';
                      e.currentTarget.style.borderColor = '#163791';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  if (sectionNum === totalSections) {
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.5)';
                    e.currentTarget.style.background = '#10b981';
                    e.currentTarget.style.borderColor = '#059669';
                  } else {
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(22, 55, 145, 0.5)';
                    e.currentTarget.style.background = '#163791';
                    e.currentTarget.style.borderColor = '#001a62';
                  }
                }}
              >
                {sectionNum === totalSections ? 'Take Final Quiz →' : 'Next Section →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
