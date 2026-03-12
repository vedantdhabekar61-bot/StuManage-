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
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-2xl"
          >
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
              className="w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-rose-50 p-4 text-rose-600">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-slate-900">WhatsApp Error</h3>
                  <p className="text-sm text-slate-500">
                    WhatsApp not installed or popup blocked. Please install WhatsApp to send reminder.
                  </p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 w-full rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all active:scale-95"
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
