/**
 * Restructuring note:
 * This file now serves as a stable import surface to preserve existing import
 * paths across the codebase. The actual implementation lives in
 * `src/features/chat/hooks/useChat.ts` and related helper modules.
 */

export { useChat } from '@/features/chat/hooks/useChat';
export type {
  ChatState,
  ProcessingResult,
  ChatMessage,
  FileAttachment,
  User,
} from '@/features/chat/types';
