// frontend/app/context/ThemeContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme Keys - Single source of truth
export enum ThemeKeys {
  BLACK = 'Black',
  DARK_BLUE = 'Dark Blue',
  LIGHT_ORANGE = 'Light Orange',
  LIGHT = 'light',
}

// Component Style Types
export interface ThemeColorStyle {
  backgroundColor: string;
  color: string;
  borderColor?: string;
}

export interface ComponentThemeStyles {
  document: ThemeColorStyle; 
  navigator: ThemeColorStyle;
  oauthButton: ThemeColorStyle;
  chatWindow: ThemeColorStyle;
  message: ThemeColorStyle; // message style is in the conversation, the message style
  emptyMessageState: ThemeColorStyle; // when open the /chat page, its defualt page
  userAvatar: ThemeColorStyle;
  assisstantAvator: ThemeColorStyle;
  button: ThemeColorStyle;
  input: ThemeColorStyle;
  divider?: ThemeColorStyle;
}

// Complete Theme Configuration
type ThemeConfigType = {
  [key in ThemeKeys]: ComponentThemeStyles;
}

export const COMMON_COLOR_STYLE: ThemeConfigType = {
  [ThemeKeys.BLACK]: {
    document: {
      backgroundColor: 'rgba(2, 2, 2, 1)',
      color: '#ffffff',
    },
    navigator: {
      backgroundColor: 'rgba(2, 2, 2, 1)',
      color: '#ffffff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    chatWindow: {
      backgroundColor: 'rgba(2, 2, 2, 1)',
      color: '#ffffff)',
    },
    message: {
      backgroundColor: '#ffffff',
      color: 'rgba(2, 2, 2, 1)',
    },
    emptyMessageState: {
      backgroundColor: 'rgba(2, 2, 2, 1)',
      color: '#ffffff',
    },
    userAvatar: {
      backgroundColor: 'rgba(225, 231, 240, 0.2)',
      color: 'rgba(2, 2, 2, 1)',
    },
    assisstantAvator: {
      backgroundColor: '#ffffff',
      color: '#1f2937', // dark gray
    },
    oauthButton: {
      borderColor: '#d1d5db',
      backgroundColor: '#ffffff',
      color: '#1f2937',
    },
    button: {
      backgroundColor: '#004059ff',
      color: '#ffffff',
      borderColor: 'rgba(2, 2, 2, 0.2)',
    },
    input: {
      backgroundColor: 'transparent',
      color: 'rgba(2, 2, 2, 1)',
      borderColor: 'rgba(2, 2, 2, 0.1)',
    },
    divider: {
      borderColor: 'rgba(255,255,255,0.15)',
      backgroundColor: 'transparent',
      color: 'rgba(2, 2, 2, 1)',
    },
  },

  [ThemeKeys.DARK_BLUE]: {
    document: {
      backgroundColor: 'rgba(1, 29, 43, 1)',
      color: '#ffffff',
    },
    navigator: {
      backgroundColor: 'rgba(1, 29, 43, 1)',
      color: '#ffffff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    chatWindow: {
      backgroundColor: 'rgba(1, 29, 43, 1)',
      color: '#ffffff',
    },
    message: {
      backgroundColor: '#ffffff',
      color: '#ffffff',
    },
    emptyMessageState: {
      backgroundColor: 'rgba(2, 2, 2, 1)',
      color: '#ffffff',
    },
    userAvatar: {
      backgroundColor: 'rgba(225, 231, 240, 0.2)',
      color: 'rgba(2, 2, 2, 1)',
    },
    assisstantAvator: {
      backgroundColor: '#ffffff',
      color: '#1f2937', // dark gray
    },
    oauthButton: {
      borderColor: '#d1d5db',
      backgroundColor: '#ffffff',
      color: '#1f2937',
    },
    button: {
      backgroundColor: '#004059ff',
      color: '#ffffff',
      borderColor: '#004059ff',
    },
    input: {
      backgroundColor: 'transparent',
      color: '#ffffff',
      borderColor: 'rgba(255,255,255,0.1)',
    },
    divider: {
      borderColor: 'rgba(255,255,255,0.15)',
      backgroundColor: 'transparent',
      color: '#ffffff',
    },
  },

  [ThemeKeys.LIGHT_ORANGE]: {
    document: {
      backgroundColor: 'rgb(255, 237, 213)',
      color: '#292524',
    },
    navigator: {
      backgroundColor: 'rgb(255, 237, 213)',
      color: '#292524',
      borderColor: '#fbbf24',
    },
    chatWindow: {
      backgroundColor: 'rgb(255, 237, 213)',
      color: '#ffffff)',
      borderColor: 'rgb(251, 191, 36)',
    },
    message: {
      backgroundColor: 'rgb(218, 223, 230)',
      color: 'rgb(2, 15, 33)',
      borderColor: 'rgb(251, 191, 36)',
    },
    emptyMessageState: {
      backgroundColor: 'rgb(255, 237, 213)',
      color: '#000000',
      borderColor: 'rgb(251, 191, 36)',
    },
    userAvatar: {
      backgroundColor: 'rgba(193, 204, 219)',
      color: 'rgba(2, 2, 2, 1)',
    },
    assisstantAvator: {
      backgroundColor: '#ffffff',
      color: '#1f2937', // dark gray
    },
    oauthButton: {
      borderColor: '#d1d5db',
      backgroundColor: '#ffffff',
      color: '#1f2937',
    },
    button: {
      backgroundColor: '#004059ff',
      color: '#ffffff',
      borderColor: '#004059ff',
    },
    input: {
      backgroundColor: 'transparent',
      color: 'rgb(255, 237, 213)',
      borderColor: '#d1d5db',
    },
    divider: {
      borderColor: '#d1d5db',
      backgroundColor: 'transparent',
      color: 'rgb(255, 237, 213)',
    },
  },

  [ThemeKeys.LIGHT]: {
    document: {
      backgroundColor: '#ffffff',
      color: '#111111',
    },
    navigator: {
      backgroundColor: '#ffffff',
      color: '#111111',
      borderColor: '#e5e7eb',
    },
    chatWindow: {
      backgroundColor: '#ffffff',
      color: '#ffffff',
    },
    message: {
      backgroundColor: 'rgb(2, 15, 33)',
      color: 'rgb(225, 230, 237)',
    },
    emptyMessageState: {
      backgroundColor: 'rgb(255, 237, 213)',
      color: '#000000',
    },
    userAvatar: {
      backgroundColor: 'rgba(193, 204, 219)',
      color: 'rgba(2, 2, 2, 1)',
    },
    assisstantAvator: {
      backgroundColor: '#ffffff',
      color: '#1f2937', // dark gray
    },
    oauthButton: {
      borderColor: '#d1d5db',
      backgroundColor: '#ffffff',
      color: '#1f2937',
    },
    button: {
      backgroundColor: '#004059ff',
      color: '#ffffff',
      borderColor: '#004059ff',
    },
    input: {
      backgroundColor: 'transparent',
      color: '#1f2937',
      borderColor: '#d1d5db',
    },
    divider: {
      borderColor: '#d1d5db',
      backgroundColor: 'transparent',
      color: '#1f2937',
    },
  },
}

