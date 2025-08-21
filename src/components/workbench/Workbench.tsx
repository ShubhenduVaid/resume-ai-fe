'use client';

import React from 'react';
import { useAppState } from '@/context/AppStateContext';
import { ChatSidebar } from '@/components/ChatSidebar';
import { MiniChat } from '@/components/chat/MiniChat';
import { DocumentCanvas } from '@/components/DocumentCanvas';
import { DocumentHeader } from '@/components/DocumentHeader';
import { LoginModal } from '@/components/LoginModal';
import { useAuth } from '@/context/AuthContext';
import type { User as HeaderUser } from '@/types';
import { toast } from '@/components/ui/sonner';
import { validateFiles, formatBytes } from '@/features/files/attachments';

export function Workbench() {
  const {
    showLoginModal,
    setShowLoginModal,
    loginLoading,
    loadingProvider,
    handleLogin,
    handleLogout,
    markdownContent,
    setMarkdownContent,
    chatHistory,
    setChatHistory,
    isPreviewMode,
    setIsPreviewMode,
    sidebarWidth,
    setSidebarWidth,
    isResizing,
    setIsResizing,
    sidebarCollapsed,
    setSidebarCollapsed,
    documentTitle,
    setDocumentTitle,
    creditsRemaining,
    setCreditsRemaining,
    isMobile,
    isDragActive,
    pendingFiles,
    setPendingFiles,
    removePendingFile,
    handleChatSubmit,
    chatInputRef,
    focusChat,
    isProcessing,
  } = useAppState();
  const { user } = useAuth();
  const [creditsDialogOpen, setCreditsDialogOpen] = React.useState(false);
  const [isGuestSession, setIsGuestSession] = React.useState(false);
  React.useEffect(() => {
    try {
      setIsGuestSession(localStorage.getItem('isGuestSession') === 'true');
    } catch {}
    const onFocus = () => {
      try {
        setIsGuestSession(localStorage.getItem('isGuestSession') === 'true');
      } catch {}
    };
    window.addEventListener('focus', onFocus);
    const onGuestChanged = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as { isGuest?: boolean };
        if (typeof detail?.isGuest === 'boolean') {
          setIsGuestSession(detail.isGuest);
        }
      } catch {}
    };
    window.addEventListener('guestSessionChanged', onGuestChanged as any);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('guestSessionChanged', onGuestChanged as any);
    };
  }, []);
  const headerUser: HeaderUser | undefined = user
    ? {
        id: user._id,
        name:
          (user.name && user.name.trim()) ||
          (user.email ? user.email.split('@')[0] : 'User'),
        email: user.email || '',
        avatar: user.profilePictureUrl,
        provider: (user as any).provider || 'google',
      }
    : undefined;

  const MIN_SIDEBAR_WIDTH = 320;
  const MAX_SIDEBAR_WIDTH = 1024;

  // Shared picker plumbing
  const chatOpenPickerRef = React.useRef<(() => void) | null>(null);
  const localPickerRef = React.useRef<HTMLInputElement>(null);
  const [accept, setAccept] = React.useState<string>(
    '.pdf,.txt,.md,.doc,.docx,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword',
  );
  const { uploadsCfg } = useAppState();
  React.useEffect(() => {
    if (uploadsCfg) setAccept(uploadsCfg.accept);
  }, [uploadsCfg]);

  // Stage files selected via paperclip or other pickers
  const onPickFiles = React.useCallback(
    async (files: File[]) => {
      const cfg = uploadsCfg || {
        maxFiles: 1,
        maxBytes: 1 * 1024 * 1024,
        allowedMime: [
          'application/pdf',
          'text/plain',
          'text/markdown',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
        ],
        accept,
      };
      const { accepted, rejected } = validateFiles(files, cfg as any);
      // Errors first
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
        // Build new attachments from accepted files
        const newAttachments = accepted.map((f) => ({
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          name: f.name,
          size: f.size,
          type: f.type,
          file: f,
        }));
        if (cfg.maxFiles <= 1) {
          return newAttachments.slice(0, 1);
        }
        return [...prev, ...newAttachments].slice(0, cfg.maxFiles);
      });
      // After staging files, ensure the chat UI is visible and focused
      if (isMobile || sidebarWidth === 0 || sidebarCollapsed) {
        setSidebarCollapsed(false);
        setTimeout(() => focusChat(), 150);
      } else {
        focusChat();
      }
    },
    [
      setPendingFiles,
      focusChat,
      isMobile,
      sidebarWidth,
      sidebarCollapsed,
      setSidebarCollapsed,
    ],
  );

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };
  const onMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(
        Math.max(e.clientX, MIN_SIDEBAR_WIDTH),
        MAX_SIDEBAR_WIDTH,
      );
      setSidebarWidth(newWidth);
    },
    [isResizing, setSidebarWidth],
  );
  const onMouseUp = React.useCallback(
    () => setIsResizing(false),
    [setIsResizing],
  );

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [isResizing, onMouseMove, onMouseUp]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/') {
        const activeElement = document.activeElement as HTMLElement | null;
        const isInputFocused = !!(
          activeElement?.tagName === 'INPUT' ||
          activeElement?.tagName === 'TEXTAREA' ||
          activeElement?.hasAttribute('contenteditable') ||
          activeElement?.closest('[contenteditable]')
        );

        if (!isInputFocused) {
          e.preventDefault();
          // On desktop, open the sidebar if it's collapsed, then focus chat
          if (!isMobile && sidebarCollapsed) {
            setSidebarCollapsed(false);
            requestAnimationFrame(() => focusChat());
          } else {
            focusChat();
          }
        }
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => {
      window.removeEventListener('keydown', handler, true);
    };
  }, [focusChat, isMobile, sidebarCollapsed, setSidebarCollapsed]);

  // Synchronous, robust fallback picker for iOS/Safari constraints.
  const openImmediateFilePicker = React.useCallback(() => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = true; // validateFiles will enforce max files
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.style.top = '0';
    input.style.width = '1px';
    input.style.height = '1px';
    input.style.opacity = '0';
    input.setAttribute('aria-hidden', 'true');
    input.tabIndex = -1;
    input.addEventListener(
      'change',
      () => {
        const files = Array.from(input.files || []);
        if (files.length > 0) onPickFiles(files);
        try {
          document.body.removeChild(input);
        } catch {}
      },
      { once: true },
    );
    document.body.appendChild(input);
    // Call click synchronously within the user gesture
    try {
      (input as any).showPicker ? (input as any).showPicker() : input.click();
    } catch {
      input.click();
    }
  }, [accept, onPickFiles]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50">
      <DocumentHeader
        title={documentTitle}
        onTitleChange={setDocumentTitle}
        isPreviewMode={isPreviewMode}
        onModeChange={setIsPreviewMode}
        content={markdownContent}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        creditsRemaining={creditsRemaining}
        onBuyCredits={() => setCreditsDialogOpen(true)}
        isMobile={isMobile || sidebarWidth === 0}
        user={headerUser}
        onLogout={handleLogout}
        creditsDialogOpen={creditsDialogOpen}
        onCreditsDialogOpenChange={setCreditsDialogOpen}
        onOpenLogin={() => {
          console.log('Open login modal', showLoginModal);
          setShowLoginModal(true);
        }}
        isGuestSession={isGuestSession}
      />

      <div className="h-[calc(100vh-56px)] flex">
        {/* Sidebar */}
        {isMobile || sidebarWidth === 0 ? (
          !sidebarCollapsed && (
            <div className="fixed inset-x-0 top-[56px] bottom-0 z-40 bg-white">
              <div className="h-full">
                <ChatSidebar
                  messages={chatHistory}
                  onChatSubmit={handleChatSubmit}
                  onFileUpload={(content, filename) => {
                    setPendingFiles((prev) => [
                      ...prev,
                      {
                        id: Date.now().toString(),
                        name: filename,
                        size: content.length,
                        type: 'text/plain',
                        content,
                      },
                    ]);
                    focusChat();
                  }}
                  creditsRemaining={creditsRemaining}
                  chatInputRef={chatInputRef}
                  isMobile={isMobile || sidebarWidth === 0}
                  onClose={() => setSidebarCollapsed(true)}
                  onBuyCredits={() => setCreditsDialogOpen(true)}
                  pendingFiles={pendingFiles}
                  onRemovePendingFile={removePendingFile}
                  isEmpty={markdownContent.length === 0}
                  isProcessing={isProcessing}
                  currentContent={markdownContent}
                  onPickFiles={onPickFiles}
                  exposeOpenFileDialog={(open) => {
                    chatOpenPickerRef.current = open;
                  }}
                  onRevertSnapshot={(snapshot, messageId) => {
                    setMarkdownContent(snapshot);
                    // Trim chat history to the selected message (inclusive)
                    const index = chatHistory.findIndex(
                      (m) => m.id === messageId,
                    );
                    if (index >= 0) {
                      const trimmed = chatHistory.slice(0, index + 1);
                      setChatHistory(trimmed);
                    }
                    if (isMobile) setSidebarCollapsed(true);
                    toast.success('Reverted resume to the selected version');
                  }}
                  onPreviewResumeUpdates={() => {
                    // Close the chat overlay and ensure preview mode to view changes
                    if (isMobile || sidebarWidth === 0) {
                      setSidebarCollapsed(true);
                    }
                    setIsPreviewMode(true);
                    // allow layout settle then focus document
                    setTimeout(() => {
                      const el = document.querySelector(
                        '#document-canvas-root',
                      );
                      if (el && 'scrollIntoView' in el)
                        (el as any).scrollIntoView({ behavior: 'smooth' });
                    }, 150);
                  }}
                />
              </div>
            </div>
          )
        ) : (
          <div
            className={`relative bg-white border-r border-gray-200 transition-all duration-200 ${
              sidebarCollapsed ? 'w-0' : ''
            }`}
            style={{ width: sidebarCollapsed ? 0 : sidebarWidth }}
          >
            {!sidebarCollapsed && (
              <div className="h-full">
                <ChatSidebar
                  messages={chatHistory}
                  onChatSubmit={handleChatSubmit}
                  onFileUpload={(content, filename) => {
                    setPendingFiles((prev) => [
                      ...prev,
                      {
                        id: Date.now().toString(),
                        name: filename,
                        size: content.length,
                        type: 'text/plain',
                        content,
                      },
                    ]);
                    focusChat();
                  }}
                  creditsRemaining={creditsRemaining}
                  chatInputRef={chatInputRef}
                  isMobile={isMobile}
                  onClose={() => setSidebarCollapsed(true)}
                  onBuyCredits={() => setCreditsDialogOpen(true)}
                  pendingFiles={pendingFiles}
                  onRemovePendingFile={removePendingFile}
                  isEmpty={markdownContent.length === 0}
                  isProcessing={isProcessing}
                  currentContent={markdownContent}
                  onPickFiles={onPickFiles}
                  exposeOpenFileDialog={(open) => {
                    chatOpenPickerRef.current = open;
                  }}
                  onRevertSnapshot={(snapshot, messageId) => {
                    setMarkdownContent(snapshot);
                    // Trim chat history to the selected message (inclusive)
                    const index = chatHistory.findIndex(
                      (m) => m.id === messageId,
                    );
                    if (index >= 0) {
                      const trimmed = chatHistory.slice(0, index + 1);
                      setChatHistory(trimmed);
                    }
                    if (isMobile) setSidebarCollapsed(true);
                    toast.success('Reverted resume to the selected version');
                  }}
                  onPreviewResumeUpdates={() => {
                    setIsPreviewMode(true);
                  }}
                />
                {/* Resize handle */}
                {!isMobile && (
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-200/50"
                    onMouseDown={startResize}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Document area (column) */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-w-0 overflow-hidden">
            <DocumentCanvas
              content={markdownContent}
              onChange={setMarkdownContent}
              isPreviewMode={isPreviewMode}
              isMobile={isMobile}
              isEmpty={markdownContent.length === 0}
              hasMessages={chatHistory.length > 0}
              onStartFromScratch={() => setMarkdownContent('# Your Name')}
              onClickImportResume={() => {
                // On mobile/iOS, prefer an immediate, dedicated picker for reliability
                if (isMobile || sidebarWidth === 0) {
                  openImmediateFilePicker();
                  return;
                }
                // If ChatSidebar is mounted, use its picker so files land in the chat flow
                if (chatOpenPickerRef.current) {
                  chatOpenPickerRef.current();
                  return;
                }
                // Desktop fallback to hidden input
                if (localPickerRef.current) {
                  const input = localPickerRef.current;
                  try {
                    typeof (input as any).showPicker === 'function'
                      ? (input as any).showPicker()
                      : input.click();
                  } catch {
                    input.click();
                  }
                } else {
                  openImmediateFilePicker();
                }
              }}
              onStartChatting={() => {
                // Open the chat sidebar if needed, then focus the input
                if (isMobile || sidebarWidth === 0) {
                  if (sidebarCollapsed) setSidebarCollapsed(false);
                  // Wait for overlay to mount before focusing
                  setTimeout(() => focusChat(), 150);
                } else if (sidebarCollapsed) {
                  setSidebarCollapsed(false);
                  requestAnimationFrame(() => focusChat());
                } else {
                  focusChat();
                }
              }}
            />
          </div>
          {/* Inline MiniChat footer (mobile only) */}
          <div className="shrink-0">
            {(isMobile || sidebarWidth === 0) && <MiniChat />}
          </div>

          {/* Close document area container */}
        </div>
        {/* Close h-[calc(100vh-56px)] container */}
      </div>

      {/* Login Modal */}
      <LoginModal
        open={!!showLoginModal && !user}
        onOpenChange={(open) => {
          setShowLoginModal(open);
        }}
      />

      {/* Overlay for drag-and-drop */}
      {isDragActive && (
        <div className="pointer-events-none fixed inset-0 bg-blue-500/10 border-4 border-dashed border-blue-400" />
      )}

      {/* Hidden fallback file input (used when chat picker isn't mounted) */}
      <input
        ref={localPickerRef}
        type="file"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        accept={accept}
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) onPickFiles(files);
          if (localPickerRef.current) localPickerRef.current.value = '';
        }}
      />
    </div>
  );
}
