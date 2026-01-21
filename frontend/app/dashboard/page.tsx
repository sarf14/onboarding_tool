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
      // If user is already loaded, show content immediately and fetch data in background
      if (user) {
        setIsLoading(false);
        // Fetch data in background without blocking UI
        Promise.all([
          fetchSections(),
          fetchProgress()
        ]).catch(() => {}); // Silently handle errors
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch user and data in parallel for faster loading
        await Promise.all([
          fetchUser().catch((fetchError: any) => {
            // Only redirect if token is invalid
            if (fetchError?.response?.status === 401) {
              router.push('/login');
              throw fetchError;
            }
          }),
          fetchSections(),
          fetchProgress()
        ]);
      } catch (error) {
        // Silently handle - already redirected if needed
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboard();
  }, [token]); // Only depend on token - user will be set by login or fetchUser

  const fetchSections = async () => {
    try {
      const response = await api.get('/content/sections');
      setSections(response.data.sections || []);
    } catch (error: any) {
      // Silently handle errors - sections will remain empty
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch sections:', error);
      }
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await api.get('/progress/me');
      setSectionProgress(response.data.progress || []);
      setOverallProgress(response.data.overallProgress || 0);
      setCurrentSection(response.data.currentSection || 1);
    } catch (error: any) {
      // Silently handle errors - progress will remain empty
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch progress:', error);
      }
    }
  };

  // Show loading only if we're actually loading and don't have user yet
  if (isLoading && !user) {
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
          }}>Loading your dashboard...</p>
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
      background: '#001e49',
      fontFamily: "'Inter', sans-serif",
      color: '#efefef',
      position: 'relative',
      zIndex: 1
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
                // Fallback to text if image fails to load
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
            <div style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#efefef',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              fontFamily: "'Orbitron', sans-serif",
              opacity: 0.9
            }}>ONBOARDING</div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              onClick={() => router.push('/h2h')}
              style={{
                padding: '14px 32px',
                background: '#163791',
                border: '2px solid #001a62',
                color: '#efefef',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: '0',
                transition: 'all 0.3s',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontSize: '13px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#001a62';
                e.currentTarget.style.borderColor = '#163791';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#163791';
                e.currentTarget.style.borderColor = '#001a62';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >H2H Tool</button>
            <button 
              onClick={logout}
              style={{
                padding: '14px 32px',
                background: '#001a62',
                border: '2px solid #163791',
                color: '#efefef',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: '0',
                transition: 'all 0.3s',
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontSize: '13px'
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
                background: '#141943',
                padding: '35px',
                borderRadius: '0',
                textAlign: 'center',
                boxShadow: '0 5px 25px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.4s',
                position: 'relative',
                overflow: 'hidden',
                border: '3px solid #163791',
                borderTop: '5px solid #163791',
                clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 10px 35px rgba(0, 0, 0, 0.5)';
                e.currentTarget.style.borderColor = '#001a62';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 25px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = '#163791';
              }}
            >
              {/* Angular corner accent */}
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
              
              {/* Glowing top border */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '5px',
                background: '#163791'
              }}></div>
              
              <div style={{
                fontSize: '64px',
                fontWeight: 900,
                fontFamily: "'Orbitron', sans-serif",
                color: '#efefef',
                marginBottom: '10px',
                letterSpacing: '2px'
              }}>{stat.number}</div>
              <div style={{
                color: '#efefef',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontFamily: "'Orbitron', sans-serif",
                opacity: 0.8
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
            background: '#141943',
            padding: '50px',
            borderRadius: '0',
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
            
            <h1 style={{
              fontSize: '48px',
              fontWeight: 900,
              fontFamily: "'Orbitron', sans-serif",
              marginBottom: '25px',
              color: '#efefef',
              textTransform: 'uppercase',
              letterSpacing: '4px'
            }}>Welcome Back!</h1>
            <p style={{
              color: '#efefef',
              fontSize: '18px',
              marginBottom: '30px',
              lineHeight: 1.8,
              fontWeight: 400,
              opacity: 0.9
            }}>
              Continue your learning journey at your own pace. Complete sections when you're ready and take quizzes to test your knowledge.
            </p>
            {isAdmin && (
              <button
                onClick={() => router.push('/admin')}
                style={{
                  padding: '14px 32px',
                  background: '#163791',
                  border: '2px solid #001a62',
                  color: '#efefef',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  borderRadius: '0',
                  marginRight: '15px',
                  transition: 'all 0.3s',
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#001a62';
                  e.currentTarget.style.borderColor = '#163791';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#163791';
                  e.currentTarget.style.borderColor = '#001a62';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >Admin Panel</button>
            )}
            {isMentor && (
              <button
                onClick={() => router.push('/mentor')}
                style={{
                  padding: '14px 32px',
                  background: '#163791',
                  border: '2px solid #001a62',
                  color: '#efefef',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  borderRadius: '0',
                  marginRight: '15px',
                  transition: 'all 0.3s',
                  clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#001a62';
                  e.currentTarget.style.borderColor = '#163791';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#163791';
                  e.currentTarget.style.borderColor = '#001a62';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >Mentor Dashboard</button>
            )}
              <button 
              onClick={() => router.push(`/section/${currentSectionNum}`)}
              style={{
                padding: '18px 45px',
                background: '#163791',
                border: '2px solid #001a62',
                color: '#efefef',
                fontWeight: 900,
                fontSize: '16px',
                fontFamily: "'Orbitron', sans-serif",
                textTransform: 'uppercase',
                cursor: 'pointer',
                borderRadius: '0',
                transition: 'all 0.3s',
                letterSpacing: '2px',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#001a62';
                e.currentTarget.style.borderColor = '#163791';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#163791';
                e.currentTarget.style.borderColor = '#001a62';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >Continue Learning →</button>
            
            <h2 style={{
              color: '#efefef',
              marginTop: '50px',
              marginBottom: '25px',
              fontSize: '32px',
              fontWeight: 900,
              fontFamily: "'Orbitron', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '4px',
              textShadow: '0 0 20px rgba(22, 55, 145, 0.8)'
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
                
                let bgColor = '#141943';
                let borderColor = '#163791';
                let accentColor = '#163791';
                let textColor = '#efefef';
                
                if (status === 'COMPLETED') {
                  bgColor = '#001e49';
                  borderColor = '#001a62';
                  accentColor = '#001a62';
                  textColor = '#efefef';
                } else if (status === 'IN_PROGRESS' || isCurrentSection) {
                  bgColor = '#141943';
                  borderColor = '#163791';
                  accentColor = '#163791';
                  textColor = '#efefef';
                }

                return (
                  <button
                    key={section.id}
                    onClick={() => router.push(`/section/${sectionNum}`)}
                    style={{
                      background: bgColor,
                      border: `3px solid ${borderColor}`,
                      borderLeft: `8px solid ${borderColor}`,
                      color: textColor,
                      padding: '25px 30px',
                      borderRadius: '0',
                      cursor: 'pointer',
                      transition: 'all 0.4s',
                      textAlign: 'left',
                      boxShadow: isCurrentSection 
                        ? '0 8px 30px rgba(22, 55, 145, 0.25)' 
                        : '0 5px 20px rgba(22, 55, 145, 0.12)',
                      position: 'relative',
                      clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))',
                      transform: isCurrentSection ? 'scale(1.01)' : 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(8px) scale(1.01)';
                      e.currentTarget.style.boxShadow = '0 10px 35px rgba(22, 55, 145, 0.3)';
                      e.currentTarget.style.borderColor = accentColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = isCurrentSection ? 'translateX(0) scale(1.01)' : 'translateX(0) scale(1)';
                      e.currentTarget.style.boxShadow = isCurrentSection 
                        ? '0 8px 30px rgba(22, 55, 145, 0.25)' 
                        : '0 5px 20px rgba(22, 55, 145, 0.12)';
                      e.currentTarget.style.borderColor = borderColor;
                    }}
                  >
                    {/* Angular corner accents */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '0',
                      height: '0',
                      borderLeft: '15px solid transparent',
                      borderTop: `15px solid ${accentColor}`
                    }}></div>
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '0',
                      height: '0',
                      borderRight: '15px solid transparent',
                      borderBottom: `15px solid ${accentColor}`
                    }}></div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: 900,
                        fontFamily: "'Orbitron', sans-serif",
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        color: textColor
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
                      opacity: 0.85,
                      marginBottom: '8px',
                      color: '#efefef'
                    }}>{section.description}</div>
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.7,
                      marginBottom: '5px',
                      color: '#efefef',
                      fontFamily: "'Orbitron', sans-serif",
                      letterSpacing: '1px'
                    }}>Estimated: {section.estimatedDuration} {section.hasQuiz && '• Includes Quiz'}</div>
                    {status === 'COMPLETED' && progress?.quizScore !== undefined && progress?.quizScore >= 80 && (
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: textColor,
                        marginTop: '8px',
                        padding: '6px 12px',
                        background: status === 'COMPLETED' ? '#001e49' : '#efefef',
                        border: `2px solid ${accentColor}`,
                        borderRadius: '0',
                        display: 'inline-block',
                        fontFamily: "'Orbitron', sans-serif",
                        letterSpacing: '1px'
                      }}>
                        ✓ Quiz Passed: {progress.quizScore}%
                      </div>
                    )}
                  </button>
                );
              })}
              
              {/* Final Quiz Card - Show when all 4 sections are completed */}
              {completedSections === 4 && (
                <button
                  onClick={() => router.push('/section/final/quiz')}
                  style={{
                    background: '#141943',
                    border: '3px solid #163791',
                    borderLeft: '8px solid #163791',
                    color: '#efefef',
                    padding: '30px',
                    borderRadius: '0',
                    cursor: 'pointer',
                    transition: 'all 0.4s',
                    textAlign: 'left',
                    boxShadow: '0 10px 40px rgba(22, 55, 145, 0.3)',
                    marginTop: '20px',
                    width: '100%',
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
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(22, 55, 145, 0.3)';
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
                    borderTop: '20px solid #163791'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '0',
                    height: '0',
                    borderRight: '20px solid transparent',
                    borderBottom: '20px solid #163791'
                  }}></div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      fontSize: '26px',
                      fontWeight: 900,
                      fontFamily: "'Orbitron', sans-serif",
                      textTransform: 'uppercase',
                      letterSpacing: '3px',
                      color: '#efefef'
                    }}>🎯 Final Comprehensive Assessment</div>
                    <div style={{
                      fontSize: '32px',
                      color: '#efefef'
                    }}>→</div>
                  </div>
                  <div style={{
                    fontSize: '16px',
                    marginBottom: '10px',
                    lineHeight: 1.6,
                    color: '#efefef'
                  }}>
                    Test your knowledge across all sections with 21 comprehensive questions covering error categorization, task status, trajectory status, and H2H evaluation.
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    marginTop: '15px',
                    padding: '10px 15px',
                    background: '#001e49',
                    border: '2px solid #163791',
                    borderRadius: '0',
                    display: 'inline-block',
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: '1px',
                    color: '#efefef'
                  }}>
                    ✓ All Sections Completed • Ready to Take Final Quiz
                  </div>
                </button>
              )}
            </div>
          </div>
          
          {/* Quick Stats Card */}
          <div style={{
            background: '#141943',
            padding: '50px',
            borderRadius: '0',
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
            
            <h2 style={{
              color: '#efefef',
              marginBottom: '25px',
              fontSize: '32px',
              fontWeight: 900,
              fontFamily: "'Orbitron', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '4px'
            }}>Quick Stats</h2>
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                color: '#efefef',
                marginBottom: '15px',
                fontWeight: 600,
                fontSize: '14px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase',
                opacity: 0.9
              }}>Activities Completed</div>
              <div style={{
                background: '#141943',
                height: '35px',
                borderRadius: '0',
                overflow: 'hidden',
                border: '2px solid #163791',
                position: 'relative'
              }}>
                <div style={{
                  background: '#163791',
                  height: '100%',
                  width: `${overallProgress}%`,
                  transition: 'width 0.3s',
                  position: 'relative'
                }}></div>
              </div>
            </div>
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                color: '#efefef',
                marginBottom: '15px',
                fontWeight: 600,
                fontSize: '14px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase',
                opacity: 0.9
              }}>Quizzes Passed</div>
              <div style={{
                background: '#141943',
                height: '35px',
                borderRadius: '0',
                overflow: 'hidden',
                border: '2px solid #163791',
                position: 'relative'
              }}>
                <div style={{
                  background: '#163791',
                  height: '100%',
                  width: `${(completedSections / totalSections) * 100}%`,
                  transition: 'width 0.3s',
                  position: 'relative'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
