'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function DayContentPage() {
  const params = useParams();
  const router = useRouter();
  const day = parseInt(params.day as string);
  const { user, token } = useAuthStore();
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchContent();
  }, [day, token, router]);

  const fetchContent = async () => {
    try {
      const response = await api.get(`/content/day/${day}`);
      setContent(response.data.content);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#62AADE]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gray-950 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Day {day}: {content.title}</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 space-y-8">
          {/* Morning Session */}
          <section>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#62AADE] to-[#163791] mb-4">
              {content.morningSession.title}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Topics:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  {content.morningSession.topics.map((topic: string, idx: number) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Activities:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  {content.morningSession.activities.map((activity: string, idx: number) => (
                    <li key={idx}>{activity}</li>
                  ))}
                </ul>
              </div>
              {content.morningSession.videoUrl && (
                <div className="mt-4">
                  <a
                    href={content.morningSession.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#163791] to-[#62AADE] text-white rounded-lg hover:shadow-lg transition"
                  >
                    Watch Video
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Afternoon Session */}
          {content.afternoonSession && (
            <section>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#62AADE] to-[#163791] mb-4">
                {content.afternoonSession.title}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Topics:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    {content.afternoonSession.topics.map((topic: string, idx: number) => (
                      <li key={idx}>{topic}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Activities:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    {content.afternoonSession.activities.map((activity: string, idx: number) => (
                      <li key={idx}>{activity}</li>
                    ))}
                  </ul>
                </div>
                {content.afternoonSession.videoUrl && (
                  <div className="mt-4">
                    <a
                      href={content.afternoonSession.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#163791] to-[#62AADE] text-white rounded-lg hover:shadow-lg transition"
                    >
                      Watch Video
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-8 border-t border-gray-800">
            <button
              onClick={() => router.push(`/day/${day - 1}`)}
              disabled={day === 1}
              className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous Day
            </button>
            <button
              onClick={() => router.push(`/day/${day + 1}`)}
              disabled={day === 7}
              className="px-6 py-3 bg-gradient-to-r from-[#163791] to-[#62AADE] text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Day →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
