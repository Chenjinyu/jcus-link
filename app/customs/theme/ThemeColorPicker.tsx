'use client';

import React from 'react';
import { useTheme, ThemeKeys, getComponentStyle } from '@/app/context/ThemeContext';
import { Palette } from 'lucide-react';

export default function ThemeColorPicker() {
  const { theme, setTheme } = useTheme();

  // Get theme colors from centralized COMMON_COLOR_STYLE
  const themeColors: Record<ThemeKeys, string> = {
    [ThemeKeys.BLACK]: getComponentStyle(ThemeKeys.BLACK, 'document').backgroundColor,
    [ThemeKeys.DARK_BLUE]: getComponentStyle(ThemeKeys.DARK_BLUE, 'document').backgroundColor,
    [ThemeKeys.LIGHT_ORANGE]: getComponentStyle(ThemeKeys.LIGHT_ORANGE, 'document').backgroundColor,
    [ThemeKeys.LIGHT]: getComponentStyle(ThemeKeys.LIGHT, 'document').backgroundColor,
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
        {(Object.keys(ThemeKeys) as Array<keyof typeof ThemeKeys>).map((key) => {
          const themeKey = ThemeKeys[key];
          return (
            <button
              key={themeKey}
              onClick={() => setTheme(themeKey)}
              aria-label={`Switch to ${key} theme`}
              title={key}
              className={`
                rounded-full transition-transform
                border-2 
                ${theme === themeKey ? 'scale-110 border-blue-500' : 'border-transparent'}
                w-5 h-5 sm:w-6 sm:h-6
              `}
              style={{
                backgroundColor: themeColors[themeKey],
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
