'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

const SETTINGS_KEY = 'libmanager_settings';

interface Settings {
  totalSeats: number;
  messageTemplate: string;
  libraryName: string;
}

const DEFAULT_SETTINGS: Settings = {
  totalSeats: 50,
  libraryName: 'My Library',
  messageTemplate: `Namaste 🙏

This is a friendly reminder that the monthly fee of ₹[Amount] for [Student Name] is due on [Due Date].

Kindly make the payment on time.

Thank you,
[Teacher / Library Name]`,
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
          if (error.message.includes('schema cache')) {
            console.warn('Supabase settings table missing. Using local storage.');
          } else {
            console.warn('Supabase settings fetch error:', error.message);
          }
          const saved = localStorage.getItem(SETTINGS_KEY);
          if (saved) setSettings(JSON.parse(saved));
        } else if (data) {
          setSettings({
            totalSeats: data.total_seats,
            libraryName: data.library_name,
            messageTemplate: data.message_template,
          });
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
        const dbSettings = {
          user_id: user.id,
          total_seats: updated.totalSeats,
          library_name: updated.libraryName,
          message_template: updated.messageTemplate,
        };

        const { error } = await supabase
          .from('settings')
          .upsert(dbSettings, { onConflict: 'user_id' });
        
        if (error) {
          if (error.message.includes('schema cache')) {
            console.warn('Supabase settings table missing. Settings saved locally only.');
          } else {
            console.error('Supabase settings upsert error:', error.message);
          }
        }
      } catch (e) {
        console.error('Failed to update settings in Supabase', e);
      }
    }
  };

  return { settings, updateSettings };
}
