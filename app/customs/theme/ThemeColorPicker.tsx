// frontend/app/components/ThemeColorPicker.tsx
'use client';

import React from 'react';
import { useTheme, Theme, THEME_STYLES } from '@/app/context/ThemeContext';
import { Palette } from 'lucide-react';

export default function ThemeColorPicker() {
  const { theme, setTheme } = useTheme();

  const themeColors = {
    [Theme.LIGHT]: '#ffffff',
    [Theme.DARK_BLUE]: 'rgb(17, 17, 17)',
    [Theme.LIGHT_BLACK]: 'rgb(28, 29, 28)',
    [Theme.LIGHT_ORANGE]: 'rgb(255, 237, 213)',
  };

  const themeLabels = {
    [Theme.LIGHT]: 'Light',
    [Theme.DARK_BLUE]: 'Dark Blue',
    [Theme.LIGHT_BLACK]: 'Light Black',
    [Theme.LIGHT_ORANGE]: 'Light Orange',
  };

  return (
    <div className="flex items-center gap-2">
      <Palette className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      <div className="flex bg-gray-200/20 p-1 rounded-full border border-gray-300 dark:border-white/10">
        {(Object.keys(THEME_STYLES) as Theme[]).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`w-6 h-6 rounded-full mx-1 transition-transform hover:scale-110 border-2 ${
              theme === t ? 'border-blue-500 scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: themeColors[t] }}
            aria-label={`Switch to ${themeLabels[t]} theme`}
            title={themeLabels[t]}
          />
        ))}
      </div>
    </div>
  );
}