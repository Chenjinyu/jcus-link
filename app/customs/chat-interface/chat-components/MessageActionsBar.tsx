'use client';

import { useState } from 'react';
import { Copy, RefreshCcw, ThumbsUp, ThumbsDown } from 'lucide-react';

// =============================================================================
// MESSAGE ACTIONS BAR COMPONENT
// =============================================================================
export interface MessageActionsBarProps {
  content: string;
  isLatest: boolean;
  onRegenerate?: () => void;
}

/**
 * The MessageActionBar will appear after assistant responded an answer.
 */
export const MessageActionsBar = ({ content, isLatest, onRegenerate }: MessageActionsBarProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
        title="Copy"
      >
        <Copy size={14} />
      </button>
      {isLatest && onRegenerate && (
        <button
          onClick={onRegenerate}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          title="Regenerate"
        >
          <RefreshCcw size={14} />
        </button>
      )}
      <button
        className="p-1.5 rounded-md text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
        title="Good response"
      >
        <ThumbsUp size={14} />
      </button>
      <button
        className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        title="Bad response"
      >
        <ThumbsDown size={14} />
      </button>
      {copied && (
        <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-2 animate-fade-in">
          Copied!
        </span>
      )}
    </div>
  );
};