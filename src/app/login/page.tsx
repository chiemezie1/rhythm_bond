'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="w-full max-w-md p-8 bg-dark-lighter rounded-xl shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <Image 
            src="/images/logo.png" 
            alt="RhythmBond Logo" 
            width={80} 
            height={80} 
            className="mb-4"
          />
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 mt-2">Sign in to continue to RhythmBond</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-dark-lightest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-dark">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-dark-lightest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
              placeholder="Enter your password"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:text-primary-dark font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
