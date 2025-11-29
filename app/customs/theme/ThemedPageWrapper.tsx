// frontend/app/components/ThemePageWrapper.tsx
'use client';

import React from 'react';
import { useTheme, THEME_STYLES } from '@/app/context/ThemeContext';

interface ThemedPageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function ThemedPageWrapper({ children, className = '' }: ThemedPageWrapperProps) {
  const { theme } = useTheme();
  const themeStyle = THEME_STYLES[theme];

  return (
    <div 
      className={className}
      style={{ 
        backgroundColor: themeStyle.backgroundColor,
        color: themeStyle.color,
        minHeight: 'calc(100vh - 4rem)',
      }}
    >
      {children}
    </div>
  );
}