'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { GlobeIcon } from 'lucide-react';
import { nanoid } from '@/app/utils/nanoid';
import { JOB_MATCH_PROMPT_TOKEN } from '@/app/constants';

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
  StyledMessage,
  LoadingIndicator,
  EmptyState,
} from '@/app/customs/chat-interface/chat-components';
import {
  getAvailableModels
} from  '@/app/utils/ai-model-services/ModelRegistry';

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const ChatInputWindowComponent = () => {
  const [text, setText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationIdRef = useRef<string>(nanoid());

  const availableModels = getAvailableModels()
  // Initialize with environment's detail model
  const [selectedModel, setSelectedModel] = useState<string>(availableModels[0].id);
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);

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

    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files, // Files are included here
      },
      {
        body: {
          selectedModel: selectedModel,
          webSearch: useWebSearch,
          conversationId: conversationIdRef.current,
        },
      }
    );
  
    setText('');
  };

  // Handle regenerate - regenerate the last assistant message
  const handleRegenerate = () => {
    regenerate({
      body: {
        model: selectedModel,
        webSearch: useWebSearch,
        conversationId: conversationIdRef.current,
      }
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setText(suggestion);
    textareaRef.current?.focus();
  };

  const handleModelChange = (switchedModel: string) => {
    setSelectedModel(switchedModel);
  }
  
  const handleJobMatchDecision = (decision: 'yes' | 'no') => {
    if (isLoading) {
      return;
    }
    sendMessage(
      { text: decision },
      {
        body: {
          selectedModel: selectedModel,
          webSearch: useWebSearch,
          conversationId: conversationIdRef.current,
        },
      }
    );
  };

  const jobMatchPromptIds = useMemo(() => {
    return new Set(
      messages
        .filter((message) => message.role === 'assistant')
        .filter((message) =>
          message.parts.some(
            (part) => part.type === 'text' && part.text?.includes(JOB_MATCH_PROMPT_TOKEN)
          )
        )
        .map((message) => message.id)
    );
  }, [messages]);

  return (
    <div
      className="w-full h-screen flex flex-col rounded-xl border shadow-sm overflow-hidden"
      style={{
        height: 'calc(100vh - 100px)',
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
                <div key={message.id} className="flex flex-col">
                  <StyledMessage
                    message={message}
                    isLatest={index === messages.length - 1 && message.role === 'assistant'}
                    themeStyle={messageThemeStyle}
                    onRegenerate={handleRegenerate}
                  />
                  {jobMatchPromptIds.has(message.id) && (
                    <div className="flex gap-2 pl-12">
                      <button
                        type="button"
                        className="rounded-full border px-4 py-1 text-sm transition hover:opacity-80"
                        style={{
                          borderColor: chatWindowThemeStyle.borderColor,
                          color: chatWindowThemeStyle.color,
                        }}
                        onClick={() => handleJobMatchDecision('yes')}
                        disabled={isLoading}
                      >
                        Yes, update my resume
                      </button>
                      <button
                        type="button"
                        className="rounded-full border px-4 py-1 text-sm transition hover:opacity-80"
                        style={{
                          borderColor: chatWindowThemeStyle.borderColor,
                          color: chatWindowThemeStyle.color,
                        }}
                        onClick={() => handleJobMatchDecision('no')}
                        disabled={isLoading}
                      >
                        No, thanks
                      </button>
                    </div>
                  )}
                </div>
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
              <PromptInputButton
                onClick={() => setUseWebSearch(!useWebSearch)}
                variant={useWebSearch ? 'default' : 'ghost'}
                className={useWebSearch ? 'bg-violet-500 hover:bg-violet-600 text-white' : ''}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              {/* equals to onValueChange={(value) => handleModelChange(value)} */}
              <PromptInputSelect
                onValueChange={(value) => handleModelChange(value)}
                value={selectedModel}
              >
                <PromptInputSelectTrigger>
                  <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  {availableModels.map((model) => (
                    <PromptInputSelectItem key={model.id} value={model.id}>
                      {model.name}
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
