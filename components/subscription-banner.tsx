'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

export function SubscriptionBanner() {
  const { isActive, daysLeft, isTrial, isPro, loading } = useSubscription();

  // Don't show if loading
  if (loading) return null;
  
  // Don't show if active Pro user with more than 5 days left
  if (isPro && isActive && daysLeft > 5) return null;
  
  // Show if trial is active OR if subscription is expired
  const shouldShow = isTrial || !isActive;
  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0, y: -20 }}
        animate={{ height: 'auto', opacity: 1, y: 0 }}
        exit={{ height: 0, opacity: 0, y: -20 }}
        className="px-6 pt-4"
      >
        <div className="flex items-center justify-between rounded-[24px] bg-[#E6F6F4] p-4 shadow-sm border border-[#CCECE8]/50">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#CCECE8] text-[#0ea495]">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0ea495]/70">
                {isTrial ? 'Free Trial Active' : 'Subscription Active'}
              </span>
              <span className="text-[16px] font-extrabold text-[#0ea495]">
                {daysLeft} Days Remaining
              </span>
            </div>
          </div>
          <Link
            href="/billing"
            className="rounded-xl bg-white px-5 py-2.5 text-[12px] font-extrabold uppercase tracking-wider text-[#0ea495] shadow-sm active:scale-95 transition-transform"
          >
            Upgrade
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
