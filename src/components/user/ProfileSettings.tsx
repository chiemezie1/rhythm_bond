'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProfileSettings() {
  const [bio, setBio] = useState('Music enthusiast and aspiring DJ. I love discovering new tracks and sharing them with friends!');
  const [displayName, setDisplayName] = useState('John Doe');
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
      
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-dark-lightest">
            <Image 
              src="/images/logo.png" 
              alt="Profile Picture" 
              width={80} 
              height={80} 
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-lg">John Doe</h3>
            <p className="text-gray-400">@johndoe</p>
            <button className="text-primary hover:underline text-sm mt-1">Change profile picture</button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
            <input 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-dark rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
            <textarea 
              value={bio} 
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-dark rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{bio.length}/160 characters</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
            <input 
              type="text" 
              placeholder="Add your location" 
              className="w-full bg-dark rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Website</label>
            <input 
              type="url" 
              placeholder="Add your website" 
              className="w-full bg-dark rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="border-t border-dark-lightest pt-6 mt-6">
            <h3 className="font-bold text-lg mb-4">Social Links</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-dark rounded-full flex-shrink-0">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Twitter username" 
                  className="flex-1 bg-dark rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-dark rounded-full flex-shrink-0">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Instagram username" 
                  className="flex-1 bg-dark rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-dark rounded-full flex-shrink-0">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="YouTube channel" 
                  className="flex-1 bg-dark rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <button className="text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg font-medium transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
