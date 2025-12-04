'use client';

import { Sparkles, User } from 'lucide-react';
import { MessageRole } from '@/app/types';
import { isDarkTheme } from '@/app/utils/theme-utils';

// =============================================================================
// AVATAR COMPONENT
// =============================================================================
export interface AvatarProps {
  role: MessageRole;
  theme: string;
  themeStyle: Record<string, string>;
}

export const Avatar = ({ role, theme, themeStyle }: AvatarProps) => {
  const isUser = role === 'user';
  const isDark = isDarkTheme(theme);

  // Assistant avatar styles based on theme
  const getAssistantAvatarStyle = () => {
    if (isDark) {
      // Dark theme: white bg, dark icon
      return {
        backgroundColor: '#ffffff',
        color: '#1f2937', // dark gray
      };
    } else {
      // Light themes: keep the gradient (handled by className)
      return undefined;
    }
  };

  return (
    <div
      className={`
        flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-sm font-medium
        transition-all duration-200
        ${isUser 
          ? ''
          : isDark
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' 
            : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm'
        }
      `}
      style={isUser 
        ? { 
          backgroundColor: themeStyle.color,
          color: themeStyle.backgroundColor 
        }
        : getAssistantAvatarStyle()
      }
    >
      {isUser ? <User size={16} /> : <Sparkles size={16} />}
    </div>
  );
};