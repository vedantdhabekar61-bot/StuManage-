'use client';

import { useAuth } from '@/hooks/use-auth';

export function useSubscription() {
  const { user, isLoaded } = useAuth();

  const isSubscriptionActive = () => {
    if (!user) return true; // Default to true while loading

    const now = new Date();
    const trialEnd = new Date(user.trialEndDate);
    const proExpiry = user.proExpiryDate ? new Date(user.proExpiryDate) : null;

    if (now < trialEnd) return true;
    if (proExpiry && now < proExpiry) return true;

    return false;
  };

  const daysLeft = () => {
    if (!user) return 0;
    const now = new Date();
    const trialEnd = new Date(user.trialEndDate);
    const proExpiry = user.proExpiryDate ? new Date(user.proExpiryDate) : null;

    const targetDate = proExpiry && proExpiry > trialEnd ? proExpiry : trialEnd;
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  return {
    profile: user ? {
      id: user.id,
      email: user.email,
      trial_start_date: user.createdAt,
      trial_end_date: user.trialEndDate,
      is_pro: user.isPro,
      pro_expiry_date: user.proExpiryDate
    } : null,
    loading: !isLoaded,
    isActive: isSubscriptionActive(),
    daysLeft: daysLeft(),
    isTrial: user ? new Date() < new Date(user.trialEndDate) : true
  };
}
