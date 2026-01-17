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

export default function MentorDashboard() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    if (!user?.roles?.includes('MENTOR') && !user?.roles?.includes('ADMIN')) {
      router.push('/dashboard');
      return;
    }
    fetchMentees();
  }, [token, user, router]);

  const fetchMentees = async () => {
    try {
      const response = await api.get('/mentor/mentees');
      console.log('Mentor mentees response:', response.data);
      setMentees(response.data.mentees || []);
    } catch (error: any) {
      console.error('Failed to fetch mentees:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to load mentees: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMenteeDetails = async (menteeId: string) => {
    try {
      const response = await api.get(`/mentor/mentees/${menteeId}`);
      const mentee = mentees.find(m => m.id === menteeId);
      if (mentee) {
        setSelectedMentee({ ...mentee, ...response.data.mentee });
      }
    } catch (error) {
      console.error('Failed to fetch mentee details:', error);
    }
  };

  if (isLoading) {
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
          <p style={{ color: '#ffffff', fontSize: '20px', fontWeight: 700 }}>Loading mentor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
      fontFamily: "'Inter', sans-serif",
      padding: '40px'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
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
          <h1 style={{
            fontSize: '36px',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #ff006e, #8338ec, #3a86ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '3px'
          }}>Mentor Dashboard</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
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
            >Dashboard</button>
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
            >Logout</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedMentee ? '1fr 1fr' : '1fr', gap: '30px' }}>
          {/* Mentees List */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '30px',
            borderRadius: '25px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#333',
              marginBottom: '25px',
              textTransform: 'uppercase'
            }}>My Mentees ({mentees.length})</h2>
            {mentees.length === 0 ? (
              <p style={{ color: '#666', fontSize: '16px', textAlign: 'center', padding: '40px' }}>
                No mentees assigned yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {mentees.map((mentee) => (
                  <div
                    key={mentee.id}
                    onClick={() => {
                      setSelectedMentee(mentee);
                      fetchMenteeDetails(mentee.id);
                    }}
                    style={{
                      padding: '20px',
                      background: selectedMentee?.id === mentee.id ? '#f3f4f6' : '#fff',
                      border: `2px solid ${selectedMentee?.id === mentee.id ? '#8338ec' : '#e5e7eb'}`,
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedMentee?.id !== mentee.id) {
                        e.currentTarget.style.borderColor = '#8338ec';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedMentee?.id !== mentee.id) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#333' }}>{mentee.name}</h3>
                      <span style={{
                        padding: '5px 12px',
                        background: mentee.progress === 100 ? '#10b981' : mentee.progress > 0 ? '#3a86ff' : '#e5e7eb',
                        color: mentee.progress > 0 ? '#fff' : '#666',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>{mentee.progress}%</span>
                    </div>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>{mentee.email}</p>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#666' }}>
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
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '30px',
              borderRadius: '25px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#333',
                marginBottom: '25px',
                textTransform: 'uppercase'
              }}>{selectedMentee.name}'s Progress</h2>

              <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 600, color: '#333' }}>Overall Progress</span>
                  <span style={{ fontWeight: 700, color: '#8338ec' }}>{selectedMentee.progress}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '20px',
                  background: '#e5e7eb',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${selectedMentee.progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #ff006e, #8338ec)',
                    transition: 'width 0.3s'
                  }}></div>
                </div>
              </div>

              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#333',
                marginBottom: '15px',
                marginTop: '30px'
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
                        background: status === 'COMPLETED' ? '#f0fdf4' : status === 'IN_PROGRESS' ? '#fef3c7' : '#f9fafb',
                        border: `2px solid ${status === 'COMPLETED' ? '#10b981' : status === 'IN_PROGRESS' ? '#f59e0b' : '#e5e7eb'}`,
                        borderRadius: '15px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#333' }}>Section {sectionNum}</span>
                        <span style={{
                          padding: '4px 10px',
                          background: status === 'COMPLETED' ? '#10b981' : status === 'IN_PROGRESS' ? '#f59e0b' : '#9ca3af',
                          color: '#fff',
                          borderRadius: '15px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>{status.replace('_', ' ')}</span>
                      </div>
                      {quizScore !== undefined && (
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                          Quiz Score: {quizScore}% {quizScore >= 80 && (
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
                color: '#333',
                marginBottom: '15px',
                marginTop: '30px'
              }}>Recent Quizzes</h3>
              {selectedMentee.quizzes && selectedMentee.quizzes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedMentee.quizzes.slice(0, 5).map((quiz: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#333' }}>
                          {quiz.quizType === 'FINAL_ASSESSMENT' ? 'Final Quiz' : `Section ${quiz.section || quiz.day} Quiz`}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {new Date(quiz.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          background: quiz.percentage >= 80 ? '#10b981' : '#ef4444',
                          color: '#fff',
                          borderRadius: '15px',
                          fontSize: '14px',
                          fontWeight: 600
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
                                  background: rgba(0, 0, 0, 0.7);
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                  z-index: 1000;
                                  padding: 20px;
                                `;
                                modal.innerHTML = `
                                  <div style="background: white; padding: 30px; border-radius: 20px; max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative;">
                                    <button onclick="this.closest('div').remove()" style="position: absolute; top: 15px; right: 15px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px;">×</button>
                                    <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 20px; color: #333;">Quiz Details</h2>
                                    <div style="margin-bottom: 20px;">
                                      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <span style="font-weight: 600;">Score:</span>
                                        <span style="font-weight: 700; color: ${quizDetails.percentage >= 80 ? '#10b981' : '#ef4444'};">${quizDetails.score}/${quizDetails.maxScore} (${quizDetails.percentage}%)</span>
                                      </div>
                                      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <span style="font-weight: 600;">Attempts:</span>
                                        <span>${quizDetails.attempts}</span>
                                      </div>
                                      <div style="display: flex; justify-content: space-between;">
                                        <span style="font-weight: 600;">Completed:</span>
                                        <span>${new Date(quizDetails.completedAt).toLocaleString()}</span>
                                      </div>
                                    </div>
                                    <h3 style="font-size: 18px; font-weight: 700; margin-top: 30px; margin-bottom: 15px;">Questions & Answers</h3>
                                    <div style="display: flex; flex-direction: column; gap: 15px;">
                                      ${JSON.parse(JSON.stringify(quizDetails.questions || [])).map((q: any, qIdx: number) => {
                                        const userAnswer = JSON.parse(JSON.stringify(quizDetails.answers || []))[qIdx];
                                        const isCorrect = userAnswer === q.correctAnswer;
                                        return `
                                          <div style="padding: 15px; background: ${isCorrect ? '#f0fdf4' : '#fef2f2'}; border: 2px solid ${isCorrect ? '#10b981' : '#ef4444'}; border-radius: 10px;">
                                            <div style="font-weight: 600; margin-bottom: 10px;">Q${qIdx + 1}: ${q.question}</div>
                                            <div style="margin-bottom: 8px;">
                                              <strong>Options:</strong>
                                              ${q.options.map((opt: string, optIdx: number) => `
                                                <div style="margin-left: 20px; color: ${optIdx === q.correctAnswer ? '#10b981' : optIdx === userAnswer ? '#ef4444' : '#666'};">
                                                  ${optIdx === q.correctAnswer ? '✓' : optIdx === userAnswer ? '✗' : '○'} ${opt}
                                                  ${optIdx === q.correctAnswer ? ' (Correct)' : optIdx === userAnswer ? ' (Your Answer)' : ''}
                                                </div>
                                              `).join('')}
                                            </div>
                                            <div style="font-weight: 600; color: ${isCorrect ? '#10b981' : '#ef4444'};">
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
                              background: '#8338ec',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 600
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
                <p style={{ color: '#666', fontSize: '14px' }}>No quizzes completed yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
