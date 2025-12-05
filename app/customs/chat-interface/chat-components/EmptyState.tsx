'use client';

import { Sparkles } from 'lucide-react';
// Theme context
import { ThemeColorStyle, isDarkTheme, ThemeKeys } from '@/app/context/ThemeContext';

// =============================================================================
// EMPTY STATE
// =============================================================================
export interface EmptyStateProps {
  theme: string;
  themeStyle: ThemeColorStyle;
  onSuggestionClick: (text: string) => void;
}

export const EmptyState = ({ theme, themeStyle, onSuggestionClick }: EmptyStateProps) => {
  const isDark = isDarkTheme(theme as ThemeKeys);
  const suggestions = [
    "What can you help me with?",
    "Tell me about yourself",
    "How does this work?",
    "What are your capabilities?",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4">
      <div 
        className={`
          flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-6
          ${isDark ? '' : 'bg-gradient-to-br from-violet-500 to-purple-600'}
        `}
      >
        <Sparkles size={32} style={{ color: isDark ? '#1f2937' : '#ffffff' }} />
      </div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: themeStyle.color }}>
        Start a conversation
      </h2>
      <p className="text-sm opacity-60 mb-6 text-center max-w-md" style={{ color: themeStyle.color }}>
        Ask me anything. I&apos;m here to help with questions, tasks, and creative projects.
      </p>
      
      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 justify-center max-w-lg">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="px-4 py-2 rounded-full text-sm border transition-all duration-200 hover:scale-105"
            style={{
              borderColor: themeStyle.borderColor,
              color: themeStyle.color,
              backgroundColor: 'transparent',
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};