'use client';

import { useAuth } from '@/hooks/use-auth';
import { useMemo } from 'react';

export function useSubscription() {
  const { user, isLoaded } = useAuth();

  const status = useMemo(() => {
    if (!user || !user.subscription) {
      return {
        isActive: true, // Default to true while loading
        daysLeft: 0,
        isTrial: false,
        isPro: false,
        expiryDate: null
      };
    }

    const now = new Date();
    const expiry = new Date(user.subscription.expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, diffDays);

    return {
      isActive: now < expiry || user.subscription.status === 'active',
      daysLeft,
      isTrial: user.subscription.status === 'trial',
      isPro: user.subscription.status === 'active',
      expiryDate: user.subscription.expiryDate
    };
  }, [user]);

  return {
    profile: user ? {
      id: user.id,
      email: user.email,
      trial_start_date: user.createdAt,
      trial_end_date: user.subscription?.expiryDate,
      is_pro: status.isPro,
      pro_expiry_date: status.expiryDate
    } : null,
    loading: !isLoaded,
    ...status
  };
}
