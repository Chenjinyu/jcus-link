'use client';

import { Copy, RefreshCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from '@/components/ai-elements/message';
import { MessageRole } from '@/app/types';
import { Avatar } from '@/app/customs/chat-interface/chat-components/Avatar';
import { RoleLabel } from '@/app/customs/chat-interface/chat-components/RoleLabel';
import { ThemeColorStyle } from '@/app/context/ThemeContext';

// =============================================================================
// STYLED MESSAGE WRAPPER
// =============================================================================
export interface StyledMessageProps {
  message: {
    id: string;
    role: MessageRole;
    parts: Array<{ type: string; text?: string }>;
  };
  isLatest: boolean;
  theme: 'Black' | 'darkBlue' | 'lightOrange' | 'light';
  themeStyle: ThemeColorStyle;
  onRegenerate?: () => void;
}

export const StyledMessage = ({ 
  message, 
  isLatest, 
  theme, 
  themeStyle, 
  onRegenerate 
}: StyledMessageProps) => {
  // const isDark = isDarkTheme(theme);
  const isUser = message.role === 'user';
  const textContent = message.parts
    .filter(part => part.type === 'text')
    .map(part => part.text)
    .join('\n');

  // // Get user message bubble styles based on theme
  // const getUserBubbleStyle = () => {
  //   if (isDark) {
  //     // Dark themes: white background
  //     return {
  //       backgroundColor: '#ffffff',
  //       color: '#1f2937', // dark-gray text
  //     };
  //   } else {
  //     // Light themes: dark-gray background
  //     return {
  //       backgroundColor: '#ffffff', // dark-gray (gray-600)
  //       color: '#ffffff', // white text
  //     };
  //   }
  // };

  // Handle copy action
  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
  };

  return (
    <div className={`group flex gap-3 ${isUser ? 'flex-row-reverse' : ''} py-4`}>
      {/* Avatar */}
      <Avatar 
        role={message.role} 
      />

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
        {/* Role Label */}
        <RoleLabel role={message.role} />

        {/* Message Bubble */}
        <div
          className={`
            ${isUser
              ? 'flex flex-col gap-4'
              : 'max-w-full [&_.is-assistant]:bg-transparent [&_*]:bg-transparent'
            }
          `}
          style={isUser ? themeStyle : undefined}
        >
          <Message 
            from={message.role}
            className="!bg-transparent [&>*]:!bg-transparent"
            style={{ backgroundColor: 'transparent' }}
          >
            <MessageContent
              className="!bg-transparent [&>*]:!bg-transparent"
              style={{ backgroundColor: 'transparent' }}
            >
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return (
                      <MessageResponse key={`${message.id}-${i}`}>
                        {part.text}
                      </MessageResponse>
                    );
                  default:
                    return null;
                }
              })}
            </MessageContent>
          </Message>
        </div>

        {/* Actions for assistant messages - using AI Elements components */}
        {!isUser && (
          <MessageActions className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <MessageAction
              onClick={handleCopy}
              label="Copy"
            >
              <Copy className="size-3" />
            </MessageAction>
            {isLatest && onRegenerate && (
              <MessageAction
                onClick={onRegenerate}
                label="Regenerate"
              >
                <RefreshCcw className="size-3" />
              </MessageAction>
            )}
            <MessageAction
              onClick={() => console.log('Positive feedback')}
              label="Good response"
            >
              <ThumbsUp className="size-3" />
            </MessageAction>
            <MessageAction
              onClick={() => console.log('Negative feedback')}
              label="Bad response"
            >
              <ThumbsDown className="size-3" />
            </MessageAction>
          </MessageActions>
        )}
      </div>
    </div>
  );
};