/**
 * Restructuring note:
 * History payload builder extracted to keep the hook light. Converts internal
 * `ChatMessage[]` into a compact array suitable for API calls.
 */

import type { ChatMessage } from '@/features/chat/types';

export type ChatHistoryItem = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

/**
 * Build compact chat history payload for LLMs, mapping our internal
 * 'system' replies to 'assistant' by default.
 */
export function buildChatHistoryPayload(
  history: ChatMessage[],
  limit: number = 20,
  mapSystemToAssistant: boolean = true,
): ChatHistoryItem[] {
  const start = Math.max(0, history.length - limit);
  return history.slice(start).map((m) => ({
    role:
      mapSystemToAssistant && m.type === 'system'
        ? 'assistant'
        : (m.type as 'user' | 'system'),
    content: m.message,
  })) as ChatHistoryItem[];
}
