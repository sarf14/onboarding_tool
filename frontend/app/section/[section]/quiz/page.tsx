'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

// Helper function to shuffle array (Fisher-Yates algorithm)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

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
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null); // Time in seconds
  const [timeUp, setTimeUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Store shuffled questions with mapping: questionId -> { shuffledOptions, originalToShuffled, shuffledToOriginal }
  const [shuffledQuestions, setShuffledQuestions] = useState<{
    [key: number]: {
      shuffledOptions: string[];
      originalToShuffled: number[];
      shuffledToOriginal: number[];
    };
  }>({});

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchQuiz();
  }, [section, token, router]);

  // Timer effect - 2 minutes per question (minimum 10 minutes total, maximum 30 minutes)
  useEffect(() => {
    if (!quizData?.quiz?.questions || showResults || timeUp) return;
    
    const totalQuestions = quizData.quiz.questions.length;
    const timePerQuestion = 120; // 2 minutes per question
    const totalTime = Math.max(600, Math.min(1800, totalQuestions * timePerQuestion)); // 10-30 minutes
    
    setTimeRemaining(totalTime);
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setTimeUp(true);
          // Auto-submit when time runs out - trigger submit logic
          setTimeout(() => {
            if (!quizData?.quiz?.questions) return;
            
            let correct = 0;
            const questions = quizData.quiz.questions;
            const answerArray: number[] = [];
            
            questions.forEach((q: any) => {
              const userShuffledAnswer = answers[q.id];
              const userOriginalAnswer = userShuffledAnswer !== undefined 
                ? shuffledQuestions[q.id]?.shuffledToOriginal[userShuffledAnswer] ?? -1
                : -1;
              
              answerArray.push(userOriginalAnswer !== undefined ? userOriginalAnswer : -1);
              
              if (userOriginalAnswer === q.correctAnswer) {
                correct++;
              }
            });
            
            const totalQuestions = questions.length;
            const percentage = Math.round((correct / totalQuestions) * 100);
            
            setScore(correct);
            setShowResults(true);
            
            // Submit quiz to backend
            const quizType = section === 'final' ? 'FINAL_ASSESSMENT' : 'SECTION_QUIZ';
            api.post('/quizzes/submit', {
              section: section === 'final' ? null : parseInt(section),
              quizType,
              questions,
              answers: answerArray,
            }).catch(error => console.error('Failed to submit quiz:', error));
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quizData, showResults, timeUp, answers, shuffledQuestions, section]);

  const fetchQuiz = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      console.log('Fetching quiz from:', `${apiUrl}/content/quiz/${section}`);
      
      const response = await api.get(`/content/quiz/${section}`);
      const data = response.data;
      setQuizData(data);
      
      // Shuffle options for each question
      const shuffled: typeof shuffledQuestions = {};
      if (data?.quiz?.questions) {
        data.quiz.questions.forEach((question: any) => {
          const originalOptions = [...question.options];
          const shuffledOptions = shuffleArray(originalOptions);
          
          // Create mapping arrays
          const originalToShuffled: number[] = [];
          const shuffledToOriginal: number[] = [];
          
          originalOptions.forEach((opt: string, origIdx: number) => {
            const shuffledIdx = shuffledOptions.indexOf(opt);
            originalToShuffled[origIdx] = shuffledIdx;
            shuffledToOriginal[shuffledIdx] = origIdx;
          });
          
          shuffled[question.id] = {
            shuffledOptions,
            originalToShuffled,
            shuffledToOriginal,
          };
        });
      }
      setShuffledQuestions(shuffled);
      setError(null); // Clear any previous errors
    } catch (error: any) {
      console.error('Failed to fetch quiz:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
        },
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Set user-friendly error message
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        setError(`Unable to connect to backend API.\n\nCurrent API URL: ${apiUrl}\n\nPlease check:\n1. Backend is running and accessible\n2. NEXT_PUBLIC_API_URL is set correctly\n3. CORS is configured properly\n\nSee browser console for more details.`);
      } else if (error.response?.status === 404) {
        setError(`Quiz not found for section: ${section}`);
      } else if (error.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else {
        setError(error.response?.data?.error || error.message || 'Failed to load quiz. Please try again.');
      }
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
      const userShuffledAnswer = answers[q.id];
      // Convert shuffled answer index back to original index
      const userOriginalAnswer = userShuffledAnswer !== undefined 
        ? shuffledQuestions[q.id]?.shuffledToOriginal[userShuffledAnswer] ?? -1
        : -1;
      
      answerArray.push(userOriginalAnswer !== undefined ? userOriginalAnswer : -1);
      
      // Compare with original correctAnswer index
      if (userOriginalAnswer === q.correctAnswer) {
        correct++;
      }
    });
    
    const totalQuestions = questions.length;
    const percentage = Math.round((correct / totalQuestions) * 100);
    const passingScore = 90; // 90% required to pass (increased difficulty)
    
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
    const passingScore = 90; // 90% required to pass (increased difficulty)
    
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

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000000',
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

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '600px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '25px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            fontSize: '48px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>⚠️</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 900,
            color: '#ef4444',
            marginBottom: '20px',
            textAlign: 'center'
          }}>Error Loading Quiz</h2>
          <div style={{
            fontSize: '16px',
            color: '#333',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
            marginBottom: '30px',
            background: '#f9fafb',
            padding: '20px',
            borderRadius: '15px',
            border: '2px solid #e5e7eb'
          }}>{error}</div>
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                fetchQuiz();
              }}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #007BFF, #0056B3)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: '50px',
                fontSize: '16px'
              }}
            >
              Retry
            </button>
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
                background: '#e5e7eb',
                border: 'none',
                color: '#333',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: '50px',
                fontSize: '16px'
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return null;
  }

  const totalQuestions = quizData.quiz?.questions?.length || 0;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
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
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #007BFF, #0056B3)',
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
            {/* Timer Display */}
            {timeRemaining !== null && !showResults && (
              <div style={{
                padding: '15px 25px',
                background: timeRemaining < 300 
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                  : 'linear-gradient(135deg, #007BFF, #0056B3)',
                borderRadius: '15px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '20px',
                minWidth: '120px',
                textAlign: 'center',
                boxShadow: timeRemaining < 300 ? '0 5px 20px rgba(239, 68, 68, 0.5)' : '0 5px 15px rgba(0, 123, 255, 0.4)',
                animation: timeRemaining < 60 ? 'pulse 1s infinite' : 'none'
              }}>
                ⏱️ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </div>
            )}
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
                background: 'linear-gradient(135deg, #007BFF, #0056B3)',
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
                    {(shuffledQuestions[question.id]?.shuffledOptions || question.options).map((option: string, optIdx: number) => {
                      // Normalize option display - make all buttons same height to prevent length-based guessing
                      const minHeight = '80px';
                      return (
                        <button
                          key={optIdx}
                          onClick={() => !timeUp && handleAnswerSelect(question.id, optIdx)}
                          disabled={timeUp}
                          style={{
                            padding: '20px 25px',
                            minHeight: minHeight,
                            display: 'flex',
                            alignItems: 'center',
                            background: answers[question.id] === optIdx
                              ? 'linear-gradient(135deg, #007BFF, #0056B3)'
                              : '#f9fafb',
                            color: answers[question.id] === optIdx ? '#fff' : '#333',
                            border: `2px solid ${answers[question.id] === optIdx ? '#007BFF' : '#e5e7eb'}`,
                            borderRadius: '20px',
                            cursor: timeUp ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                            textAlign: 'left',
                            fontWeight: answers[question.id] === optIdx ? 700 : 500,
                            fontSize: '16px',
                            lineHeight: '1.5',
                            boxShadow: answers[question.id] === optIdx
                              ? '0 10px 25px rgba(131, 56, 236, 0.3)'
                              : '0 5px 15px rgba(0, 0, 0, 0.1)',
                            opacity: timeUp ? 0.6 : 1,
                            width: '100%'
                          }}
                          onMouseEnter={(e) => {
                            if (!timeUp && answers[question.id] !== optIdx) {
                              e.currentTarget.style.background = '#f3f4f6';
                              e.currentTarget.style.borderColor = '#007BFF';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!timeUp && answers[question.id] !== optIdx) {
                              e.currentTarget.style.background = '#f9fafb';
                              e.currentTarget.style.borderColor = '#e5e7eb';
                            }
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
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
                  disabled={Object.keys(answers).length < totalQuestions && !timeUp}
                  style={{
                    padding: '18px 45px',
                    background: (Object.keys(answers).length < totalQuestions && !timeUp)
                      ? '#e5e7eb'
                      : 'linear-gradient(135deg, #007BFF, #0056B3)',
                    border: 'none',
                    color: (Object.keys(answers).length < totalQuestions && !timeUp) ? '#999' : '#fff',
                    fontWeight: 900,
                    fontSize: '18px',
                    textTransform: 'uppercase',
                    cursor: (Object.keys(answers).length < totalQuestions && !timeUp) ? 'not-allowed' : 'pointer',
                    borderRadius: '50px',
                    boxShadow: (Object.keys(answers).length < totalQuestions && !timeUp)
                      ? 'none'
                      : '0 10px 30px rgba(131, 56, 236, 0.5)',
                    transition: 'all 0.3s',
                    letterSpacing: '1px',
                    opacity: (Object.keys(answers).length < totalQuestions && !timeUp) ? 0.5 : 1
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
                background: 'linear-gradient(135deg, #007BFF, #0056B3)',
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
                  {percentage >= 90 ? 'Excellent! You have a strong understanding of this section. You can now proceed to the next section.' :
                   'You need at least 90% to pass this quiz. Your score: ' + percentage + '%. Please review the section content and try again.'}
                </div>
                {percentage < 90 && (
                  <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '15px',
                    border: '2px solid #ef4444',
                    color: '#ef4444',
                    fontWeight: 700
                  }}>
                    ⚠️ Score Required: 90% | Your Score: {percentage}% | Please retake the quiz
                  </div>
                )}
                {timeUp && (
                  <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '15px',
                    border: '2px solid #ef4444',
                    color: '#ef4444',
                    fontWeight: 700
                  }}>
                    ⏱️ Time's Up! Quiz was auto-submitted.
                  </div>
                )}
              </div>

              {/* Review Answers - Only show if passed (90%+) */}
              {percentage >= 90 && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#333',
                  marginBottom: '30px',
                  textTransform: 'uppercase'
                }}>Review Your Answers</h3>
                {quizData.quiz?.questions?.map((question: any, idx: number) => {
                  const userShuffledAnswer = answers[question.id];
                  // Convert shuffled answer back to original index for comparison
                  const userOriginalAnswer = userShuffledAnswer !== undefined 
                    ? shuffledQuestions[question.id]?.shuffledToOriginal[userShuffledAnswer] ?? -1
                    : -1;
                  const isCorrect = userOriginalAnswer === question.correctAnswer;
                  
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
                          {userShuffledAnswer !== undefined 
                            ? (shuffledQuestions[question.id]?.shuffledOptions[userShuffledAnswer] || question.options[userOriginalAnswer] || 'No answer selected')
                            : 'No answer selected'}
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
                        borderLeft: '4px solid #007BFF'
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
              )}

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
                    background: 'linear-gradient(135deg, #007BFF, #0056B3)',
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
                  disabled={percentage < 90}
                  style={{
                    padding: '18px 45px',
                    background: percentage >= 90 ? 'linear-gradient(135deg, #10b981, #007BFF)' : '#e5e7eb',
                    border: 'none',
                    color: percentage >= 90 ? '#fff' : '#999',
                    fontWeight: 900,
                    fontSize: '18px',
                    textTransform: 'uppercase',
                    cursor: percentage >= 90 ? 'pointer' : 'not-allowed',
                    borderRadius: '50px',
                    boxShadow: percentage >= 90 ? '0 10px 30px rgba(16, 185, 129, 0.5)' : 'none',
                    transition: 'all 0.3s',
                    letterSpacing: '1px',
                    opacity: percentage >= 90 ? 1 : 0.5
                  }}
                  onMouseEnter={(e) => {
                    if (percentage >= 90) {
                      e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.7)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = percentage >= 90 ? '0 10px 30px rgba(16, 185, 129, 0.5)' : 'none';
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
