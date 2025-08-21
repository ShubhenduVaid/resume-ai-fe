import React from 'react';
import { RotateCcw, Sparkles, User } from 'lucide-react';
import type { ChatMessage } from '../../types/chat';
import { MessageAttachments } from './MessageAttachments';
import { Markdown } from '../../../markdown/Markdown';

import { unwrapSingleFencedBlock } from '../../../markdown/utils';

export interface MessageItemProps {
  message: ChatMessage;
  formatRelativeTime: (date: Date) => string;
  formatFileSize: (bytes: number) => string;
  onRevert?: (snapshot: string, messageId: string) => void;
  currentContent?: string;
  isMobile?: boolean;
  onPreviewResumeUpdates?: () => void;
  onInsertSuggestion?: (text: string) => void;
}

function MessageItemComponent({
  message,
  formatRelativeTime,
  formatFileSize,
  onRevert,
  currentContent,
  isMobile,
  onPreviewResumeUpdates,
  onInsertSuggestion,
}: MessageItemProps) {
  return (
    <div className="group">
      <div className="flex gap-3">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
            message.type === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-900 text-white'
          }`}
        >
          {message.type === 'user' ? (
            <User className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </div>

        <div className={`flex-1 text-left`}>
          {message.attachments && message.attachments.length > 0 && (
            <div className={`flex justify-start`}>
              <MessageAttachments
                attachments={message.attachments}
                formatFileSize={formatFileSize}
              />
            </div>
          )}

          <div
            className={`inline-block max-w-[92%] px-4 py-3 rounded-3xl text-sm leading-relaxed ${
              message.type === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div
              className={`${message.type === 'user' ? 'prose-invert' : ''} prose prose-sm max-w-none break-words`}
            >
              <Markdown
                content={unwrapSingleFencedBlock(message.message)}
                variant="chat"
              />
            </div>
            {isMobile && message.type !== 'user' && message.resumeUpdated && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={onPreviewResumeUpdates}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Preview resume updates
                </button>
              </div>
            )}
            {/* Suggested Actions (chips) */}
            {message.type !== 'user' &&
              Array.isArray(message.suggestedActions) &&
              message.suggestedActions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.suggestedActions.slice(0, 3).map((s, idx) => (
                    <button
                      key={`${message.id}-sugg-${idx}`}
                      type="button"
                      onClick={() => onInsertSuggestion?.(s)}
                      className={`text-xs rounded-full px-3 py-1 border ${
                        message.type === 'user'
                          ? 'bg-blue-500/10 border-blue-300 text-white hover:bg-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700'
                      }`}
                      title="Insert suggestion into message box"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
          </div>

          <div
            className={`mt-2 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity duration-200 text-left`}
          >
            <div className={`flex items-center gap-3 justify-start`}>
              {message.type !== 'user' &&
                message.resumeSnapshot &&
                onRevert &&
                currentContent !== message.resumeSnapshot && (
                  <button
                    type="button"
                    onClick={() =>
                      onRevert(message.resumeSnapshot!, message.id)
                    }
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md bg-blue-50 md:bg-transparent"
                    title="Revert resume to this version"
                  >
                    <RotateCcw className="w-3 h-3" /> Revert
                  </button>
                )}
              <span className="text-xs text-gray-400">
                {formatRelativeTime(message.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const MessageItem = React.memo(MessageItemComponent);
