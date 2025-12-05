'use client';

import { Sparkles, User } from 'lucide-react';
import { MessageRole } from '@/app/types';
import { useTheme, getComponentStyle, isDarkTheme, ThemeKeys } from '@/app/context/ThemeContext';

// =============================================================================
// AVATAR COMPONENT
// =============================================================================
export interface AvatarProps {
  role: MessageRole;
}

export const Avatar = ({ role }: AvatarProps) => {
  const isUser = role === 'user';
  const { theme } = useTheme();
  const isDark = isDarkTheme(theme as ThemeKeys);

  const userAvatarThemeStyle = getComponentStyle(theme as ThemeKeys, 'userAvatar');
  const assisstantAvatarThemeStyle = getComponentStyle(theme as ThemeKeys, 'assisstantAvator');

  const avatarStyle = isUser ? userAvatarThemeStyle : assisstantAvatarThemeStyle;
  
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
      style={{
        backgroundColor: avatarStyle.backgroundColor,
        color: avatarStyle.color,
      }}
    >
      {isUser ? <User size={16} /> : <Sparkles size={16} />}
    </div>
  );
};