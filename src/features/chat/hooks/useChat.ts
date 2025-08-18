/**
 * Restructuring note:
 * This is the refactored chat hook, extracted from the previously large
 * `src/features/chat/useChat.ts`. The hook now orchestrates state and delegates
 * logic to focused helpers under `api/` and `utils/`, while preserving 100%
 * of the original functionality and behavior.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ChatState,
  ChatMessage,
  FileAttachment,
  User,
  ProcessingResult,
} from '@/features/chat/types';
import { callPrimaryApi } from '@/features/chat/api/chatClient';
import {
  applyOfflineHeuristics,
  processFileAttachments,
} from '@/features/chat/utils/fileProcessing';
import {
  buildFriendlyError,
  toSystemErrorMessage,
} from '@/features/chat/utils/errors';
import { buildChatHistoryPayload } from '@/features/chat/utils/history';

export function useChat(user: User | null): ChatState {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [creditsRemaining, setCreditsRemaining] = useState<number>(0);
  const [documentTitle, setDocumentTitle] = useState<string>('Untitled Resume');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(true);
  const [pendingFiles, setPendingFiles] = useState<FileAttachment[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const prevContentLengthRef = useRef<number>(0);

  const checkCredits = useCallback((): boolean => {
    if (creditsRemaining <= 0) {
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          message:
            "You've run out of credits! Please purchase more credits to continue using AI features.",
          timestamp: new Date(),
          type: 'system',
        },
      ]);
      return false;
    }
    return true;
  }, [creditsRemaining]);

  const addUserMessage = useCallback(
    (message: string, attachments: FileAttachment[] = []): void => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        message,
        timestamp: new Date(),
        type: 'user',
        attachments: attachments.length > 0 ? attachments : undefined,
      };
      setChatHistory((prev) => [...prev, newMessage]);
      setCreditsRemaining((prev) => Math.max(0, prev - 1));
    },
    [],
  );

  const addSystemResponse = useCallback((message: string): void => {
    setChatHistory((prev) => [...prev, toSystemErrorMessage(message)]);
  }, []);

  const handleProcessingError = useCallback(
    (error: unknown, context?: string): void => {
      console.error(
        `Error ${context ? `during ${context}` : 'processing request'}:`,
        error,
      );
      addSystemResponse(buildFriendlyError(error));
    },
    [addSystemResponse],
  );

  const processAI = useCallback(
    async (
      message: string,
      attachments: FileAttachment[] = [],
    ): Promise<ProcessingResult> => {
      const historyPayload = buildChatHistoryPayload(chatHistory);
      let lastError: unknown = null;

      // Try primary API
      try {
        const filesToSend = (attachments || [])
          .map((a) => a.file)
          .filter((f): f is File => !!f);
        const primary = await callPrimaryApi(
          message,
          markdownContent,
          historyPayload,
          filesToSend,
        );
        if (primary) return primary;
      } catch (e) {
        lastError = e;
      }

      // Offline heuristics
      const offline = applyOfflineHeuristics(message, markdownContent);
      if (offline) return offline;

      // Surface a clear error so the caller can show it in chat
      if (lastError instanceof Error) {
        throw lastError;
      }
      throw new Error('Failed to process chat request');
    },
    [markdownContent, chatHistory],
  );

  const handleChatSubmit = useCallback(
    (message: string, attachments: FileAttachment[] = []) => {
      // if (!user) return; // Uncomment if user validation is needed
      if (!checkCredits()) return;
      if (isProcessing) return; // prevent parallel submits

      setIsProcessing(true);

      // Push the user message after toggling processing so UI reflects state instantly
      addUserMessage(message, attachments);

      // Clear pending files immediately after adding user message for better UX
      setPendingFiles([]);

      const process = async () => {
        try {
          let updatedMarkdown = markdownContent;
          let responseMessage = "I've updated your resume!";
          let hasUpdates: boolean | undefined = undefined;

          // Always try backend first; internal heuristics handled inside processAI as fallback
          const result = await processAI(message, attachments);
          updatedMarkdown = result.updatedMarkdown;
          responseMessage = result.responseMessage;
          hasUpdates = result.hasUpdates;

          setMarkdownContent(updatedMarkdown);
          // Include snapshot of resume after this assistant response for potential undo
          setChatHistory((prev) => [
            ...prev,
            {
              id: (Date.now() + 2).toString(),
              message: responseMessage,
              timestamp: new Date(),
              type: 'system',
              resumeSnapshot: updatedMarkdown,
              resumeUpdated:
                (typeof hasUpdates === 'boolean' ? hasUpdates : undefined) ??
                updatedMarkdown !== markdownContent,
            },
          ]);
        } catch (error) {
          handleProcessingError(error, 'AI request processing');
        } finally {
          setIsProcessing(false);
          // Clear pending files after processing completes
          setPendingFiles([]);
        }
      };

      setTimeout(process, 1000);
    },
    [
      user,
      chatHistory.length,
      markdownContent,
      documentTitle,
      checkCredits,
      addUserMessage,
      processAI,
      handleProcessingError,
      setDocumentTitle,
      isProcessing,
    ],
  );

  const removePendingFile = useCallback((fileId: string): void => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const focusChat = useCallback((): void => {
    chatInputRef.current?.focus();
  }, []);

  return {
    markdownContent,
    setMarkdownContent,
    chatHistory,
    setChatHistory,
    creditsRemaining,
    setCreditsRemaining,
    documentTitle,
    setDocumentTitle,
    isPreviewMode,
    setIsPreviewMode,
    chatInputRef,
    handleChatSubmit,
    pendingFiles,
    setPendingFiles,
    removePendingFile,
    focusChat,
    isProcessing,
  };
}
