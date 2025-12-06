'use client';

import React, { useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { GlobeIcon } from 'lucide-react';

// AI Elements imports
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputHeader,
  PromptInputFooter,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';

// Theme context
import { useTheme, getComponentStyle } from '@/app/context/ThemeContext';
// Local chat components
import {
  models,
  StyledMessage,
  LoadingIndicator,
  EmptyState,
} from '@/app/customs/chat-interface/chat-components';

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const ChatInputWindowComponent = () => {
  const [text, setText] = useState<string>('');
  const [model, setModel] = useState<string>(models[0].id);
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // AI SDK 5.0 useChat hook with transport for custom API endpoint
  const { messages, status, sendMessage, regenerate, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });
    

  const { theme } = useTheme();

  // the message buddle in the converation
  const messageThemeStyle = getComponentStyle(theme, 'message');
  // the chat page theme style should follow with the parent
  const chatWindowThemeStyle = getComponentStyle(theme, 'chatWindow');

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    // Use sendMessage with body for additional data
    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files,
      },
      {
        body: {
          model: model,
          webSearch: useWebSearch,
        },
      }
    );
    setText('');
  };

  // Handle regenerate - regenerate the last assistant message
  const handleRegenerate = () => {
    regenerate({
      body: {
        model: model,
        webSearch: useWebSearch,
      }
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setText(suggestion);
    textareaRef.current?.focus();
  };

  return (
    <div
      className="w-full h-1/2 md:h-full flex flex-col rounded-xl border shadow-sm overflow-hidden"
      style={{
        backgroundColor: chatWindowThemeStyle.backgroundColor,
        borderColor: chatWindowThemeStyle.borderColor,
        color: chatWindowThemeStyle.color,
      }}
    >
      {/* Conversation Area */}
      <Conversation className="flex-1 min-h-0 overflow-y-auto">
        <ConversationContent className="px-4">
          {messages.length === 0 ? (
            <EmptyState 
              onSuggestionClick={handleSuggestionClick} 
            />
          ) : (
            <>
              {messages.map((message, index) => (
                <StyledMessage
                  key={message.id}
                  message={message}
                  isLatest={index === messages.length - 1 && message.role === 'assistant'}
                  themeStyle={messageThemeStyle}
                  onRegenerate={handleRegenerate}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <LoadingIndicator theme={theme} />
              )}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input Area */}
      <div 
        className="w-full px-4 pb-4"
        style={{ border: 'none' }}
      >
        <PromptInput 
          onSubmit={handleSubmit} 
          globalDrop 
          multiple
        >
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              ref={textareaRef}
              value={text}
              placeholder="Send a message..."
              style={{
                backgroundColor: 'transparent',
                color: chatWindowThemeStyle.color,
                border: chatWindowThemeStyle.borderColor,
                outline: 'none',
                boxShadow: 'none',
              }}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputSpeechButton
                onTranscriptionChange={setText}
                textareaRef={textareaRef}
              />
              <PromptInputButton
                onClick={() => setUseWebSearch(!useWebSearch)}
                variant={useWebSearch ? 'default' : 'ghost'}
                className={useWebSearch ? 'bg-violet-500 hover:bg-violet-600 text-white' : ''}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputSelectTrigger>
                  <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  {models.map((m) => (
                    <PromptInputSelectItem key={m.id} value={m.id}>
                      {m.name}
                    </PromptInputSelectItem>
                  ))}
                </PromptInputSelectContent>
              </PromptInputSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!text && !status} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>

      {/* Footer */}
      <div 
        className="text-center py-2 text-[10px] opacity-40 border-t"
        style={{ 
          borderColor: chatWindowThemeStyle.borderColor,
          color: chatWindowThemeStyle.color 
        }}
      >
        AI can make mistakes. Please verify important information.
      </div>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export const ChatInputWindow = React.memo(ChatInputWindowComponent);