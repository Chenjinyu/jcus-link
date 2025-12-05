'use client';

import { Sparkles } from 'lucide-react';
import { isDarkTheme, ThemeKeys } from '@/app/context/ThemeContext';

// =============================================================================
// LOADING INDICATOR
// =============================================================================
export interface LoadingIndicatorProps {
  theme: string;
}

export const LoadingIndicator = ({ theme }: LoadingIndicatorProps) => {
  const isDark = isDarkTheme(theme as ThemeKeys);

  return (
    <div className="flex gap-3 py-4">
      <div 
        className={`
          flex items-center justify-center w-8 h-8 rounded-full shrink-0 shadow-sm
          ${isDark ? '' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'}
        `}
        style={isDark ? { backgroundColor: '#ffffff', color: '#1f2937' } : undefined}
      >
        <Sparkles size={16} />
      </div>
      <div>
        <div className="text-xs font-medium opacity-60 mb-1.5">Assistant</div>
        <div className="flex items-center gap-1.5 py-2">
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ 
              animationDelay: '0ms',
              backgroundColor: isDark ? '#9ca3af' : '#a78bfa'
            }} 
          />
          <div 
            className="w-2 h-2 rounded-full animate-bounce" 
            style={{ 
              animationDelay: '150ms',
              backgroundColor: isDark ? '#9ca3af' : '#a78bfa'
            }} 
          />
          <div 
            className="w-2 h-2 rounded-full animate-bounce" 
            style={{ 
              animationDelay: '300ms',
              backgroundColor: isDark ? '#9ca3af' : '#a78bfa'
            }} 
          />
        </div>
      </div>
    </div>
  );
};