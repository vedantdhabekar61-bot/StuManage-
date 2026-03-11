'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

const SETTINGS_KEY = 'libmanager_settings';

interface Settings {
  totalSeats: number;
  messageTemplate: string;
  reminderTiming: {
    twoDaysBefore: boolean;
    onDueDate: boolean;
    threeDaysAfter: boolean;
  };
  libraryName: string;
}

const DEFAULT_SETTINGS: Settings = {
  totalSeats: 50,
  libraryName: 'My Library',
  messageTemplate: `Namaste 🙏

This is a friendly reminder that the monthly fee of ₹[Amount] for [Student Name] is due on [Due Date].

Kindly make the payment on time.

Thank you,
[Library Name]`,
  reminderTiming: {
    twoDaysBefore: true,
    onDueDate: true,
    threeDaysAfter: true,
  },
};

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
          try {
            setSettings(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to parse local settings', e);
          }
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.warn('Supabase settings fetch error:', error.message);
          const saved = localStorage.getItem(SETTINGS_KEY);
          if (saved) setSettings(JSON.parse(saved));
        } else if (data) {
          setSettings(data as Settings);
        }
      } catch (e) {
        console.error('Failed to fetch settings from Supabase', e);
      }
    };

    fetchSettings();
  }, [user]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));

    if (user) {
      try {
        const { error } = await supabase
          .from('settings')
          .upsert({ ...updated, user_id: user.id }, { onConflict: 'user_id' });
        
        if (error) console.error('Supabase settings upsert error:', error.message);
      } catch (e) {
        console.error('Failed to update settings in Supabase', e);
      }
    }
  };

  return { settings, updateSettings };
}
