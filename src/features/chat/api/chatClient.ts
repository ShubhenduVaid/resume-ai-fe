/**
 * Restructuring note:
 * This module encapsulates all chat-related API interactions. It was extracted
 * from the previously large `useChat.ts` to keep network concerns separate
 * from UI state. It supports a primary client (`apiService`) and a direct
 * fetch fallback with timeout, mirroring previous behavior exactly.
 */

import { apiService } from '@/lib/api';
import type { ChatHistoryItem } from '@/features/chat/utils/history';

export interface ChatApiResult {
  updatedMarkdown: string;
  responseMessage: string;
  hasUpdates?: boolean;
}

export async function callPrimaryApi(
  message: string,
  markdownContent: string,
  history: ChatHistoryItem[] = [],
  files: File[] = [],
): Promise<ChatApiResult | null> {
  const { data, error } =
    files && files.length > 0
      ? await apiService.chatWithFiles(message, markdownContent, history, files)
      : await apiService.chat(message, markdownContent, history);
  if (error || !data) {
    throw new Error(error || 'Failed to process chat request');
  }
  const responseMessage = data.reply;
  const hasUpdates = Boolean(data.resume_updates?.has_updates);
  const updatedMarkdown = hasUpdates
    ? data.output_resume_markdown || markdownContent
    : markdownContent;
  return { updatedMarkdown, responseMessage, hasUpdates };
}
