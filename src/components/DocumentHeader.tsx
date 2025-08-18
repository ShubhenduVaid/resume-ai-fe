import React, { useCallback, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Credits } from './Credits';
import { Download, Zap, Loader2, MessageSquare } from 'lucide-react';
import { ATSScore } from './ATSScore';
import type { User } from '@/types';
import { TitleEditor } from '@/components/header/TitleEditor';
import { ModeToggle } from '@/components/header/ModeToggle';
import { UserMenu } from '@/components/header/UserMenu';
import { OverflowMenu } from '@/components/header/OverflowMenu';
import { useExportPdf } from '@/hooks/useExportPdf';
import { apiService } from '@/lib/api';

interface DocumentHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  isPreviewMode: boolean;
  onModeChange: (isPreview: boolean) => void;
  content: string;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  creditsRemaining: number;
  onBuyCredits: () => void;
  isMobile?: boolean;
  user?: User;
  onLogout?: () => void;
  creditsDialogOpen?: boolean;
  onCreditsDialogOpenChange?: (open: boolean) => void;
  onOpenLogin?: () => void;
  isGuestSession?: boolean;
}

export function DocumentHeader({
  title,
  onTitleChange,
  isPreviewMode,
  onModeChange,
  content,
  sidebarCollapsed,
  onToggleSidebar,
  creditsRemaining,
  onBuyCredits,
  isMobile = false,
  user,
  onLogout,
  creditsDialogOpen,
  onCreditsDialogOpenChange,
  onOpenLogin,
  isGuestSession = false,
}: DocumentHeaderProps) {
  const nextFrame = useCallback(async () => {
    if (
      typeof window === 'undefined' ||
      typeof requestAnimationFrame === 'undefined'
    )
      return;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
  }, []);

  const ensurePreviewMode = useCallback(async () => {
    if (!isPreviewMode) {
      if (isMobile && !sidebarCollapsed) onToggleSidebar();
      onModeChange(true);
      await nextFrame();
    }
  }, [
    isPreviewMode,
    isMobile,
    sidebarCollapsed,
    onToggleSidebar,
    onModeChange,
    nextFrame,
  ]);

  const { isExporting, exportPdf: triggerExport } = useExportPdf(title, {
    ensurePreviewMode,
    onError: (err) => {
      // Could hook into a toast system here; keeping console for now.
      console.error('[DocumentHeader] Export error:', err);
    },
  });

  // Title save plumbing
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTitle = useCallback(async (t: string) => {
    try {
      if (typeof window === 'undefined') return;
      const chatId = localStorage.getItem('chatId');
      if (!chatId) return;
      await apiService.updateChatTitle(chatId, t);
    } catch (e) {
      // Non-blocking: silently ignore; UX remains smooth
      console.warn('[DocumentHeader] Failed to save title', e);
    }
  }, []);

  const scheduleSave = useCallback(
    (t: string, immediate: boolean) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (immediate) {
        saveTitle(t);
        return;
      }
      // Desktop: debounce 1s
      saveTimerRef.current = setTimeout(() => saveTitle(t), 1000);
    },
    [saveTitle],
  );

  const handleTitleSubmit = useCallback(
    (t: string) => {
      onTitleChange(t);
      // Mobile: Save immediately (CTA)
      // Desktop: Debounced on typing
      scheduleSave(t, Boolean(isMobile));
    },
    [onTitleChange, scheduleSave, isMobile],
  );

  // On mobile, if chat overlay is open, close it before switching modes
  const handleEditClick = () => {
    if (isMobile && !sidebarCollapsed) onToggleSidebar();
    onModeChange(false);
  };
  const handlePreviewClick = () => {
    if (isMobile && !sidebarCollapsed) onToggleSidebar();
    onModeChange(true);
  };

  // Chat focus is handled by keyboard shortcuts and sidebar toggle logic

  const handleExportPDF = async () => {
    const wasInPreviewMode = isPreviewMode;
    try {
      await triggerExport(content);
    } finally {
      // Restore mode if we changed it for export
      if (!wasInPreviewMode) {
        setTimeout(() => {
          onModeChange(false);
        }, 1500);
      }
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left Side - Essential Elements */}
          <div className="flex items-center gap-3 md:gap-3 min-w-0 flex-1">
            {/* Sidebar Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 h-auto flex-shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>

            {/* Document Tab */}
            <TitleEditor
              title={title}
              onSubmit={handleTitleSubmit}
              isMobile={isMobile}
            />

            {/* Mode Toggle - Always visible but simplified on mobile */}
            <ModeToggle
              isPreviewMode={isPreviewMode}
              onEdit={handleEditClick}
              onPreview={handlePreviewClick}
              isMobile={isMobile}
            />
          </div>

          {/* Right Side - Action Elements */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* ATS Score - Hidden on mobile, visible on tablet+ */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <Zap className="w-4 h-4 text-blue-600" />
              <ATSScore content={content} variant="inline" />
            </div>

            {/* Download PDF - Always visible */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-2 md:px-3 py-1.5 h-auto border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 flex-shrink-0"
              aria-label="Download PDF"
              title="Download PDF"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden xl:inline ml-1.5">Download PDF</span>
            </Button>

            {/* Credits - Always visible */}
            <Credits
              creditsRemaining={creditsRemaining}
              onBuyCredits={onBuyCredits}
              variant="header"
              showLabel={false}
              open={creditsDialogOpen}
              onOpenChange={onCreditsDialogOpenChange}
            />

            {/* Account */}
            {user && !isGuestSession ? (
              <UserMenu user={user} onLogout={onLogout} />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenLogin}
                className="px-2 md:px-3 py-1.5 h-auto border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Sign in
              </Button>
            )}

            {/* Overflow Menu */}
            <OverflowMenu content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}
