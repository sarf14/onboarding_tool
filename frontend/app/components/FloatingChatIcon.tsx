'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function FloatingChatIcon() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide on quiz pages and chat page
  if (pathname?.includes('/quiz') || pathname === '/chat') {
    return null;
  }

  return (
    <button
      onClick={() => router.push('/chat')}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '64px',
        height: '64px',
        background: '#163791',
        border: '3px solid #001a62',
        borderRadius: '0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 25px rgba(22, 55, 145, 0.4)',
        transition: 'all 0.3s',
        zIndex: 1000,
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
        animation: 'float 3s ease-in-out infinite'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)';
        e.currentTarget.style.boxShadow = '0 12px 35px rgba(22, 55, 145, 0.6)';
        e.currentTarget.style.background = '#001a62';
        e.currentTarget.style.borderColor = '#163791';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(22, 55, 145, 0.4)';
        e.currentTarget.style.background = '#163791';
        e.currentTarget.style.borderColor = '#001a62';
      }}
      aria-label="Open chat"
    >
      {/* Angular corner accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '0',
        height: '0',
        borderLeft: '8px solid transparent',
        borderTop: '8px solid #001a62'
      }}></div>
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#efefef"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
