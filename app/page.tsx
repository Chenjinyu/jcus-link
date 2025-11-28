'use client';

import React from "react";
import { ChatInputWindow } from '@/app/customs/chat-interface/chat-input-window';

export default function Page() {
  
  return (
    <main className="w-full h-full">
      <React.Suspense fallback={<p>Loading...</p>}>
        <ChatInputWindow>

        </ChatInputWindow>
      </React.Suspense>
    </main>
  );
}