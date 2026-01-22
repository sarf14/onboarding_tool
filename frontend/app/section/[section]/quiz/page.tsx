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
  const [answers, setAnswers] = useState<{ [key: number]: number | number[] }>({});
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
              const correctAnswer = q.correctAnswer;
              const isMultiSelect = Array.isArray(correctAnswer);
              
              if (isMultiSelect) {
                // Multi-select question - user must select ALL correct answers
                const userSelectedAnswers = Array.isArray(userShuffledAnswer) 
                  ? userShuffledAnswer.map((shuffledIdx: number) => 
                      shuffledQuestions[q.id]?.shuffledToOriginal[shuffledIdx] ?? -1
                    ).filter((idx: number) => idx !== -1)
                  : [];
                
                const correctAnswersSet = new Set(correctAnswer);
                const userAnswersSet = new Set(userSelectedAnswers);
                
                if (correctAnswersSet.size === userAnswersSet.size && 
                    correctAnswer.every((ans: number) => userAnswersSet.has(ans))) {
                  correct++;
                }
                
                answerArray.push(userSelectedAnswers.length > 0 ? userSelectedAnswers : [-1]);
              } else {
                // Single select question
                const userOriginalAnswer = userShuffledAnswer !== undefined 
                  ? (typeof userShuffledAnswer === 'number' 
                      ? shuffledQuestions[q.id]?.shuffledToOriginal[userShuffledAnswer] ?? -1
                      : -1)
                  : -1;
                
                answerArray.push(userOriginalAnswer !== undefined && userOriginalAnswer !== -1 ? userOriginalAnswer : -1);
                
                if (userOriginalAnswer === correctAnswer) {
                  correct++;
                }
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

  const handleAnswerSelect = (questionId: number, answerIndex: number, isMultiSelect: boolean = false) => {
    if (showResults) return;
    
    if (isMultiSelect) {
      // Toggle selection for multi-select questions
      const currentAnswer = answers[questionId];
      const selectedAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
      
      if (selectedAnswers.includes(answerIndex)) {
        // Deselect if already selected
        setAnswers({ ...answers, [questionId]: selectedAnswers.filter((idx: number) => idx !== answerIndex) });
      } else {
        // Select if not selected
        setAnswers({ ...answers, [questionId]: [...selectedAnswers, answerIndex] });
      }
    } else {
      // Single select
      setAnswers({ ...answers, [questionId]: answerIndex });
    }
  };

  const handleSubmit = async () => {
    if (!quizData?.quiz?.questions) return;
    
    let correct = 0;
    const questions = quizData.quiz.questions;
    const answerArray: number[] = [];
    
    questions.forEach((q: any) => {
      const userShuffledAnswer = answers[q.id];
      const correctAnswer = q.correctAnswer;
      const isMultiSelect = Array.isArray(correctAnswer);
      
      if (isMultiSelect) {
        // Multi-select question - user must select ALL correct answers
        const userSelectedAnswers = Array.isArray(userShuffledAnswer) 
          ? userShuffledAnswer.map((shuffledIdx: number) => 
              shuffledQuestions[q.id]?.shuffledToOriginal[shuffledIdx] ?? -1
            ).filter((idx: number) => idx !== -1)
          : [];
        
        // Check if user selected exactly the correct answers (same length and all match)
        const correctAnswersSet = new Set(correctAnswer);
        const userAnswersSet = new Set(userSelectedAnswers);
        
        if (correctAnswersSet.size === userAnswersSet.size && 
            correctAnswer.every((ans: number) => userAnswersSet.has(ans))) {
          correct++;
        }
        
        // Store as array for multi-select
        answerArray.push(userSelectedAnswers.length > 0 ? userSelectedAnswers : [-1]);
      } else {
        // Single select question
        const userOriginalAnswer = userShuffledAnswer !== undefined 
          ? (typeof userShuffledAnswer === 'number' 
              ? shuffledQuestions[q.id]?.shuffledToOriginal[userShuffledAnswer] ?? -1
              : -1)
          : -1;
        
        answerArray.push(userOriginalAnswer !== undefined && userOriginalAnswer !== -1 ? userOriginalAnswer : -1);
        
        // Single correct answer
        if (userOriginalAnswer === correctAnswer) {
          correct++;
        }
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
          }}>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#001e49',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '600px',
          background: '#141943',
          borderRadius: '0',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
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
            fontSize: '48px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>⚠️</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 900,
            color: '#ef4444',
            marginBottom: '20px',
            textAlign: 'center',
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>Error Loading Quiz</h2>
          <div style={{
            fontSize: '16px',
            color: '#efefef',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
            marginBottom: '30px',
            background: '#001e49',
            padding: '20px',
            borderRadius: '0',
            border: '2px solid #163791',
            fontFamily: "'Inter', sans-serif"
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
                background: '#163791',
                border: '2px solid #001a62',
                color: '#efefef',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: '0',
                fontSize: '16px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                transition: 'all 0.3s'
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
                background: '#001e49',
                border: '2px solid #163791',
                color: '#efefef',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: '0',
                fontSize: '16px',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#141943';
                e.currentTarget.style.borderColor = '#001a62';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#001e49';
                e.currentTarget.style.borderColor = '#163791';
                e.currentTarget.style.transform = 'translateY(0)';
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
      background: '#001e49',
      fontFamily: "'Inter', sans-serif",
      color: '#efefef',
      padding: '40px 20px',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: '#141943',
          borderRadius: '0',
          padding: '30px 40px',
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
                color: '#efefef',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                marginBottom: '10px',
                fontFamily: "'Orbitron', sans-serif"
              }}>{section === 'final' ? 'Final Comprehensive Quiz' : `Section ${section} Quiz`}</h1>
              <p style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#efefef',
                textTransform: 'uppercase',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '2px',
                opacity: 0.9
              }}>{quizData.quiz?.title || 'Quiz'}</p>
            </div>
            {/* Timer Display */}
            {timeRemaining !== null && !showResults && (
              <div style={{
                padding: '15px 25px',
                background: timeRemaining < 300 
                  ? '#ef4444' 
                  : '#163791',
                borderRadius: '0',
                color: '#efefef',
                fontWeight: 900,
                fontSize: '20px',
                minWidth: '120px',
                textAlign: 'center',
                border: `2px solid ${timeRemaining < 300 ? '#dc2626' : '#001a62'}`,
                boxShadow: timeRemaining < 300 ? '0 5px 20px rgba(239, 68, 68, 0.5)' : '0 5px 15px rgba(22, 55, 145, 0.4)',
                animation: timeRemaining < 60 ? 'pulse 1s infinite' : 'none',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1px',
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
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
              ← Back to Section
            </button>
          </div>
        </div>

        {/* Quiz Content */}
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
          {!showResults ? (
            <>
              {quizData.quiz?.questions?.map((question: any, idx: number) => {
                const isMultiSelect = Array.isArray(question.correctAnswer);
                const selectedAnswers = Array.isArray(answers[question.id]) 
                  ? answers[question.id] as number[]
                  : answers[question.id] !== undefined 
                    ? [answers[question.id] as number]
                    : [];
                
                return (
                <div
                  key={question.id}
                  style={{
                    marginBottom: '40px',
                    padding: '30px',
                    background: '#001e49',
                    borderRadius: '0',
                    border: '2px solid #163791',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                  }}
                >
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#efefef',
                    marginBottom: '20px',
                    textTransform: 'uppercase',
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: '2px'
                  }}>
                    Question {idx + 1} of {totalQuestions}
                    {isMultiSelect && (
                      <span style={{
                        fontSize: '14px',
                        marginLeft: '15px',
                        color: '#163791',
                        fontWeight: 600
                      }}>(Select all that apply)</span>
                    )}
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#efefef',
                    marginBottom: '25px',
                    lineHeight: 1.4,
                    fontFamily: "'Inter', sans-serif"
                  }}>{question.question}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {(shuffledQuestions[question.id]?.shuffledOptions || question.options).map((option: string, optIdx: number) => {
                      // Normalize option display - make all buttons same height to prevent length-based guessing
                      const minHeight = '80px';
                      const isSelected = isMultiSelect 
                        ? selectedAnswers.includes(optIdx)
                        : answers[question.id] === optIdx;
                      
                      return (
                        <button
                          key={optIdx}
                          onClick={() => !timeUp && handleAnswerSelect(question.id, optIdx, isMultiSelect)}
                          disabled={timeUp}
                          style={{
                            padding: '20px 25px',
                            minHeight: minHeight,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            background: isSelected
                              ? '#163791'
                              : '#001e49',
                            color: '#efefef',
                            border: `2px solid ${isSelected ? '#001a62' : '#163791'}`,
                            borderRadius: '0',
                            cursor: timeUp ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                            textAlign: 'left',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '16px',
                            lineHeight: '1.5',
                            boxShadow: isSelected
                              ? '0 10px 25px rgba(22, 55, 145, 0.5)'
                              : '0 5px 15px rgba(0, 0, 0, 0.2)',
                            opacity: timeUp ? 0.6 : 1,
                            width: '100%',
                            fontFamily: "'Inter', sans-serif",
                            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                          }}
                          onMouseEnter={(e) => {
                            if (!timeUp && !isSelected) {
                              e.currentTarget.style.background = '#141943';
                              e.currentTarget.style.borderColor = '#001a62';
                              e.currentTarget.style.transform = 'translateX(5px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!timeUp && !isSelected) {
                              e.currentTarget.style.background = '#001e49';
                              e.currentTarget.style.borderColor = '#163791';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }
                          }}
                        >
                          {/* Checkbox indicator for multi-select */}
                          {isMultiSelect && (
                            <div style={{
                              width: '24px',
                              height: '24px',
                              border: `2px solid ${isSelected ? '#001a62' : '#163791'}`,
                              borderRadius: '0',
                              background: isSelected ? '#001a62' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
                            }}>
                              {isSelected && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#efefef" strokeWidth="3">
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          )}
                          <span style={{ flex: 1 }}>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
              })}

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '40px',
                paddingTop: '30px',
                borderTop: '2px solid #163791'
              }}>
                <button
                  onClick={handleSubmit}
                  disabled={(() => {
                    // Check if all questions are answered
                    const allAnswered = quizData.quiz?.questions?.every((q: any) => {
                      const answer = answers[q.id];
                      if (Array.isArray(q.correctAnswer)) {
                        // Multi-select: must have at least one answer
                        return Array.isArray(answer) ? answer.length > 0 : false;
                      } else {
                        // Single select: must have an answer
                        return answer !== undefined;
                      }
                    });
                    return !allAnswered && !timeUp;
                  })()}
                  style={{
                    padding: '18px 45px',
                    background: (() => {
                      const allAnswered = quizData.quiz?.questions?.every((q: any) => {
                        const answer = answers[q.id];
                        if (Array.isArray(q.correctAnswer)) {
                          return Array.isArray(answer) ? answer.length > 0 : false;
                        } else {
                          return answer !== undefined;
                        }
                      });
                      return (!allAnswered && !timeUp) ? '#141943' : '#163791';
                    })(),
                    border: `2px solid ${(() => {
                      const allAnswered = quizData.quiz?.questions?.every((q: any) => {
                        const answer = answers[q.id];
                        if (Array.isArray(q.correctAnswer)) {
                          return Array.isArray(answer) ? answer.length > 0 : false;
                        } else {
                          return answer !== undefined;
                        }
                      });
                      return (!allAnswered && !timeUp) ? '#163791' : '#001a62';
                    })()}`,
                    color: '#efefef',
                    fontWeight: 900,
                    fontSize: '18px',
                    textTransform: 'uppercase',
                    cursor: (() => {
                      const allAnswered = quizData.quiz?.questions?.every((q: any) => {
                        const answer = answers[q.id];
                        if (Array.isArray(q.correctAnswer)) {
                          return Array.isArray(answer) ? answer.length > 0 : false;
                        } else {
                          return answer !== undefined;
                        }
                      });
                      return (!allAnswered && !timeUp) ? 'not-allowed' : 'pointer';
                    })(),
                    borderRadius: '0',
                    boxShadow: (() => {
                      const allAnswered = quizData.quiz?.questions?.every((q: any) => {
                        const answer = answers[q.id];
                        if (Array.isArray(q.correctAnswer)) {
                          return Array.isArray(answer) ? answer.length > 0 : false;
                        } else {
                          return answer !== undefined;
                        }
                      });
                      return (!allAnswered && !timeUp) ? 'none' : '0 10px 30px rgba(22, 55, 145, 0.5)';
                    })(),
                    transition: 'all 0.3s',
                    letterSpacing: '2px',
                    opacity: (() => {
                      const allAnswered = quizData.quiz?.questions?.every((q: any) => {
                        const answer = answers[q.id];
                        if (Array.isArray(q.correctAnswer)) {
                          return Array.isArray(answer) ? answer.length > 0 : false;
                        } else {
                          return answer !== undefined;
                        }
                      });
                      return (!allAnswered && !timeUp) ? 0.5 : 1;
                    })(),
                    fontFamily: "'Orbitron', sans-serif",
                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                  }}
                  onMouseEnter={(e) => {
                    const allAnswered = quizData.quiz?.questions?.every((q: any) => {
                      const answer = answers[q.id];
                      if (Array.isArray(q.correctAnswer)) {
                        return Array.isArray(answer) ? answer.length > 0 : false;
                      } else {
                        return answer !== undefined;
                      }
                    });
                    if (allAnswered) {
                      e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(22, 55, 145, 0.7)';
                      e.currentTarget.style.background = '#001a62';
                      e.currentTarget.style.borderColor = '#163791';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const allAnswered = quizData.quiz?.questions?.every((q: any) => {
                      const answer = answers[q.id];
                      if (Array.isArray(q.correctAnswer)) {
                        return Array.isArray(answer) ? answer.length > 0 : false;
                      } else {
                        return answer !== undefined;
                      }
                    });
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = !allAnswered ? 'none' : '0 10px 30px rgba(22, 55, 145, 0.5)';
                    e.currentTarget.style.background = !allAnswered ? '#141943' : '#163791';
                    e.currentTarget.style.borderColor = !allAnswered ? '#163791' : '#001a62';
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
                background: percentage >= 90 ? '#163791' : '#ef4444',
                borderRadius: '0',
                color: '#efefef',
                border: `3px solid ${percentage >= 90 ? '#001a62' : '#dc2626'}`,
                borderLeft: `8px solid ${percentage >= 90 ? '#001a62' : '#dc2626'}`,
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
                  borderTop: `20px solid ${percentage >= 90 ? '#001a62' : '#dc2626'}`
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '0',
                  height: '0',
                  borderRight: '20px solid transparent',
                  borderBottom: `20px solid ${percentage >= 90 ? '#001a62' : '#dc2626'}`
                }}></div>
                
                <div style={{
                  fontSize: '72px',
                  fontWeight: 900,
                  marginBottom: '20px',
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: '4px'
                }}>{percentage}%</div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  marginBottom: '10px',
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: '2px',
                  textTransform: 'uppercase'
                }}>You scored {score} out of {totalQuestions}</div>
                <div style={{
                  fontSize: '18px',
                  opacity: 0.9,
                  marginBottom: percentage >= 90 ? '0' : '20px',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {percentage >= 90 ? 'Excellent! You have a strong understanding of this section. You can now proceed to the next section.' :
                   'You need at least 90% to pass this quiz. Your score: ' + percentage + '%. Please review the section content and try again.'}
                </div>
                {percentage < 90 && (
                  <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '0',
                    border: '2px solid #ef4444',
                    color: '#efefef',
                    fontWeight: 700,
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: '1px',
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                  }}>
                    ⚠️ Score Required: 90% | Your Score: {percentage}% | Please retake the quiz
                  </div>
                )}
                {timeUp && (
                  <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '0',
                    border: '2px solid #ef4444',
                    color: '#efefef',
                    fontWeight: 700,
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: '1px',
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
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
                  color: '#efefef',
                  marginBottom: '30px',
                  textTransform: 'uppercase',
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: '3px'
                }}>Review Your Answers</h3>
                {quizData.quiz?.questions?.map((question: any, idx: number) => {
                  const userShuffledAnswer = answers[question.id];
                  const correctAnswer = question.correctAnswer;
                  const isMultiSelect = Array.isArray(correctAnswer);
                  
                  let isCorrect = false;
                  let userOriginalAnswer: number | number[] = -1;
                  
                  if (isMultiSelect) {
                    // Multi-select: check if user selected ALL correct answers
                    const userSelectedAnswers = Array.isArray(userShuffledAnswer) 
                      ? userShuffledAnswer.map((shuffledIdx: number) => 
                          shuffledQuestions[question.id]?.shuffledToOriginal[shuffledIdx] ?? -1
                        ).filter((idx: number) => idx !== -1)
                      : [];
                    
                    const correctAnswersSet = new Set(correctAnswer);
                    const userAnswersSet = new Set(userSelectedAnswers);
                    
                    isCorrect = correctAnswersSet.size === userAnswersSet.size && 
                                correctAnswer.every((ans: number) => userAnswersSet.has(ans));
                    userOriginalAnswer = userSelectedAnswers;
                  } else {
                    // Single select
                    userOriginalAnswer = userShuffledAnswer !== undefined 
                      ? (typeof userShuffledAnswer === 'number' 
                          ? shuffledQuestions[question.id]?.shuffledToOriginal[userShuffledAnswer] ?? -1
                          : -1)
                      : -1;
                    isCorrect = userOriginalAnswer === correctAnswer;
                  }
                  
                  return (
                    <div
                      key={question.id}
                      style={{
                        marginBottom: '30px',
                        padding: '30px',
                        background: '#001e49',
                        borderRadius: '0',
                        border: `2px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                        position: 'relative',
                        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
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
                          borderRadius: '0',
                          background: isCorrect ? '#10b981' : '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#efefef',
                          fontWeight: 900,
                          fontSize: '20px',
                          clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                        }}>
                          {isCorrect ? '✓' : '✗'}
                        </div>
                        <h4 style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#efefef',
                          fontFamily: "'Orbitron', sans-serif",
                          letterSpacing: '1px',
                          textTransform: 'uppercase'
                        }}>Question {idx + 1}</h4>
                      </div>
                      <p style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#efefef',
                        marginBottom: '20px',
                        fontFamily: "'Inter', sans-serif"
                      }}>{question.question}</p>
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#efefef',
                          marginBottom: '10px',
                          textTransform: 'uppercase',
                          fontFamily: "'Orbitron', sans-serif",
                          letterSpacing: '1px'
                        }}>Your Answer:</div>
                        <div style={{
                          padding: '15px',
                          background: '#141943',
                          borderRadius: '0',
                          color: isCorrect ? '#10b981' : '#ef4444',
                          fontWeight: 600,
                          border: `2px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                          fontFamily: "'Inter', sans-serif",
                          clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
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
                            color: '#efefef',
                            marginBottom: '10px',
                            textTransform: 'uppercase',
                            fontFamily: "'Orbitron', sans-serif",
                            letterSpacing: '1px'
                          }}>Correct Answer:</div>
                          <div style={{
                            padding: '15px',
                            background: '#141943',
                            borderRadius: '0',
                            color: '#10b981',
                            fontWeight: 600,
                            border: '2px solid #10b981',
                            fontFamily: "'Inter', sans-serif",
                            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                          }}>
                            {Array.isArray(question.correctAnswer) 
                              ? question.correctAnswer.map((idx: number) => question.options[idx]).join(', ')
                              : question.options[question.correctAnswer]}
                          </div>
                        </div>
                      )}
                      <div style={{
                        padding: '15px',
                        background: '#141943',
                        borderRadius: '0',
                        borderLeft: '4px solid #163791',
                        border: '2px solid #163791'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#efefef',
                          marginBottom: '5px',
                          textTransform: 'uppercase',
                          fontFamily: "'Orbitron', sans-serif",
                          letterSpacing: '1px'
                        }}>Explanation:</div>
                        <div style={{
                          color: '#efefef',
                          fontSize: '15px',
                          lineHeight: 1.6,
                          fontFamily: "'Inter', sans-serif"
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
                  Review Section
                </button>

                <button
                  onClick={handleNextSection}
                  disabled={percentage < 90}
                  style={{
                    padding: '18px 45px',
                    background: percentage >= 90 ? '#10b981' : '#141943',
                    border: `2px solid ${percentage >= 90 ? '#059669' : '#163791'}`,
                    color: '#efefef',
                    fontWeight: 900,
                    fontSize: '18px',
                    textTransform: 'uppercase',
                    cursor: percentage >= 90 ? 'pointer' : 'not-allowed',
                    borderRadius: '0',
                    boxShadow: percentage >= 90 ? '0 10px 30px rgba(16, 185, 129, 0.5)' : 'none',
                    transition: 'all 0.3s',
                    letterSpacing: '2px',
                    opacity: percentage >= 90 ? 1 : 0.5,
                    fontFamily: "'Orbitron', sans-serif",
                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                  }}
                  onMouseEnter={(e) => {
                    if (percentage >= 90) {
                      e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.7)';
                      e.currentTarget.style.background = '#059669';
                      e.currentTarget.style.borderColor = '#10b981';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = percentage >= 90 ? '0 10px 30px rgba(16, 185, 129, 0.5)' : 'none';
                    e.currentTarget.style.background = percentage >= 90 ? '#10b981' : '#141943';
                    e.currentTarget.style.borderColor = percentage >= 90 ? '#059669' : '#163791';
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
