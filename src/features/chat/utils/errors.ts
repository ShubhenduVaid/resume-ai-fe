/**
 * Restructuring note:
 * Centralized error handling utilities for chat flows. Previously embedded in
 * `useChat.ts`, now extracted for reuse and readability.
 */

import type { ChatMessage } from '@/features/chat/types';

export function buildFriendlyError(error: unknown): string {
  let errorMessage =
    'I apologize, but I encountered an error processing your request. Please try again.';

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('network') || msg.includes('fetch')) {
      errorMessage =
        'Network error: Please check your internet connection and try again.';
    } else if (msg.includes('timeout') || msg.includes('timed out')) {
      errorMessage =
        'The request timed out. The server might be busy, please try again in a moment.';
    } else if (msg.includes('auth') || msg.includes('401')) {
      errorMessage = 'Authentication error: You may need to log in again.';
    }
  }

  if (typeof error === 'object' && error !== null && 'status' in error) {
    const statusCode = (error as any).status as number;
    if (statusCode === 429) {
      errorMessage =
        'You have made too many requests. Please wait a moment before trying again.';
    } else if (statusCode >= 500) {
      errorMessage =
        'The server encountered an error. Our team has been notified and is working on it.';
    }
  }

  return errorMessage;
}

export function toSystemErrorMessage(message: string): ChatMessage {
  return {
    id: (Date.now() + 1).toString(),
    message,
    timestamp: new Date(),
    type: 'system',
  };
}
