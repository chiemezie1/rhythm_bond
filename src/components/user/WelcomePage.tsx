'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function WelcomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="mb-8 flex justify-center">
          <Image 
            src="/images/logo_with_name.png" 
            alt="RhythmBond Logo" 
            width={300} 
            height={80} 
            className="h-auto"
          />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Connect Through Music
        </h1>
        
        <p className="text-xl text-gray-300 mb-10 leading-relaxed">
          Discover new music, share your favorite tracks, and connect with friends who share your musical taste.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link 
            href="/register" 
            className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded-full text-lg transition-colors"
          >
            Get Started
          </Link>
          <Link 
            href="/login" 
            className="bg-dark-lighter hover:bg-dark-lightest text-white font-medium py-3 px-8 rounded-full text-lg transition-colors border border-dark-lightest"
          >
            Sign In
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-dark-lighter p-6 rounded-xl">
            <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Discover Music</h3>
            <p className="text-gray-400 text-center">
              Find new artists and tracks based on your listening habits and preferences.
            </p>
          </div>
          
          <div className="bg-dark-lighter p-6 rounded-xl">
            <div className="bg-secondary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Connect with Friends</h3>
            <p className="text-gray-400 text-center">
              Share playlists, follow friends, and see what they're listening to in real-time.
            </p>
          </div>
          
          <div className="bg-dark-lighter p-6 rounded-xl">
            <div className="bg-green-500/10 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Personalized Experience</h3>
            <p className="text-gray-400 text-center">
              Get recommendations tailored to your taste and create your own music identity.
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-400 mb-2">
            Join thousands of music lovers on RhythmBond
          </p>
          <Link 
            href="/register" 
            className="text-primary hover:text-primary-dark font-medium"
          >
            Create your account now →
          </Link>
        </div>
      </div>
    </div>
  );
}
