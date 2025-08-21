import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppState } from '@/context/AppStateContext';
import { ChatInput } from '@/components/chat/ChatSidebar/ChatInput';
import { Button } from '@/components/ui/button';
import { Markdown } from '@/components/markdown/Markdown';
import { unwrapSingleFencedBlock } from '@/components/markdown/utils';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { validateFiles, formatBytes } from '@/features/files/attachments';

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
    pendingFiles,
    setPendingFiles,
    uploadsCfg,
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
    // Allow sending when there are pending files even if message is empty
    const canSend =
      (msg.length > 0 || pendingFiles.length > 0) &&
      !isOutOfCredits &&
      !isProcessing;
    if (!canSend) return;
    handleChatSubmit(msg || 'Imported files', pendingFiles);
    setInput('');
  };

  // Stage files selected via paperclip
  const onPickFiles = React.useCallback(
    async (files: File[]) => {
      const cfg =
        uploadsCfg ||
        ({
          maxFiles: 1,
          maxBytes: 1 * 1024 * 1024,
          allowedMime: [
            'application/pdf',
            'text/plain',
            'text/markdown',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
          ],
          accept:
            '.pdf,.txt,.md,.doc,.docx,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword',
        } as const);
      const { accepted, rejected } = validateFiles(files, cfg as any);
      for (const r of rejected) {
        if (r.reason === 'not_allowed') {
          toast.error(`Unsupported file type: ${r.file.name}`);
        } else if (r.reason === 'too_large') {
          toast.error(
            `File too large: ${r.file.name} (${formatBytes(r.file.size)}). Max ${formatBytes(
              cfg.maxBytes,
            )}`,
          );
        }
      }
      if (accepted.length === 0) return;
      setPendingFiles((prev) => {
        const newAttachments = accepted.map((f) => ({
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          name: f.name,
          size: f.size,
          type: f.type,
          file: f,
        }));
        if (cfg.maxFiles <= 1) return newAttachments.slice(0, 1);
        return [...prev, ...newAttachments].slice(0, cfg.maxFiles);
      });
      // Keep focus on the input after picking
      focusChat?.();
    },
    [uploadsCfg, setPendingFiles, focusChat],
  );

  // Keyboard-safe fixed footer using VisualViewport on iOS
  const [kbOffset, setKbOffset] = useState(0);
  useEffect(() => {
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isIOS =
      /iP(hone|od|ad)/.test(ua) &&
      /Safari/.test(ua) &&
      !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (!vv || !isIOS) return; // ignore desktop/devtools and non-iOS
    const timerRef: { id: number | null } = { id: null };
    const applyOffset = (inset: number) => {
      const keyboardOpen = inset > 120;
      const bubbleBuffer = keyboardOpen ? 24 : 0;
      setKbOffset(keyboardOpen ? inset + bubbleBuffer : 0);
    };
    const schedule = () => {
      // Only lift if the focus is inside MiniChat (its textarea/buttons)
      const ae = document.activeElement as HTMLElement | null;
      const focusedInMini = !!(
        ae &&
        (ae === (chatInputRef as any)?.current || barRef.current?.contains(ae))
      );
      if (!focusedInMini) {
        applyOffset(0);
        return;
      }
      const inset = Math.max(
        0,
        window.innerHeight - (vv.height + vv.offsetTop),
      );
      if (inset <= 120) {
        if (timerRef.id !== null) {
          clearTimeout(timerRef.id);
          timerRef.id = null;
        }
        applyOffset(0);
        return;
      }
      if (timerRef.id !== null) clearTimeout(timerRef.id);
      timerRef.id = window.setTimeout(() => {
        const inset2 = Math.max(
          0,
          window.innerHeight - (vv.height + vv.offsetTop),
        );
        applyOffset(inset2);
        timerRef.id = null;
      }, 150);
    };
    const onFocus = () => schedule();
    const onBlur = () => schedule();
    vv.addEventListener('resize', schedule);
    vv.addEventListener('scroll', schedule);
    window.addEventListener('focusin', onFocus);
    window.addEventListener('focusout', onBlur);
    schedule();
    return () => {
      vv.removeEventListener('resize', schedule);
      vv.removeEventListener('scroll', schedule);
      window.removeEventListener('focusin', onFocus);
      window.removeEventListener('focusout', onBlur);
      if (timerRef.id !== null) clearTimeout(timerRef.id);
    };
  }, []);

  // Minimize control for compact view
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

  // Measure MiniChat height and publish to CSS var for spacer usage
  const barRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // When sidebar is open, collapse spacer to avoid extra bottom gap
    if (!sidebarCollapsed) {
      try {
        document.documentElement.style.setProperty('--minichat-height', '0px');
      } catch {}
      return;
    }
    const el = barRef.current;
    if (!el) return;
    const update = () => {
      try {
        const h = Math.max(0, el.offsetHeight);
        document.documentElement.style.setProperty(
          '--minichat-height',
          `${h}px`,
        );
      } catch {}
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      try {
        ro.disconnect();
        document.documentElement.style.removeProperty('--minichat-height');
      } catch {}
    };
  }, [sidebarCollapsed, minimized, kbOffset, isProcessing, latestAssistant]);

  return (
    <>
      {/* Filler to paint the area below the composer when it's lifted above Safari's URL pill */}
      {sidebarCollapsed && kbOffset > 0 && (
        <div
          className="fixed left-0 right-0 z-40 bg-white"
          style={{ bottom: 0, height: kbOffset }}
          aria-hidden="true"
        />
      )}
      {sidebarCollapsed && (
        <div
          ref={barRef}
          className="fixed left-0 right-0 z-50 bg-white border-t border-gray-200 rounded-t-lg shadow-sm"
          // Position above iOS keyboard while respecting safe area
          style={{ bottom: kbOffset, transition: 'bottom 150ms ease' }}
        >
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
                  {/* Suggested actions (chips) */}
                  {Array.isArray((latestAssistant as any).suggestedActions) &&
                    (latestAssistant as any).suggestedActions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(latestAssistant as any).suggestedActions
                          .slice(0, 3)
                          .map((s: string, idx: number) => (
                            <button
                              key={`mini-sugg-${idx}`}
                              type="button"
                              onClick={() => {
                                setInput((prev) => {
                                  const p = prev || '';
                                  if (!p.trim()) return s;
                                  return p.endsWith(' ') ? p + s : p + ' ' + s;
                                });
                                focusChat?.();
                              }}
                              className="text-xs rounded-full px-3 py-1 border bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700"
                              title="Insert suggestion into message box"
                            >
                              {s}
                            </button>
                          ))}
                      </div>
                    )}
                </div>
              ) : null}
              {/* Composer */}
              <div className="mt-1 pb-[env(safe-area-inset-bottom)]">
                <ChatInput
                  value={input}
                  onChange={setInput}
                  onSubmit={onSubmit}
                  isOutOfCredits={isOutOfCredits}
                  isProcessing={isProcessing}
                  isMobile
                  pendingFilesCount={pendingFiles.length}
                  messagesCount={chatHistory.length}
                  chatInputRef={chatInputRef}
                  onToggleUpload={() => {}}
                  showFileUpload={false}
                  placeholder="Ask AI about your resume…"
                  onPickFiles={onPickFiles}
                  compact
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
