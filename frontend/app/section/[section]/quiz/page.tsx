'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const section = params.section as string;
  const { token } = useAuthStore();
  const [quizData, setQuizData] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchQuiz();
  }, [section, token, router]);

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/content/quiz/${section}`);
      setQuizData(response.data);
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    if (showResults) return;
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleSubmit = async () => {
    if (!quizData?.quiz?.questions) return;
    
    let correct = 0;
    const questions = quizData.quiz.questions;
    const answerArray: number[] = [];
    
    questions.forEach((q: any) => {
      const userAnswer = answers[q.id];
      answerArray.push(userAnswer !== undefined ? userAnswer : -1);
      if (userAnswer === q.correctAnswer) {
        correct++;
      }
    });
    
    const totalQuestions = questions.length;
    const percentage = Math.round((correct / totalQuestions) * 100);
    const passingScore = 80; // 80% required to pass
    
    setScore(correct);
    setShowResults(true);
    
    // Submit quiz to backend
    try {
      const quizType = section === 'final' ? 'FINAL_ASSESSMENT' : 'SECTION_QUIZ';
      await api.post('/quizzes/submit', {
        section: section === 'final' ? null : parseInt(section),
        quizType,
        questions,
        answers: answerArray,
      });
      
      // Progress is already updated by the quiz submission endpoint
      // Quiz status is now fetched from backend, not localStorage
      // This ensures each user sees only their own quiz attempts
      // Note: The section page will fetch updated quiz status when user navigates back
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      // Still show results even if submission fails
    }
  };

  const handleNextSection = () => {
    const sectionNum = parseInt(section);
    const totalQuestions = quizData?.quiz?.questions?.length || 0;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passingScore = 80; // 80% required to pass
    
    // Check if quiz is passed
    if (percentage < passingScore) {
      alert(`You need at least ${passingScore}% to proceed. Your score: ${percentage}%. Please review the section and try again.`);
      return;
    }
    
    const totalSections = 4;
    if (section === 'final') {
      router.push('/dashboard');
    } else if (sectionNum < totalSections) {
      router.push(`/section/${sectionNum + 1}`);
    } else if (sectionNum === totalSections) {
      // After section 4, go to dashboard
      router.push('/dashboard');
    } else {
      // After section 3, redirect to final quiz
      router.push('/section/final/quiz');
    }
  };

  if (isLoading || !quizData) {
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
          <p style={{ color: '#ffffff', fontSize: '20px', fontWeight: 700 }}>Loading quiz...</p>
        </div>
      </div>
    );
  }

  const totalQuestions = quizData.quiz?.questions?.length || 0;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
      fontFamily: "'Inter', sans-serif",
      color: '#ffffff',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '25px',
          padding: '30px 40px',
          marginBottom: '30px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #ff006e, #8338ec, #3a86ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                marginBottom: '10px'
              }}>{section === 'final' ? 'Final Comprehensive Quiz' : `Section ${section} Quiz`}</h1>
              <p style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#333',
                textTransform: 'uppercase'
              }}>{quizData.quiz?.title || 'Quiz'}</p>
            </div>
            <button
              onClick={() => {
                if (section === 'final') {
                  router.push('/dashboard');
                } else {
                  router.push(`/section/${section}`);
                }
              }}
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
              ← Back to Section
            </button>
          </div>
        </div>

        {/* Quiz Content */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '30px',
          padding: '50px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          {!showResults ? (
            <>
              {quizData.quiz?.questions?.map((question: any, idx: number) => (
                <div
                  key={question.id}
                  style={{
                    marginBottom: '40px',
                    padding: '30px',
                    background: '#ffffff',
                    borderRadius: '25px',
                    border: '2px solid #e5e7eb',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 900,
                    color: '#333',
                    marginBottom: '20px',
                    textTransform: 'uppercase'
                  }}>
                    Question {idx + 1} of {totalQuestions}
                  </div>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#333',
                    marginBottom: '25px',
                    lineHeight: 1.4
                  }}>{question.question}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {question.options.map((option: string, optIdx: number) => (
                      <button
                        key={optIdx}
                        onClick={() => handleAnswerSelect(question.id, optIdx)}
                        style={{
                          padding: '20px 25px',
                          background: answers[question.id] === optIdx
                            ? 'linear-gradient(135deg, #ff006e, #8338ec)'
                            : '#f9fafb',
                          color: answers[question.id] === optIdx ? '#fff' : '#333',
                          border: `2px solid ${answers[question.id] === optIdx ? '#8338ec' : '#e5e7eb'}`,
                          borderRadius: '20px',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          textAlign: 'left',
                          fontWeight: answers[question.id] === optIdx ? 700 : 500,
                          fontSize: '16px',
                          boxShadow: answers[question.id] === optIdx
                            ? '0 10px 25px rgba(131, 56, 236, 0.3)'
                            : '0 5px 15px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                          if (answers[question.id] !== optIdx) {
                            e.currentTarget.style.background = '#f3f4f6';
                            e.currentTarget.style.borderColor = '#8338ec';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (answers[question.id] !== optIdx) {
                            e.currentTarget.style.background = '#f9fafb';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                          }
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '40px',
                paddingTop: '30px',
                borderTop: '2px solid #e5e7eb'
              }}>
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < totalQuestions}
                  style={{
                    padding: '18px 45px',
                    background: Object.keys(answers).length < totalQuestions
                      ? '#e5e7eb'
                      : 'linear-gradient(135deg, #ff006e, #8338ec)',
                    border: 'none',
                    color: Object.keys(answers).length < totalQuestions ? '#999' : '#fff',
                    fontWeight: 900,
                    fontSize: '18px',
                    textTransform: 'uppercase',
                    cursor: Object.keys(answers).length < totalQuestions ? 'not-allowed' : 'pointer',
                    borderRadius: '50px',
                    boxShadow: Object.keys(answers).length < totalQuestions
                      ? 'none'
                      : '0 10px 30px rgba(131, 56, 236, 0.5)',
                    transition: 'all 0.3s',
                    letterSpacing: '1px',
                    opacity: Object.keys(answers).length < totalQuestions ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (Object.keys(answers).length >= totalQuestions) {
                      e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(131, 56, 236, 0.7)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = Object.keys(answers).length < totalQuestions
                      ? 'none'
                      : '0 10px 30px rgba(131, 56, 236, 0.5)';
                  }}
                >
                  Submit Quiz
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Results */}
              <div style={{
                textAlign: 'center',
                marginBottom: '40px',
                padding: '40px',
                background: 'linear-gradient(135deg, #ff006e, #8338ec)',
                borderRadius: '25px',
                color: '#fff'
              }}>
                <div style={{
                  fontSize: '72px',
                  fontWeight: 900,
                  marginBottom: '20px'
                }}>{percentage}%</div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  marginBottom: '10px'
                }}>You scored {score} out of {totalQuestions}</div>
                <div style={{
                  fontSize: '18px',
                  opacity: 0.9,
                  marginBottom: percentage >= 80 ? '0' : '20px'
                }}>
                  {percentage >= 80 ? 'Excellent! You have a strong understanding of this section. You can now proceed to the next section.' :
                   percentage >= 60 ? 'Good effort! However, you need at least 80% to proceed. Review the incorrect answers and try again.' :
                   'Keep learning! You need at least 80% to proceed. Review the section content and try again.'}
                </div>
                {percentage < 80 && (
                  <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '15px',
                    border: '2px solid #ef4444',
                    color: '#ef4444',
                    fontWeight: 700
                  }}>
                    ⚠️ Score Required: 80% | Your Score: {percentage}% | Please retake the quiz
                  </div>
                )}
              </div>

              {/* Review Answers */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#333',
                  marginBottom: '30px',
                  textTransform: 'uppercase'
                }}>Review Your Answers</h3>
                {quizData.quiz?.questions?.map((question: any, idx: number) => {
                  const userAnswer = answers[question.id];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <div
                      key={question.id}
                      style={{
                        marginBottom: '30px',
                        padding: '30px',
                        background: '#ffffff',
                        borderRadius: '25px',
                        border: `2px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        marginBottom: '20px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: isCorrect ? '#10b981' : '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 900,
                          fontSize: '20px'
                        }}>
                          {isCorrect ? '✓' : '✗'}
                        </div>
                        <h4 style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#333'
                        }}>Question {idx + 1}</h4>
                      </div>
                      <p style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#333',
                        marginBottom: '20px'
                      }}>{question.question}</p>
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#666',
                          marginBottom: '10px',
                          textTransform: 'uppercase'
                        }}>Your Answer:</div>
                        <div style={{
                          padding: '15px',
                          background: '#f9fafb',
                          borderRadius: '15px',
                          color: isCorrect ? '#10b981' : '#ef4444',
                          fontWeight: 600
                        }}>
                          {question.options[userAnswer]}
                        </div>
                      </div>
                      {!isCorrect && (
                        <div style={{ marginBottom: '15px' }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#666',
                            marginBottom: '10px',
                            textTransform: 'uppercase'
                          }}>Correct Answer:</div>
                          <div style={{
                            padding: '15px',
                            background: '#ecfdf5',
                            borderRadius: '15px',
                            color: '#10b981',
                            fontWeight: 600
                          }}>
                            {question.options[question.correctAnswer]}
                          </div>
                        </div>
                      )}
                      <div style={{
                        padding: '15px',
                        background: '#f0f9ff',
                        borderRadius: '15px',
                        borderLeft: '4px solid #3a86ff'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#666',
                          marginBottom: '5px',
                          textTransform: 'uppercase'
                        }}>Explanation:</div>
                        <div style={{
                          color: '#333',
                          fontSize: '15px',
                          lineHeight: 1.6
                        }}>{question.explanation}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '30px',
                borderTop: '2px solid #e5e7eb',
                flexWrap: 'wrap',
                gap: '20px'
              }}>
                <button
                  onClick={() => router.push(`/section/${section}`)}
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
                >
                  Review Section
                </button>

                <button
                  onClick={handleNextSection}
                  disabled={percentage < 80}
                  style={{
                    padding: '18px 45px',
                    background: percentage >= 80 ? 'linear-gradient(135deg, #10b981, #3a86ff)' : '#e5e7eb',
                    border: 'none',
                    color: percentage >= 80 ? '#fff' : '#999',
                    fontWeight: 900,
                    fontSize: '18px',
                    textTransform: 'uppercase',
                    cursor: percentage >= 80 ? 'pointer' : 'not-allowed',
                    borderRadius: '50px',
                    boxShadow: percentage >= 80 ? '0 10px 30px rgba(16, 185, 129, 0.5)' : 'none',
                    transition: 'all 0.3s',
                    letterSpacing: '1px',
                    opacity: percentage >= 80 ? 1 : 0.5
                  }}
                  onMouseEnter={(e) => {
                    if (percentage >= 80) {
                      e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.7)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = percentage >= 80 ? '0 10px 30px rgba(16, 185, 129, 0.5)' : 'none';
                  }}
                >
                  {section === 'final' ? 'Go to Dashboard →' : 
                   parseInt(section) < 4 ? 'Continue to Next Section →' : 
                   'Go to Dashboard →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
