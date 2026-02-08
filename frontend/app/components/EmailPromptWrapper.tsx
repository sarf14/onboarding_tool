'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import EmailPromptModal from './EmailPromptModal';

export default function EmailPromptWrapper({ children }: { children: React.ReactNode }) {
  const { user, fetchUser } = useAuthStore();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [hasCheckedEmail, setHasCheckedEmail] = useState(false);

  useEffect(() => {
    const checkEmail = async () => {
      // Only check if user is logged in
      if (!user) {
        // Try to fetch user if token exists
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          try {
            await fetchUser();
          } catch {
            // User not logged in, ignore
          }
        }
        return;
      }

      // Check if user doesn't have email
      if (!user.email && !hasCheckedEmail) {
        setShowEmailModal(true);
        setHasCheckedEmail(true);
      }
    };

    checkEmail();
  }, [user, fetchUser, hasCheckedEmail]);

  const handleEmailUpdated = async () => {
    // Refresh user data after email update
    await fetchUser();
    setShowEmailModal(false);
  };

  return (
    <>
      {children}
      <EmailPromptModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onEmailUpdated={handleEmailUpdated}
        canClose={false}
      />
    </>
  );
}
