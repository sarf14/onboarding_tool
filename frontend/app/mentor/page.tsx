'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface Mentee {
  id: string;
  email: string;
  name: string;
  currentSection: number;
  progress: number;
  completedSections: number;
  sectionProgress: any[];
  quizzes: any[];
  activitiesCompleted: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  sources?: any[];
  contextUsed?: string[];
}

export default function MentorDashboard() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    if (!user?.roles?.includes('MENTOR') && !user?.roles?.includes('ADMIN')) {
      router.push('/dashboard');
      return;
    }
    // Start loading immediately
    setIsLoading(true);
    fetchMentees();
  }, [token, user, router]);

  const fetchMentees = async () => {
    try {
      const response = await api.get('/mentor/mentees');
      setMentees(response.data.mentees || []);
    } catch (error: any) {
      console.error('Failed to load mentees:', error);
      // Don't show alert on initial load - just log error
      if (mentees.length === 0) {
        alert('Failed to load mentees: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMenteeDetails = async (menteeId: string) => {
    try {
      // Fetch mentee details and chat history in parallel for faster loading
      const [menteeResponse] = await Promise.all([
        api.get(`/mentor/mentees/${menteeId}`),
        fetchChatHistory(menteeId) // Start loading chat history immediately
      ]);
      const mentee = mentees.find(m => m.id === menteeId);
      if (mentee) {
        setSelectedMentee({ ...mentee, ...menteeResponse.data.mentee });
      }
    } catch (error) {
      // Silently handle errors
    }
  };

  const fetchChatHistory = async (menteeId: string) => {
    setIsLoadingChat(true);
    try {
      const response = await api.get(`/chat/history/${menteeId}`);
      setChatHistory(response.data.messages || []);
    } catch (error: any) {
      // If table doesn't exist, show empty array
      setChatHistory([]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  if (isLoading) {
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
          }}>Loading mentor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#001e49',
      fontFamily: "'Inter', sans-serif",
      padding: '40px',
      color: '#efefef',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
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
              fontSize: '24px',
              fontWeight: 600,
              color: '#efefef',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              fontFamily: "'Orbitron', sans-serif",
              opacity: 0.9
            }}>Mentor Dashboard</h1>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
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
                e.currentTarget.style.background = '#001a62';
                e.currentTarget.style.borderColor = '#163791';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#163791';
                e.currentTarget.style.borderColor = '#001a62';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >Dashboard</button>
            <button
              onClick={logout}
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
                e.currentTarget.style.background = '#001a62';
                e.currentTarget.style.borderColor = '#163791';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#163791';
                e.currentTarget.style.borderColor = '#001a62';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >Logout</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedMentee ? '1fr 1fr' : '1fr', gap: '30px' }}>
          {/* Mentees List */}
          <div style={{
            background: '#141943',
            padding: '30px',
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
              fontSize: '24px',
              fontWeight: 900,
              color: '#efefef',
              marginBottom: '25px',
              textTransform: 'uppercase',
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '2px'
            }}>My Mentees ({mentees.length})</h2>
            {mentees.length === 0 ? (
              <p style={{ color: '#efefef', fontSize: '16px', textAlign: 'center', padding: '40px', fontFamily: "'Inter', sans-serif", opacity: 0.8 }}>
                No mentees assigned yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {mentees.map((mentee) => (
                  <div
                    key={mentee.id}
                    onClick={() => {
                      // Only fetch if different mentee selected
                      if (selectedMentee?.id !== mentee.id) {
                        setSelectedMentee(mentee);
                        fetchMenteeDetails(mentee.id);
                      }
                    }}
                    style={{
                      padding: '20px',
                      background: selectedMentee?.id === mentee.id ? '#001e49' : '#001e49',
                      border: `2px solid ${selectedMentee?.id === mentee.id ? '#001a62' : '#163791'}`,
                      borderRadius: '0',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      position: 'relative',
                      clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedMentee?.id !== mentee.id) {
                        e.currentTarget.style.borderColor = '#001a62';
                        e.currentTarget.style.transform = 'translateX(5px)';
                        e.currentTarget.style.background = '#141943';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedMentee?.id !== mentee.id) {
                        e.currentTarget.style.borderColor = '#163791';
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.background = '#001e49';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#efefef', fontFamily: "'Inter', sans-serif" }}>{mentee.name}</h3>
                      <span style={{
                        padding: '5px 12px',
                        background: mentee.progress === 100 ? '#10b981' : mentee.progress > 0 ? '#163791' : '#141943',
                        color: '#efefef',
                        borderRadius: '0',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: `2px solid ${mentee.progress === 100 ? '#059669' : mentee.progress > 0 ? '#001a62' : '#163791'}`,
                        fontFamily: "'Orbitron', sans-serif",
                        letterSpacing: '1px',
                        clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
                      }}>{mentee.progress}%</span>
                    </div>
                    <p style={{ color: '#efefef', fontSize: '14px', marginBottom: '10px', fontFamily: "'Inter', sans-serif", opacity: 0.8 }}>{mentee.email}</p>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#efefef', fontFamily: "'Inter', sans-serif", opacity: 0.9 }}>
                      <span>Section {mentee.currentSection}/4</span>
                      <span>•</span>
                      <span>{mentee.completedSections} completed</span>
                      <span>•</span>
                      <span>{mentee.activitiesCompleted} activities</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mentee Details */}
          {selectedMentee && (
            <div style={{
              background: '#141943',
              padding: '30px',
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
                fontSize: '24px',
                fontWeight: 900,
                color: '#efefef',
                marginBottom: '25px',
                textTransform: 'uppercase',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '2px'
              }}>{selectedMentee.name}'s Progress</h2>

              <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 600, color: '#efefef', fontFamily: "'Inter', sans-serif" }}>Overall Progress</span>
                  <span style={{ fontWeight: 700, color: '#163791', fontFamily: "'Orbitron', sans-serif", letterSpacing: '1px' }}>{selectedMentee.progress}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '20px',
                  background: '#001e49',
                  borderRadius: '0',
                  overflow: 'hidden',
                  border: '2px solid #163791',
                  clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
                }}>
                  <div style={{
                    width: `${selectedMentee.progress}%`,
                    height: '100%',
                    background: '#163791',
                    transition: 'width 0.3s'
                  }}></div>
                </div>
              </div>

              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#efefef',
                marginBottom: '15px',
                marginTop: '30px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>Section Progress</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {[1, 2, 3, 4].map((sectionNum) => {
                  const sectionProgress = selectedMentee.sectionProgress?.find((p: any) => p.section === sectionNum);
                  const status = sectionProgress?.status || 'NOT_STARTED';
                  const quizScore = sectionProgress?.quizScore;
                  
                  return (
                    <div
                      key={sectionNum}
                      style={{
                        padding: '15px',
                        background: status === 'COMPLETED' ? '#001e49' : status === 'IN_PROGRESS' ? '#001e49' : '#001e49',
                        border: `2px solid ${status === 'COMPLETED' ? '#10b981' : status === 'IN_PROGRESS' ? '#163791' : '#163791'}`,
                        borderRadius: '0',
                        position: 'relative',
                        clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#efefef', fontFamily: "'Inter', sans-serif" }}>Section {sectionNum}</span>
                        <span style={{
                          padding: '4px 10px',
                          background: status === 'COMPLETED' ? '#10b981' : status === 'IN_PROGRESS' ? '#163791' : '#141943',
                          color: '#efefef',
                          borderRadius: '0',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: `2px solid ${status === 'COMPLETED' ? '#059669' : status === 'IN_PROGRESS' ? '#001a62' : '#163791'}`,
                          fontFamily: "'Orbitron', sans-serif",
                          letterSpacing: '1px',
                          clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
                        }}>{status.replace('_', ' ')}</span>
                      </div>
                      {quizScore !== undefined && (
                        <div style={{ fontSize: '14px', color: '#efefef', marginTop: '5px', fontFamily: "'Inter', sans-serif", opacity: 0.9 }}>
                          Quiz Score: {quizScore}% {quizScore >= 90 && (
                            <span style={{ color: '#10b981', fontWeight: 700, marginLeft: '5px' }}>✓ Passed</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#efefef',
                marginBottom: '15px',
                marginTop: '30px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>Recent Quizzes</h3>
              {selectedMentee.quizzes && selectedMentee.quizzes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedMentee.quizzes.slice(0, 5).map((quiz: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        background: '#001e49',
                        border: '2px solid #163791',
                        borderRadius: '0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'relative',
                        clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#efefef', fontFamily: "'Inter', sans-serif" }}>
                          {quiz.quizType === 'FINAL_ASSESSMENT' ? 'Final Quiz' : `Section ${quiz.section || quiz.day} Quiz`}
                        </div>
                        <div style={{ fontSize: '12px', color: '#efefef', fontFamily: "'Inter', sans-serif", opacity: 0.8 }}>
                          {new Date(quiz.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          background: quiz.percentage >= 90 ? '#10b981' : '#ef4444',
                          color: '#efefef',
                          borderRadius: '0',
                          fontSize: '14px',
                          fontWeight: 600,
                          border: `2px solid ${quiz.percentage >= 90 ? '#059669' : '#dc2626'}`,
                          fontFamily: "'Orbitron', sans-serif",
                          letterSpacing: '1px',
                          clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
                        }}>{quiz.percentage}%</span>
                        {quiz.id && (
                          <button
                            onClick={async () => {
                              try {
                                const response = await api.get(`/mentor/mentees/${selectedMentee.id}/quizzes/${quiz.id}`);
                                const quizDetails = response.data.quiz;
                                // Show quiz details in a modal
                                const modal = document.createElement('div');
                                modal.style.cssText = `
                                  position: fixed;
                                  top: 0;
                                  left: 0;
                                  right: 0;
                                  bottom: 0;
                                  background: rgba(0, 0, 0, 0.8);
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                  z-index: 1000;
                                  padding: 20px;
                                `;
                                modal.innerHTML = `
                                  <div style="background: #141943; padding: 30px; border-radius: 0; max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative; border: 3px solid #163791; border-left: 8px solid #163791; clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));">
                                    <button onclick="this.closest('div').remove()" style="position: absolute; top: 15px; right: 15px; background: #ef4444; color: #efefef; border: 2px solid #dc2626; border-radius: 0; width: 30px; height: 30px; cursor: pointer; font-size: 18px; clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));">×</button>
                                    <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 20px; color: #efefef; font-family: 'Orbitron', sans-serif; letter-spacing: 2px; text-transform: uppercase;">Quiz Details</h2>
                                    <div style="margin-bottom: 20px;">
                                      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <span style="font-weight: 600; color: #efefef; font-family: 'Inter', sans-serif;">Score:</span>
                                        <span style="font-weight: 700; color: ${quizDetails.percentage >= 90 ? '#10b981' : '#ef4444'}; font-family: 'Orbitron', sans-serif;">${quizDetails.score}/${quizDetails.maxScore} (${quizDetails.percentage}%)</span>
                                      </div>
                                      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <span style="font-weight: 600; color: #efefef; font-family: 'Inter', sans-serif;">Attempts:</span>
                                        <span style="color: #efefef; font-family: 'Inter', sans-serif;">${quizDetails.attempts}</span>
                                      </div>
                                      <div style="display: flex; justify-content: space-between;">
                                        <span style="font-weight: 600; color: #efefef; font-family: 'Inter', sans-serif;">Completed:</span>
                                        <span style="color: #efefef; font-family: 'Inter', sans-serif;">${new Date(quizDetails.completedAt).toLocaleString()}</span>
                                      </div>
                                    </div>
                                    <h3 style="font-size: 18px; font-weight: 700; margin-top: 30px; margin-bottom: 15px; color: #efefef; font-family: 'Orbitron', sans-serif; letter-spacing: 1px; text-transform: uppercase;">Questions & Answers</h3>
                                    <div style="display: flex; flex-direction: column; gap: 15px;">
                                      ${JSON.parse(JSON.stringify(quizDetails.questions || [])).map((q: any, qIdx: number) => {
                                        const userAnswer = JSON.parse(JSON.stringify(quizDetails.answers || []))[qIdx];
                                        const isCorrect = Array.isArray(q.correctAnswer) 
                                          ? (Array.isArray(userAnswer) && q.correctAnswer.length === userAnswer.length && q.correctAnswer.every((ans: number) => userAnswer.includes(ans)))
                                          : userAnswer === q.correctAnswer;
                                        return `
                                          <div style="padding: 15px; background: ${isCorrect ? '#001e49' : '#001e49'}; border: 2px solid ${isCorrect ? '#10b981' : '#ef4444'}; border-radius: 0; clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));">
                                            <div style="font-weight: 600; margin-bottom: 10px; color: #efefef; font-family: 'Inter', sans-serif;">Q${qIdx + 1}: ${q.question}</div>
                                            <div style="margin-bottom: 8px;">
                                              <strong style="color: #efefef; font-family: 'Orbitron', sans-serif;">Options:</strong>
                                              ${q.options.map((opt: string, optIdx: number) => {
                                                const isCorrectOpt = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(optIdx) : optIdx === q.correctAnswer;
                                                const isUserOpt = Array.isArray(userAnswer) ? userAnswer.includes(optIdx) : optIdx === userAnswer;
                                                return `
                                                  <div style="margin-left: 20px; color: ${isCorrectOpt ? '#10b981' : isUserOpt ? '#ef4444' : '#efefef'}; font-family: 'Inter', sans-serif; opacity: ${isCorrectOpt || isUserOpt ? '1' : '0.8'};">
                                                    ${isCorrectOpt ? '✓' : isUserOpt ? '✗' : '○'} ${opt}
                                                    ${isCorrectOpt ? ' (Correct)' : isUserOpt ? ' (Your Answer)' : ''}
                                                  </div>
                                                `;
                                              }).join('')}
                                            </div>
                                            <div style="font-weight: 600; color: ${isCorrect ? '#10b981' : '#ef4444'}; font-family: 'Orbitron', sans-serif;">
                                              ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                            </div>
                                          </div>
                                        `;
                                      }).join('')}
                                    </div>
                                  </div>
                                `;
                                document.body.appendChild(modal);
                                modal.addEventListener('click', (e) => {
                                  if (e.target === modal) modal.remove();
                                });
                              } catch (error) {
                                console.error('Failed to fetch quiz details:', error);
                                alert('Failed to load quiz details');
                              }
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#163791',
                              color: '#efefef',
                              border: '2px solid #001a62',
                              borderRadius: '0',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 600,
                              fontFamily: "'Orbitron', sans-serif",
                              letterSpacing: '1px',
                              clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                              transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#001a62';
                              e.currentTarget.style.borderColor = '#163791';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#163791';
                              e.currentTarget.style.borderColor = '#001a62';
                            }}
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#efefef', fontSize: '14px', fontFamily: "'Inter', sans-serif", opacity: 0.8 }}>No quizzes completed yet.</p>
              )}

              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#efefef',
                marginBottom: '15px',
                marginTop: '30px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>Chat History</h3>
              {isLoadingChat ? (
                <p style={{ color: '#efefef', fontSize: '14px', fontFamily: "'Inter', sans-serif", opacity: 0.8 }}>Loading chat history...</p>
              ) : chatHistory.length === 0 ? (
                <p style={{ color: '#efefef', fontSize: '14px', fontFamily: "'Inter', sans-serif", opacity: 0.8 }}>No chat history available.</p>
              ) : (
                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '10px',
                  background: '#001e49',
                  borderRadius: '0',
                  border: '2px solid #163791',
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                }}>
                  {chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        padding: '12px 16px',
                        background: msg.role === 'user' ? '#141943' : '#001e49',
                        border: `2px solid ${msg.role === 'user' ? '#163791' : '#163791'}`,
                        borderRadius: '0',
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        position: 'relative',
                        clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
                      }}
                    >
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: msg.role === 'user' ? '#163791' : '#efefef',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        fontFamily: "'Orbitron', sans-serif",
                        letterSpacing: '1px'
                      }}>
                        {msg.role === 'user' ? 'Mentee' : 'Assistant'}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#efefef',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {msg.content}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#efefef',
                        marginTop: '6px',
                        opacity: 0.7,
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
