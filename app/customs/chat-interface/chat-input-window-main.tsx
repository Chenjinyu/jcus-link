'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, FileUIPart } from 'ai';
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
import { envConfig } from '@/app/configs/environment';
import { getAvailableModels } from '@/app/utils/ai-model-services/types';

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const ChatInputWindowComponent = () => {
  const [text, setText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // get the first one model as default.
  const [model, setModel] = useState<string>(models[0].id);
  
  // Get available models based on environment
  const availableModels = getAvailableModels();

  // Initialize with environment's detail model
  const [selectedModel, setSelectedModel] = useState<string>(envConfig.defaultModel);
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

  // Effect to enforce environment-specific model constrainsts
  useEffect(() => {
    if (envConfig.enableLocalOllama && !selectedModel.startsWith('ollama/')) {
      console.warn('[ChatComponent] Local environment detected, switching to Ollama model');
      setSelectedModel(envConfig.defaultModel);
    }
  }, [selectedModel]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    if (envConfig.debugMode) {
      console.log('[ChatComponent] Submitting message:', {
        environment: envConfig.env,
        model: selectedModel,
        hasAttachments: hasAttachments,
      });
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
        },
      }
    );
  
    setText('');
  };

  // Handle regenerate - regenerate the last assistant message
  const handleRegenerate = () => {
    if (envConfig.debugMode) {
      console.log('[ChatComponent] Regenerating with model:', selectedModel);
    }

    regenerate({
      body: {
        model: selectedModel,
        webSearch: useWebSearch,
      }
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setText(suggestion);
    textareaRef.current?.focus();
  };

  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);

    if (envConfig.debugMode) {
      console.log('[ChatComponent] Model changed to:', newModel);
    } 
  }

  return (
    <div
      className="w-full h-1/2 md:h-full flex flex-col rounded-xl border shadow-sm overflow-hidden"
      style={{
        backgroundColor: chatWindowThemeStyle.backgroundColor,
        borderColor: chatWindowThemeStyle.borderColor,
        color: chatWindowThemeStyle.color,
      }}
    >
      {/* Environment Indicator (Debug Mode) */}
      {envConfig.debugMode && (
        <div 
          className="text-xs px-4 py-2 opacity-60 border-b"
          style={{
            borderColor: chatWindowThemeStyle.borderColor,
            backgroundColor: envConfig.env === 'local' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)',
          }}
        >
          Environment: <span className="font-semibold">{envConfig.env}</span>
        </div>
      )}
        
      {/* Conversation Area */}
      <Conversation className="overflow-y-auto">
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
                onValueChange={handleModelChange}
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