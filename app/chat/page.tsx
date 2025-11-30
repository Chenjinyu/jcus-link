'use client';

import React from "react";
import { ChatInputWindow } from '@/app/customs/chat-interface/chat-input-window';

export default function ChatPage() {
  return (
    <div className="w-full flex flex-col min-h-[60vh]">
      {/* allow the chat area to grow and scroll naturally instead of forcing a viewport calc */}
      <div
        className="flex-1 px-4 sm:px-6 overflow-hidden"
        style={{
          paddingTop: `calc(20px + env(safe-area-inset-top, 0px))`,
          paddingBottom: `calc(20px + env(safe-area-inset-bottom, 0px))`
        }}
      >
        <div className="h-full">
          <React.Suspense fallback={<p>Loading...</p>}>
            <ChatInputWindow />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
}
