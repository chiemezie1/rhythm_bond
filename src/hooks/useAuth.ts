'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import socialService from '@/services/socialService';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  isVerified: boolean;
  joinDate: string;
  followers: string[];
  following: string[];
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Combine session user with profile data
  const user = session?.user ? {
    ...session.user,
    ...userProfile
  } : null;

  // Load user profile when session changes
  useEffect(() => {
    const loadUserProfile = async () => {
      if (isAuthenticated && session?.user?.id) {
        try {
          setProfileLoading(true);
          setProfileError(null);

          // Get the user profile from the social service
          const profile = await socialService.getUserProfile(session.user.id);

          if (profile) {
            setUserProfile(profile);
          }

          setProfileLoading(false);
        } catch (err) {
          console.error('Error loading user profile:', err);
          setProfileError('Failed to load user profile');
          setProfileLoading(false);
        }
      }
    };

    loadUserProfile();
  }, [isAuthenticated, session]);

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/');
      router.refresh();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  // Update user profile
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!isAuthenticated || !user) {
      throw new Error('You must be logged in to update your profile');
    }

    try {
      const updatedProfile = await socialService.updateUserProfile({
        ...profileData,
        id: user.id
      });

      setUserProfile(updatedProfile);

      return updatedProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || profileLoading,
    error: profileError,
    login,
    register,
    logout,
    updateProfile,
  };
}
