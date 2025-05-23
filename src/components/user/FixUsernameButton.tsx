'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FixUsernameButton() {
  const [isFixing, setIsFixing] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleFixUsername = async () => {
    try {
      setIsFixing(true);
      setMessage('');

      const response = await fetch('/api/user/fix-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Username updated! Old: ${data.oldUsername} → New: ${data.newUsername}`);
        
        // Refresh the page after a short delay to show the new username
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fixing username:', error);
      setMessage('❌ Failed to fix username');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-yellow-400 font-semibold mb-1">Username Issue Detected</h3>
          <p className="text-yellow-200 text-sm">
            Your username appears to be auto-generated. Click to create a proper username.
          </p>
        </div>
        <button
          onClick={handleFixUsername}
          disabled={isFixing}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {isFixing ? 'Fixing...' : 'Fix Username'}
        </button>
      </div>
      
      {message && (
        <div className="mt-3 p-2 bg-dark-lighter rounded text-sm">
          {message}
        </div>
      )}
    </div>
  );
}
