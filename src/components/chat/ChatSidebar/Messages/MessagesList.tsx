import React, { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import type { ChatMessage } from '../../types/chat';
import { MessageItem } from './MessageItem';

export interface MessagesListProps {
  messages: ChatMessage[];
  isProcessing: boolean;
  formatRelativeTime: (date: Date) => string;
  formatFileSize: (bytes: number) => string;
  onRevert?: (snapshot: string, messageId: string) => void;
  currentContent?: string;
  onClickImportResume?: () => void;
  isMobile?: boolean;
  onPreviewResumeUpdates?: () => void;
}

export function MessagesList({
  messages,
  isProcessing,
  formatRelativeTime,
  formatFileSize,
  onRevert,
  currentContent,
  onClickImportResume,
  isMobile,
  onPreviewResumeUpdates,
}: MessagesListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added or processing state changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Use a more reliable scroll method
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
    }
  }, [messages.length, isProcessing]);

  return (
    <div className="flex-1 min-h-0">
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto overflow-x-hidden"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="px-4 py-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Welcome to Resume Builder
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed px-4 mb-6">
                I&amp;apos;m your AI resume assistant. I can help you create,
                edit, and improve your resume.
              </p>
              <div className="space-y-3 text-left max-w-xs mx-auto">
                {/* Import first (nudge) */}
                <button
                  type="button"
                  onClick={onClickImportResume}
                  className="bg-gray-50 rounded-lg p-3 text-left w-full border border-transparent hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <p className="text-xs font-medium text-blue-600 mb-1">
                    Recommended
                  </p>
                  <p className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                    <span role="img" aria-label="document">
                      📄
                    </span>
                    <strong>Import resume</strong>
                  </p>
                  <p className="text-xs text-gray-600">
                    Click to attach, or drag & drop
                  </p>
                </button>
                {/* Chat hint */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 mb-1">
                    💬 <strong>Start chatting:</strong>
                  </p>
                  <p className="text-xs text-gray-600">
                    &quot;Help me create a resume for software engineering&quot;
                  </p>
                </div>
                {/* LinkedIn import hint disabled pending approval
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 mb-1">
                    🔗 <strong>Import LinkedIn:</strong>
                  </p>
                  <p className="text-xs text-gray-600">
                    Use the attachment button to import from LinkedIn
                  </p>
                </div>
                */}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                formatRelativeTime={formatRelativeTime}
                formatFileSize={formatFileSize}
                onRevert={onRevert}
                currentContent={currentContent}
                isMobile={isMobile}
                onPreviewResumeUpdates={onPreviewResumeUpdates}
              />
            ))}
          </div>

          {isProcessing && (
            <div className="px-4 py-2 text-xs text-gray-500 flex items-center gap-2">
              <span className="inline-flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-gray-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
              </span>
              <span>Assistant is typing…</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
