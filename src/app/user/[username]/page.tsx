'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import UserProfile from '@/components/user/UserProfile';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user, isAuthenticated } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track current fetch to prevent duplicates
  const currentFetchRef = useRef<string | null>(null);

  // Fetch user ID from username
  useEffect(() => {
    if (!username) return;

    // Prevent duplicate fetches for the same username
    if (currentFetchRef.current === username) {
      return;
    }

    currentFetchRef.current = username;

    const fetchUserId = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use direct username lookup API
        const response = await fetch(`/api/user/by-username/${encodeURIComponent(username)}`);

        if (response.ok) {
          const data = await response.json();
          setUserId(data.user.id);
        } else if (response.status === 404) {
          setError('User not found');
        } else {
          throw new Error('Failed to lookup user');
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user profile');
        setIsLoading(false);
      }
    };

    fetchUserId();
  }, [username]); // ONLY depend on username

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-dark-lighter rounded-xl p-6 text-center">
          <p className="text-red-400 mb-4">{error || 'User not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white">@{username}</span>
        </nav>
      </div>

      <UserProfile userId={userId} />
    </div>
  );
}
