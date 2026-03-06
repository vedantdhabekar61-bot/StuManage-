'use client';

import { useState, useEffect } from 'react';

const SETTINGS_KEY = 'libmanager_settings';

interface Settings {
  totalSeats: number;
}

const DEFAULT_SETTINGS: Settings = {
  totalSeats: 50,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse settings', e);
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  return { settings, updateSettings };
}
