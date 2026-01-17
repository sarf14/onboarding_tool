'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface Progress {
  day: number;
  status: string;
  dayProgress: number;
  miniQuiz1Score?: number;
  miniQuiz2Score?: number;
  dayEndQuizScore?: number;
  tasksCompleted: number;
  tasksTotal: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout, fetchUser } = useAuthStore();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUser();
    fetchProgress();
  }, [token, router, fetchUser]);

  const fetchProgress = async () => {
    try {
      const response = await api.get('/progress/me');
      setProgress(response.data.progress || []);
      setOverallProgress(response.data.overallProgress || 0);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#62AADE]"></div>
      </div>
    );
  }

  const completedDays = progress.filter((p) => p.status === 'COMPLETED').length;
  const currentDay = user.currentDay || 1;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-950 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome back, {user.name}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Overall Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-[#163791] to-[#62AADE] h-4 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#62AADE]">{completedDays}</p>
                <p className="text-sm text-gray-400">Days Completed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#62AADE]">{currentDay}</p>
                <p className="text-sm text-gray-400">Current Day</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#62AADE]">{7 - completedDays}</p>
                <p className="text-sm text-gray-400">Days Remaining</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">7-Day Timeline</h2>
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const dayProgress = progress.find((p) => p.day === day);
              const status = dayProgress?.status || 'NOT_STARTED';
              const isCurrentDay = day === currentDay;
              
              let bgColor = 'bg-gray-800';
              let textColor = 'text-gray-400';
              
              if (status === 'COMPLETED') {
                bgColor = 'bg-green-600';
                textColor = 'text-white';
              } else if (isCurrentDay) {
                bgColor = 'bg-gradient-to-br from-[#163791] to-[#62AADE]';
                textColor = 'text-white';
              } else if (status === 'IN_PROGRESS') {
                bgColor = 'bg-blue-600';
                textColor = 'text-white';
              }

              return (
                <button
                  key={day}
                  onClick={() => router.push(`/day/${day}`)}
                  className={`${bgColor} ${textColor} p-4 rounded-lg font-semibold hover:scale-105 transition-transform`}
                >
                  <div className="text-2xl mb-1">Day {day}</div>
                  <div className="text-xs">
                    {status === 'COMPLETED' ? '✓' : isCurrentDay ? '→' : '○'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const dayProgress = progress.find((p) => p.day === day);
            const status = dayProgress?.status || 'NOT_STARTED';
            
            return (
              <div
                key={day}
                className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-[#62AADE] transition cursor-pointer"
                onClick={() => router.push(`/day/${day}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">Day {day}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    status === 'COMPLETED' ? 'bg-green-600 text-white' :
                    status === 'IN_PROGRESS' ? 'bg-blue-600 text-white' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {status.replace('_', ' ')}
                  </span>
                </div>
                {dayProgress && (
                  <div className="space-y-2 text-sm text-gray-400">
                    <div>Progress: {dayProgress.dayProgress}%</div>
                    <div>Tasks: {dayProgress.tasksCompleted}/{dayProgress.tasksTotal}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
