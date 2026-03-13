'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

export function SubscriptionBanner() {
  const { isActive, daysLeft, isTrial, loading } = useSubscription();

  if (loading || !isActive || daysLeft > 7) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-indigo-600 text-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex w-0 flex-1 items-center">
              <span className="flex rounded-lg bg-indigo-800 p-2">
                <AlertCircle className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
              <p className="ml-3 truncate font-medium text-white">
                <span className="md:hidden">
                  {isTrial ? 'Trial' : 'Pro'} ends in {daysLeft} days
                </span>
                <span className="hidden md:inline">
                  Your {isTrial ? 'free trial' : 'subscription'} will expire in {daysLeft} days. Pay ₹50 to continue.
                </span>
              </p>
            </div>
            <div className="order-3 mt-2 w-full flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
              <Link
                href="/billing"
                className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm hover:bg-indigo-50"
              >
                Renew Now
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
