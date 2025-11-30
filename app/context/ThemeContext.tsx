// frontend/app/context/ThemeContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export enum Theme {
  LIGHT = 'light',
  DARK_BLUE = 'darkBlue',
  LIGHT_BLACK = 'lightBlack',
  LIGHT_ORANGE = 'lightOrange',
}

export const THEME_STYLES = {
  [Theme.LIGHT_BLACK]: {
    backgroundColor: 'rgba(2, 2, 2, 1)',
    color: '#ffffff',
    navbarBg: 'rgba(2, 2, 2, 1)',
    navbarText: '#ffffff',
    navbarBorder: 'rgba(255, 255, 255, 0.1)',
  },
  [Theme.DARK_BLUE]: {
    backgroundColor: 'rgba(1, 29, 43, 1)',
    color: '#ffffff',
    navbarBg: 'rgba(1, 29, 43, 1)',
    navbarText: '#ffffff',
    navbarBorder: 'rgba(255, 255, 255, 0.1)',
  },
  [Theme.LIGHT_ORANGE]: {
    backgroundColor: 'rgb(255, 237, 213)',
    color: '#292524',
    navbarBg: 'rgb(255, 237, 213)',
    navbarText: '#292524',
    navbarBorder: '#fbbf24',
  },
  [Theme.LIGHT]: {
    backgroundColor: '#ffffff',
    color: '#111111',
    navbarBg: '#ffffff',
    navbarText: '#111111',
    navbarBorder: '#e5e7eb',
  }
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT_BLACK);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme && Object.values(Theme).includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme styles to body and save to localStorage
  useEffect(() => {
    const styles = THEME_STYLES[theme];
    document.body.style.backgroundColor = styles.backgroundColor;
    document.body.style.color = styles.color;
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ✅ THIS IS THE HOOK - IT'S HERE!
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}