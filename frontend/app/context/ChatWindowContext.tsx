/**
useContext allows a component to subscribe to a context value created by React.createContext().
A context typically provides global/shared data to multiple components, such as:
- authenticated user info
- theme (dark/light mode)
- language settings
- app-wide config
- global state store (if not using Redux/Zustand/Jotai)
 */

"use client";

import {
    createContext, // useContext is a React Hook that lets you read values from a React Context inside your components without passing props manually through every level (“prop drilling”).
    Dispatch,
    ReactNode,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {  useToast } from "../hooks/useToast";
import { v4 as uuidv4 } from "uuid";
import { ModelOptions } from "../types";
import { useQueryState } from "nuqs";
import { useThreads } from "../hooks/useThreads";
import { useRuns } from "../hooks/useRuns";
import { useUser } from "../hooks/useUser";
import { messageContentToText } from "../utils/convert_messages";

export interface ChatWindowInput { 
    messages?: Record<string, any>[];
}

interface ChatWindowData { 
    runId: string | null;
    isStreaming: boolean;
    // messages: Message[];
    selectedModel: ModelOptions;
    setSelectedModel: Dispatch<SetStateAction<ModelOptions>>;
    setMessages: Dispatch<SetStateAction<Record<string, any>[]>>;
    streamMessage: (
        currentThreadId: string | null | undefined,
        params: ChatWindowInput,
    ) => Promise<void>;
    // switchSelectedThread: (thread: Thread) => void;
}

type UserDataContextType = ReturnType<typeof useUser>;
type ThreadsDataContextType = ReturnType<typeof useThreads>;

type ChatWindowType = {
    userData: UserDataContextType;
    threadsData: ThreadsDataContextType;
}
const ChatWindowContext = createContext<ChatWindowType | undefined>(undefined);

export function useChatWindowContext() { 
    const context = useContext(ChatWindowContext);
    if (context === undefined) {
        throw new Error(
            "useChatWindowContext must be used within a ChatWindowProvider",
        );
    }
    return context;
}