// Helper functions
export function getComponentStyle(
  themeKey: ThemeKeys,
  component: keyof ComponentThemeStyles
): ThemeColorStyle {
  const style = COMMON_COLOR_STYLE[themeKey][component];
  if (!style) {
    throw new Error(`Style not found for theme`);
  }
  return style;
}

export function isDarkTheme(themeKey: ThemeKeys): boolean {
  return themeKey === ThemeKeys.BLACK || themeKey === ThemeKeys.DARK_BLUE;
}

export function getThemeStyles(themeKey: ThemeKeys): ComponentThemeStyles {
  return COMMON_COLOR_STYLE[themeKey];
}

interface ThemeContextType {
  theme: ThemeKeys;
  setTheme: (theme: ThemeKeys) => void;
}

// Create Theme Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider Component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // gets theme.BLACK as the default value.
  const [theme, setTheme] = useState<ThemeKeys>(ThemeKeys.BLACK);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as ThemeKeys;
    if (savedTheme && Object.values(ThemeKeys).includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme styles to document/root component using centralized configuration
  useEffect(() => {
    const styles = getComponentStyle(theme, 'document');
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


export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Deprecated: Kept for backward compatibility, use getComponentStyle instead
export function getMessageColorStyle(
  color_name: 'Black' | 'darkBlue' | 'lightOrange' | 'light'
): ThemeColorStyle {
  const themeKey = color_name as unknown as ThemeKeys;
  return getComponentStyle(themeKey, 'message');
}