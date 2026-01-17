'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface Section {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  hasQuiz: boolean;
}

interface SectionProgress {
  section: string;
  status: string;
  sectionProgress: number;
  quizScore?: number;
  activitiesCompleted: number;
  activitiesTotal: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout, fetchUser } = useAuthStore();
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionProgress, setSectionProgress] = useState<SectionProgress[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        // Fetch user first - this is critical
        await fetchUser();
        // Then fetch sections and progress in parallel
        await Promise.all([
          fetchSections(),
          fetchProgress()
        ]);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboard();
  }, [token, router]);

  const fetchSections = async () => {
    try {
      const response = await api.get('/content/sections');
      console.log('Sections response:', response.data);
      setSections(response.data.sections || []);
    } catch (error: any) {
      console.error('Failed to fetch sections:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await api.get('/progress/me');
      console.log('Progress response:', response.data);
      setSectionProgress(response.data.progress || []);
      setOverallProgress(response.data.overallProgress || 0);
      setCurrentSection(response.data.currentSection || 1);
    } catch (error: any) {
      console.error('Failed to fetch progress:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  // Show loading while fetching user or if no user yet
  if (isLoading || !user) {
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
          <p style={{ color: '#ffffff', fontSize: '20px', fontWeight: 700 }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Map progress data - handle both day-based and section-based progress
  const mappedProgress = (sectionProgress || []).map((p: any) => {
    // If progress uses 'day', map it to section
    const section = p.section || p.day || 1;
    return { ...p, section };
  }).filter((p: any) => p.section <= 4); // Only show sections 1-4

  const completedSections = mappedProgress.filter((p: any) => p.status === 'COMPLETED').length;
  const inProgressSections = mappedProgress.filter((p: any) => p.status === 'IN_PROGRESS').length;
  const totalSections = 4;
  const remainingSections = totalSections - completedSections - inProgressSections;
  const currentSectionNum = mappedProgress.find((p: any) => p.status === 'IN_PROGRESS')?.section || currentSection;
  const isAdmin = user?.roles?.includes('ADMIN');
  const isMentor = user?.roles?.includes('MENTOR');

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
          }}>ONBOARDING</div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button style={{
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
            >Dashboard</button>
            <button style={{
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
            >Progress</button>
            <button 
              onClick={logout}
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
            >Logout</button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '25px',
          marginBottom: '40px'
        }}>
          {[
            { number: completedSections, label: 'Sections Completed' },
            { number: inProgressSections, label: 'In Progress' },
            { number: remainingSections, label: 'Sections Remaining' },
            { number: `${overallProgress}%`, label: 'Overall Progress' }
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '35px',
                borderRadius: '25px',
                textAlign: 'center',
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.4s',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-15px) rotate(2deg)';
                e.currentTarget.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) rotate(0deg)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.2)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '5px',
                background: 'linear-gradient(90deg, #ff006e, #8338ec, #3a86ff)'
              }}></div>
              <div style={{
                fontSize: '56px',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #ff006e, #8338ec, #3a86ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '10px'
              }}>{stat.number}</div>
              <div style={{
                color: '#333',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '30px'
        }}>
          {/* Welcome Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '50px',
            borderRadius: '30px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 900,
              marginBottom: '25px',
              background: 'linear-gradient(135deg, #ff006e, #8338ec, #3a86ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>Welcome Back!</h1>
            <p style={{
              color: '#333',
              fontSize: '20px',
              marginBottom: '30px',
              lineHeight: 1.8,
              fontWeight: 500
            }}>
              Continue your learning journey at your own pace. Complete sections when you're ready and take quizzes to test your knowledge.
            </p>
            {isAdmin && (
              <button
                onClick={() => router.push('/admin')}
                style={{
                  padding: '15px 35px',
                  background: 'linear-gradient(135deg, #ff006e, #8338ec)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '18px',
                  cursor: 'pointer',
                  borderRadius: '50px',
                  marginRight: '15px',
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
              >Admin Panel</button>
            )}
            {isMentor && (
              <button
                onClick={() => router.push('/mentor')}
                style={{
                  padding: '15px 35px',
                  background: 'linear-gradient(135deg, #ff006e, #8338ec)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '18px',
                  cursor: 'pointer',
                  borderRadius: '50px',
                  marginRight: '15px',
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
              >Mentor Dashboard</button>
            )}
            <button 
              onClick={() => router.push(`/section/${currentSectionNum}`)}
              style={{
                padding: '18px 45px',
                background: 'linear-gradient(135deg, #ff006e, #8338ec)',
                border: 'none',
                color: '#fff',
                fontWeight: 900,
                fontSize: '18px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                borderRadius: '50px',
                boxShadow: '0 10px 30px rgba(131, 56, 236, 0.5)',
                transition: 'all 0.3s',
                letterSpacing: '1px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(131, 56, 236, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(131, 56, 236, 0.5)';
              }}
            >Continue Learning →</button>
            
            <h2 style={{
              color: '#8338ec',
              marginTop: '50px',
              marginBottom: '25px',
              fontSize: '28px',
              fontWeight: 900,
              textTransform: 'uppercase'
            }}>Sections</h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginTop: '30px'
            }}>
              {sections.map((section, idx) => {
                const sectionNum = idx + 1;
                // Find progress by day (since we're using day-based progress)
                const progress = mappedProgress.find((p: any) => {
                  return (p.section === sectionNum) || (p.day === sectionNum);
                });
                const status = progress?.status || 'NOT_STARTED';
                const isCurrentSection = sectionNum === currentSectionNum;
                const quizScore = progress?.quizScore;
                const passedQuiz = progress?.passedQuiz || (quizScore !== undefined && quizScore >= 80);
                
                let bgGradient = 'linear-gradient(135deg, #e5e7eb, #d1d5db)';
                let borderColor = '#e5e7eb';
                
                if (status === 'COMPLETED') {
                  bgGradient = 'linear-gradient(135deg, #3a86ff, #8338ec)';
                  borderColor = '#3a86ff';
                } else if (status === 'IN_PROGRESS' || isCurrentSection) {
                  bgGradient = 'linear-gradient(135deg, #ff006e, #8338ec)';
                  borderColor = '#ff006e';
                }

                return (
                  <button
                    key={section.id}
                    onClick={() => router.push(`/section/${sectionNum}`)}
                    style={{
                      background: bgGradient,
                      border: `3px solid ${borderColor}`,
                      color: '#fff',
                      padding: '25px 30px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.4s',
                      textAlign: 'left',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                      transform: isCurrentSection ? 'scale(1.02)' : 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(10px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = isCurrentSection ? 'translateX(0) scale(1.02)' : 'translateX(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: 900,
                        textTransform: 'uppercase'
                      }}>Section {sectionNum}: {section.title}</div>
                      {status === 'COMPLETED' && (
                        <div style={{
                          fontSize: '24px'
                        }}>✓</div>
                      )}
                      {status === 'IN_PROGRESS' && (
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 700
                        }}>→</div>
                      )}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      opacity: 0.9,
                      marginBottom: '8px'
                    }}>{section.description}</div>
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.8,
                      marginBottom: '5px'
                    }}>Estimated: {section.estimatedDuration} {section.hasQuiz && '• Includes Quiz'}</div>
                    {status === 'COMPLETED' && progress?.quizScore !== undefined && progress?.quizScore >= 80 && (
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#10b981',
                        marginTop: '8px',
                        padding: '5px 10px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '10px',
                        display: 'inline-block'
                      }}>
                        ✓ Quiz Passed: {progress.quizScore}%
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Quick Stats Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '50px',
            borderRadius: '30px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{
              color: '#ff006e',
              marginBottom: '25px',
              fontSize: '28px',
              fontWeight: 900,
              textTransform: 'uppercase'
            }}>Quick Stats</h2>
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                color: '#333',
                marginBottom: '15px',
                fontWeight: 600,
                fontSize: '16px'
              }}>Activities Completed</div>
              <div style={{
                background: '#f0f0f0',
                height: '35px',
                borderRadius: '50px',
                overflow: 'hidden',
                boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #ff006e, #8338ec)',
                  height: '100%',
                  width: `${overallProgress}%`,
                  borderRadius: '50px',
                  transition: 'width 0.3s'
                }}></div>
              </div>
            </div>
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                color: '#333',
                marginBottom: '15px',
                fontWeight: 600,
                fontSize: '16px'
              }}>Quizzes Passed</div>
              <div style={{
                background: '#f0f0f0',
                height: '35px',
                borderRadius: '50px',
                overflow: 'hidden',
                boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #8338ec, #3a86ff)',
                  height: '100%',
                  width: `${(completedSections / totalSections) * 100}%`,
                  borderRadius: '50px',
                  transition: 'width 0.3s'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
