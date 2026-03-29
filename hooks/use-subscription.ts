'use client';

import { useAuth } from '@/hooks/use-auth';

export function useSubscription() {
  const { user, isLoaded } = useAuth();

  const isSubscriptionActive = () => {
    if (!user || !user.subscription) return true; // Default to true while loading

    const now = new Date();
    const expiry = new Date(user.subscription.expiryDate);

    return now < expiry || user.subscription.status === 'active';
  };

  const daysLeft = () => {
    if (!user || !user.subscription) return 0;
    const now = new Date();
    const expiry = new Date(user.subscription.expiryDate);

    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  return {
    profile: user ? {
      id: user.id,
      email: user.email,
      trial_start_date: user.createdAt,
      trial_end_date: user.subscription?.expiryDate,
      is_pro: user.subscription?.status === 'active',
      pro_expiry_date: user.subscription?.expiryDate
    } : null,
    loading: !isLoaded,
    isActive: isSubscriptionActive(),
    daysLeft: daysLeft(),
    isTrial: user?.subscription?.status === 'trial'
  };
}
