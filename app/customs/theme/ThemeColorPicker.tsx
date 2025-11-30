'use client';

import React from 'react';
import { useTheme, Theme, THEME_STYLES } from '@/app/context/ThemeContext';
import { Palette } from 'lucide-react';

export default function ThemeColorPicker() {
  const { theme, setTheme } = useTheme();

  const themeColors = {
    [Theme.LIGHT_BLACK]: 'rgba(2, 2, 2, 1)',
    [Theme.DARK_BLUE]: 'rgba(1, 29, 43, 1)',
    [Theme.LIGHT_ORANGE]: 'rgb(255, 237, 213)',
    [Theme.LIGHT]: '#ffffff',
  };

  const themeLabels = {
    [Theme.LIGHT_BLACK]: 'Light Black',
    [Theme.DARK_BLUE]: 'Dark Blue',
    [Theme.LIGHT_ORANGE]: 'Light Orange',
    [Theme.LIGHT]: 'Light',
  };

  return (
    <div className="flex items-center gap-2">
      {/* Icon adjusts size responsively */}
      <Palette className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />

      {/* Container grows on small screens */}
      <div className="
        flex p-1 rounded-full border
        bg-gray-200/30 dark:bg-white/10 
        border-gray-300 dark:border-white/10
        gap-1
      ">
        {(Object.keys(THEME_STYLES) as Theme[]).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            aria-label={`Switch to ${themeLabels[t]} theme`}
            title={themeLabels[t]}
            className={`
              rounded-full transition-transform
              border-2 
              ${theme === t ? 'scale-110 border-blue-500' : 'border-transparent'}
              w-5 h-5 sm:w-6 sm:h-6
            `}
            style={{
              backgroundColor: themeColors[t],
            }}
          />
        ))}
      </div>
    </div>
  );
}
