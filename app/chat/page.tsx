'use client';

import React from "react";
import { ChatInputWindow } from '@/app/customs/chat-interface/chat-input-window';

export default function ChatPage() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 px-6 overflow-hidden" style={{ 
        paddingTop: '20px',
        paddingBottom: '20px',
        height: 'calc(100vh - 4rem - 40px)'
      }}>
        <div className="h-full">
          <React.Suspense fallback={<p>Loading...</p>}>
            <ChatInputWindow />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
}