'use client';

import { useState, useEffect } from 'react';
import { Book, X } from 'lucide-react';

export function WelcomeScreen({ onDismiss }: { onDismiss?: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen this before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenWelcome', 'true');
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
        
        {/* Header with Close Button */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2 text-blue-600">
            <Book size={20} />
            <span className="font-bold tracking-tight text-slate-800">DeskTrack</span>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Welcome to LibManager</h2>
          <p className="mt-2 text-slate-600">
            Your workspace for managing library tasks efficiently. 
            Track books, manage members, and organize your desk in one place.
          </p>
        </div>

        {/* Action Footer */}
        <div className="bg-slate-50 px-6 py-4 flex justify-end">
          <button
            onClick={handleDismiss}
            className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Get Started
          </button>
        </div>

      </div>
    </div>
  );
}
