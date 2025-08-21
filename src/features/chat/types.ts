/**
 * Restructuring note:
 * This file centralizes chat-specific TypeScript types that were previously
 * embedded inside the monolithic `useChat.ts` file. The goal is to make the
 * hook smaller and keep types reusable across helpers and API modules.
 */

import type { ChatMessage, FileAttachment, User } from '@/types/chat';

/**
 * Public interface exposed by the chat hook. Components should consume this.
 */
export interface ChatState {
  markdownContent: string;
  setMarkdownContent: (v: string) => void;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  creditsRemaining: number;
  setCreditsRemaining: React.Dispatch<React.SetStateAction<number>>;
  documentTitle: string;
  setDocumentTitle: (v: string) => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (v: boolean) => void;
  chatInputRef: React.RefObject<HTMLTextAreaElement>;
  handleChatSubmit: (message: string, attachments?: FileAttachment[]) => void;
  pendingFiles: FileAttachment[];
  setPendingFiles: React.Dispatch<React.SetStateAction<FileAttachment[]>>;
  removePendingFile: (fileId: string) => void;
  focusChat: () => void;
  isProcessing: boolean;
}

/**
 * Internal processing result used across helpers.
 */
export interface ProcessingResult {
  updatedMarkdown: string;
  responseMessage: string;
  hasUpdates?: boolean;
  credits?: number;
}

/**
 * Shape for direct API fallback response (differs from apiService response).
 */
export interface DirectApiResponse {
  updatedContent?: string;
  message?: string;
}

export type { ChatMessage, FileAttachment, User };
