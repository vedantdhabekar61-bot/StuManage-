'use client';

import { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '@/lib/types';
import { useSettings } from '@/hooks/use-settings';
import { formatWhatsAppMessage, openWhatsApp, cn } from '@/lib/utils';

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

  const handleSend = (e: React.MouseEvent) => {
    e.stopPropagation();
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
        className={cn(
          "transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        {isOpening ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <MessageCircle className="h-5 w-5 fill-current" />
        )}
        {showText && <span className="font-black tracking-widest">{isOpening ? 'Opening...' : 'Send Reminder'}</span>}
      </button>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-[100] rounded-[2rem] bg-[#1C1917] px-8 py-5 text-sm font-black text-white shadow-2xl border border-white/10 flex items-center gap-4 min-w-[280px] justify-center"
          >
            <div className="h-3 w-3 rounded-full bg-[#25D366] animate-pulse shadow-[0_0_10px_#25D366]" />
            <span className="uppercase tracking-[0.2em]">Opening WhatsApp</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Modal (Fallback) */}
      <AnimatePresence>
        {error && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-card p-8 shadow-2xl border border-border/10"
            >
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="rounded-[1.5rem] bg-rose-50 dark:bg-rose-950/20 p-5 text-rose-600 border border-rose-100 dark:border-rose-900/30">
                  <MessageCircle className="h-10 w-10" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-foreground">WhatsApp Error</h3>
                  <p className="text-sm font-medium text-muted leading-relaxed">
                    WhatsApp not installed or popup blocked. Please check your settings to send reminders.
                  </p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 w-full rounded-2xl bg-primary py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
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
