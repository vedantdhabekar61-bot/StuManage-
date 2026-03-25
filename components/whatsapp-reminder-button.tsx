'use client';

import { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '@/lib/types';
import { useSettings } from '@/hooks/use-settings';
import { formatWhatsAppMessage, openWhatsApp } from '@/lib/utils';

interface WhatsAppReminderButtonProps {
  student: Student;
  className?: string;
  showText?: boolean;
}

export function WhatsAppReminderButton({ student, className, showText = true }: WhatsAppReminderButtonProps) {
  const { settings } = useSettings();
  const [isOpening, setIsOpening] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = () => {
    if (isOpening) return;

    setIsOpening(true);
    setShowToast(true);
    setError(null);

    const message = formatWhatsAppMessage(settings.messageTemplate, student, settings.libraryName);
    const success = openWhatsApp(student, message);

    if (!success) {
      setError("WhatsApp could not be opened. Please check if popups are allowed or if WhatsApp is installed.");
    }

    // Disable for 2 seconds
    setTimeout(() => {
      setIsOpening(false);
    }, 2000);

    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <>
      <button
        onClick={handleSend}
        disabled={isOpening}
        className={className}
      >
        {isOpening ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageCircle className="h-4 w-4" />
        )}
        {showText && <span>{isOpening ? 'Opening...' : 'Send Reminder'}</span>}
      </button>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-[100] rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold text-white shadow-2xl border border-slate-800 flex items-center gap-3"
          >
            <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            Opening WhatsApp...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Modal (Fallback) */}
      <AnimatePresence>
        {error && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl border border-white"
            >
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="rounded-[1.5rem] bg-rose-50 p-5 text-rose-600 border border-rose-100">
                  <MessageCircle className="h-10 w-10" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-slate-900">WhatsApp Error</h3>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed">
                    WhatsApp not installed or popup blocked. Please check your settings to send reminders.
                  </p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 w-full rounded-2xl bg-teal-500 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-teal-100 transition-all active:scale-95"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
