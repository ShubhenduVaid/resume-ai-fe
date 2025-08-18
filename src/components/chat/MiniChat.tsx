import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppState } from '@/context/AppStateContext';
import { ChatInput } from '@/components/chat/ChatSidebar/ChatInput';
import { Button } from '@/components/ui/button';
import { Markdown } from '@/components/markdown/Markdown';
import { unwrapSingleFencedBlock } from '@/components/markdown/utils';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * MiniChat (mobile only)
 * - Fixed footer composer using existing ChatInput
 * - Shows latest assistant reply (no history) OR typing state
 * - "View full chat" pill opens the sidebar
 */
export function MiniChat() {
  const {
    chatHistory,
    isProcessing,
    creditsRemaining,
    handleChatSubmit,
    chatInputRef,
    sidebarCollapsed,
    setSidebarCollapsed,
    isMobile,
    focusChat,
  } = useAppState();

  // Hooks must be called unconditionally
  const [input, setInput] = useState('');
  const isOutOfCredits = creditsRemaining <= 0;

  const latestAssistant = useMemo(() => {
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      const m = chatHistory[i];
      if (m.type === 'system') return m;
    }
    return null;
  }, [chatHistory]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || isOutOfCredits || isProcessing) return;
    handleChatSubmit(msg, []);
    setInput('');
  };

  // Inline layout: no fixed footer or visualViewport hacks
  const [minimized, setMinimized] = useState(false);

  // Clamp detection for latest assistant bubble
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isClamped, setIsClamped] = useState(false);
  const checkClamp = () => {
    const el = contentRef.current;
    if (!el) return;
    const clamped = el.scrollHeight > el.clientHeight + 1; // tolerance
    setIsClamped(clamped);
  };
  useEffect(() => {
    checkClamp();
  }, [latestAssistant, isProcessing]);
  useEffect(() => {
    const onResize = () => checkClamp();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const openFullChat = () => {
    setSidebarCollapsed(false);
    setTimeout(() => focusChat?.(), 150);
  };

  // Hide when sidebar is open; parent controls mobile-only rendering
  if (!sidebarCollapsed) return null;

  return (
    <div className="bg-white border-t border-gray-200 rounded-t-lg shadow-sm">
      {/* Header with controls (top-right) */}
      <div className="flex items-center justify-end px-1.5 py-1">
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Open full chat"
            onClick={openFullChat}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={minimized ? 'Expand MiniChat' : 'Minimize MiniChat'}
            onClick={() => setMinimized((v) => !v)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {minimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {!minimized && (
        <div className="px-2 pb-2">
          {/* Feedback zone */}
          {isProcessing ? (
            <div className="inline-block max-w-[92%] px-4 py-3 rounded-3xl text-sm leading-relaxed bg-gray-100 text-gray-900">
              <span className="inline-flex items-center gap-2 text-gray-700">
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" />
                Assistant is typing…
              </span>
            </div>
          ) : latestAssistant ? (
            <div className="inline-block max-w-[92%] px-4 py-3 rounded-3xl text-sm leading-relaxed bg-gray-100 text-gray-900">
              <div
                className="prose prose-sm max-w-none break-words"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
                ref={contentRef}
              >
                <Markdown
                  content={unwrapSingleFencedBlock(latestAssistant.message)}
                  variant="chat"
                />
              </div>
              {isClamped && (
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={openFullChat}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    View more
                  </button>
                </div>
              )}
            </div>
          ) : null}
          {/* Composer */}
          <div className="mt-1">
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={onSubmit}
              isOutOfCredits={isOutOfCredits}
              isProcessing={isProcessing}
              isMobile
              pendingFilesCount={0}
              messagesCount={chatHistory.length}
              chatInputRef={chatInputRef}
              onToggleUpload={() => {}}
              showFileUpload={false}
              placeholder="Ask AI about your resume…"
              hideUploadButton
              compact
            />
          </div>
        </div>
      )}
    </div>
  );
}
