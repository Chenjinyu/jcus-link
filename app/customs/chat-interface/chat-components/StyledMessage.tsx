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
  themeStyle: ThemeColorStyle;
  onRegenerate?: () => void;
}

export const StyledMessage = ({ 
  message, 
  isLatest, 
  themeStyle, 
  onRegenerate 
}: StyledMessageProps) => {
  // const isDark = isDarkTheme(theme);
  // message.role = 'assistant';
  const isUser = false; //message.role === 'user';
  const textContent = message.parts
    .filter(part => part.type === 'text')
    .map(part => part.text)
    .join('\n');
  
  // Handle copy action
  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
  };

    // Static message bubble styles with dynamic width
  const messageBubbleStyle: React.CSSProperties = {
    // Dynamic width: auto but max 70% of viewport
    width: 'fit-content',
    maxWidth: '70%',
    minWidth: '100px', // Optional: minimum width to avoid too small bubbles
    borderRadius: '8px',
    // padding: '12px 16px',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap', // Preserves line breaks
  };


  return (
    <div className={`group flex gap-3 ${isUser ? 'flex-row-reverse' : ''} py-4  w-full`}>
      {/* Avatar */}
      <Avatar 
        role={message.role} 
      />

      {/* Content */}
      <div className={`flex-1 min-w-0 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Role Label */}
        <RoleLabel role={message.role} />

        {/* Message Bubble */}
        <div
          className={`
            ${isUser
              ? 'flex gap-4'
              : ''
            }
          `}
          style={{
            ...themeStyle,
            ...messageBubbleStyle
          }}
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
          <MessageActions className="mt-2 group-hover:opacity-100  duration-200 text-gray-400" >
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