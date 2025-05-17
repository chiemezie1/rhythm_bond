'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "@/components/layout/Layout";
import UserProfile from "@/components/user/UserProfile";
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to user's profile page if authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.username) {
      router.push(`/user/${user.username}`);
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <UserProfile />
      </Layout>
    </ProtectedRoute>
  );
}
