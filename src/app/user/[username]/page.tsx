'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import UserProfile from '@/components/UserProfile';
import SocialFeed from '@/components/SocialFeed';
import { useAuth } from '@/hooks/useAuth';
import socialService from '@/services/socialService';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user, isAuthenticated } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Fetch user ID from username
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if this is the current user
        if (isAuthenticated && user && user.username === username) {
          setUserId(user.id);
          setIsLoading(false);
          return;
        }
        
        // Find user by username
        const users = await socialService.searchUsers(username);
        const matchedUser = users.find(u => u.username === username);
        
        if (matchedUser) {
          setUserId(matchedUser.id);
        } else {
          setError('User not found');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user profile');
        setIsLoading(false);
      }
    };
    
    fetchUserId();
  }, [username, isAuthenticated, user]);
  
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
      {/* Tabs */}
      <div className="mb-8 border-b border-dark-lightest">
        <div className="flex overflow-x-auto">
          <button 
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'profile' 
                ? 'border-primary text-white font-medium' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'posts' 
                ? 'border-primary text-white font-medium' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
        </div>
      </div>
      
      {/* Content */}
      {activeTab === 'profile' ? (
        <UserProfile userId={userId} />
      ) : (
        <SocialFeed userId={userId} />
      )}
    </div>
  );
}
