'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

interface Settings {
  totalSeats: number;
  messageTemplate: string;
  libraryName: string;
}

const DEFAULT_SETTINGS: Settings = {
  totalSeats: 50,
  libraryName: 'StuManage app',
  messageTemplate: `Namaste 🙏

This is a friendly reminder that the monthly fee of ₹[Amount] for [Student Name] is due on [Due Date].

Kindly make the payment on time.

Thank you,
[Teacher / Library Name]`,
};

export function useSettings() {
  const { supabaseUser } = useAuth();
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== 'undefined') {
      const lastUid = localStorage.getItem('last_auth_uid');
      if (lastUid) {
        const cached = localStorage.getItem(`settings_${lastUid}`);
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch (e) {
            console.error('Failed to parse initial cached settings', e);
          }
        }
      }
    }
    return DEFAULT_SETTINGS;
  });
  const [isLoaded, setIsLoaded] = useState(() => {
    if (typeof window !== 'undefined') {
      const lastUid = localStorage.getItem('last_auth_uid');
      if (lastUid && localStorage.getItem(`settings_${lastUid}`)) {
        return true;
      }
    }
    return false;
  });

  const fetchSettings = useCallback(async () => {
    if (!supabaseUser) {
      setSettings(DEFAULT_SETTINGS);
      setIsLoaded(true);
      return;
    }

    // Load cached settings immediately
    const cached = localStorage.getItem(`settings_${supabaseUser.id}`);
    if (cached) {
      try {
        setSettings(JSON.parse(cached));
        setIsLoaded(true);
      } catch (e) {
        console.error('Failed to parse cached settings', e);
      }
    }

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('owner_id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        console.warn('Supabase settings fetch error:', error.message);
      } else if (data) {
        const fetchedSettings = {
          totalSeats: data.total_seats,
          libraryName: data.library_name,
          messageTemplate: data.message_template,
        };
        setSettings(fetchedSettings);
        localStorage.setItem(`settings_${supabaseUser.id}`, JSON.stringify(fetchedSettings));
      }
    } catch (e) {
      console.error('Failed to fetch settings from Supabase', e);
    }
    setIsLoaded(true);
  }, [supabaseUser]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!supabaseUser) return;

    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(`settings_${supabaseUser.id}`, JSON.stringify(updated));

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          owner_id: supabaseUser.id,
          total_seats: updated.totalSeats,
          library_name: updated.libraryName,
          message_template: updated.messageTemplate,
        }, { onConflict: 'owner_id' });
      
      if (error) {
        console.error('Supabase settings upsert error:', error.message);
        throw error;
      }
    } catch (e) {
      console.error('Failed to update settings in Supabase', e);
      throw e;
    }
  };

  return { settings, updateSettings, isLoaded };
}
