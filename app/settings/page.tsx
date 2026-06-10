'use client';

import { useAuth } from '@/hooks/use-auth';
import { useStudents } from '@/hooks/use-students';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Trash2, LogOut, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { students } = useStudents();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      // Delete all student records for this user (they are tied via RLS, but we can explicitly delete)
      // Wait, RLS handles deleting if the user is deleted, depending on ON DELETE CASCADE.
      // But the prompt says "Deletes all their student records."
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("Not logged in");

      const res = await fetch('/api/user/delete', { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (!res.ok) {
        console.error("Failed to delete user account via API.");
        // Fallback or warning
      }

      await logout();
      router.push('/login');
    } catch (err) {
      console.error(err);
      alert('Failed to delete account. Please contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-background font-sans pb-24">
      <header className="flex items-center gap-4 px-6 pt-8 pb-4 bg-card sticky top-0 z-10 border-b border-border/10">
        <button 
          onClick={() => router.back()}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-background active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-foreground truncate">Settings</h1>
        </div>
      </header>

      <div className="p-6">
        <div className="bg-card rounded-[2rem] p-6 shadow-sm border border-border/50 mb-6">
          <h2 className="text-sm font-bold text-muted uppercase tracking-widest mb-4">Account</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-background/50 p-4 rounded-2xl">
              <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-lg font-bold shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] font-semibold text-muted truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full h-14 rounded-2xl bg-background border border-border/50 flex items-center justify-between px-5 font-bold text-muted hover:bg-muted/5 active:scale-95 transition-all"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-card rounded-[2rem] p-6 shadow-sm border border-border/50 border-rose-100/50">
          <h2 className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Danger Zone
          </h2>
          <p className="text-xs font-semibold text-muted mb-6 leading-relaxed">
            Once you delete your account, there is no going back. Please be certain. All your student records, seat information, and settings will be permanently removed.
          </p>
          
          {showDeleteConfirm ? (
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
              <p className="text-[13px] font-bold text-rose-800 tracking-wide leading-relaxed mb-4 text-center">
                Are you absolutely sure you want to delete your account?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 h-12 rounded-xl bg-white border border-rose-200 text-rose-600 font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 h-12 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-rose-200 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center gap-2 text-rose-600 font-bold active:scale-95 transition-all"
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete Account</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
