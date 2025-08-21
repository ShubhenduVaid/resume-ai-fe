import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Send } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isOutOfCredits: boolean;
  isProcessing: boolean;
  isMobile?: boolean;
  pendingFilesCount: number;
  messagesCount: number;
  chatInputRef: React.RefObject<HTMLTextAreaElement>;
  onToggleUpload: () => void;
  showFileUpload: boolean;
  placeholder?: string; // optional override for placeholder text
  hideUploadButton?: boolean; // optional to hide upload button (e.g., MiniChat)
  compact?: boolean; // optional compact layout (reduced paddings), for MiniChat
  onPickFiles?: (files: File[]) => void; // optional: stage raw files
  exposeOpenFileDialog?: (open: () => void) => void; // parent can trigger file input
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isOutOfCredits,
  isProcessing,
  isMobile = false,
  pendingFilesCount,
  messagesCount,
  chatInputRef,
  onToggleUpload,
  showFileUpload,
  placeholder,
  hideUploadButton = false,
  compact = false,
  onPickFiles,
  exposeOpenFileDialog,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [accept, setAccept] = React.useState<string>(
    '.pdf,.txt,.md,.doc,.docx,application/pdf',
  );
  const [allowMultiple, setAllowMultiple] = React.useState<boolean>(false);
  const { uploadsCfg } = useAppState();

  useEffect(() => {
    if (uploadsCfg) {
      setAccept(uploadsCfg.accept);
      setAllowMultiple(uploadsCfg.maxFiles > 1);
    }
  }, [uploadsCfg]);

  // Expose a function for parents to open the hidden file input (e.g., from welcome card)
  useEffect(() => {
    if (!exposeOpenFileDialog) return;
    const open = () => fileInputRef.current?.click();
    exposeOpenFileDialog(open);
  }, [exposeOpenFileDialog]);

  const computedPlaceholder = React.useMemo(() => {
    if (placeholder) return placeholder;
    if (isOutOfCredits) return 'Buy credits to continue chatting...';
    if (pendingFilesCount > 0) return 'Add a message about these files...';
    if (messagesCount === 0) return "Hello! I'd like help with my resume...";
    return 'Message Resume Assistant...';
  }, [placeholder, isOutOfCredits, pendingFilesCount, messagesCount]);

  // Build textarea classes (kept outside JSX to satisfy Prettier)
  const baseInputPadding = compact ? 'px-3 pr-10 py-3' : 'px-4 pr-20 py-3';
  const textareaClass = [
    'w-full',
    baseInputPadding,
    'border border-gray-200',
    'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
    'bg-white text-sm rounded-2xl resize-none overflow-y-auto',
    isOutOfCredits || isProcessing ? 'opacity-50 cursor-not-allowed' : '',
    // On iOS Safari, inputs <16px trigger zoom. Force 16px on mobile.
    isMobile ? `${compact ? 'py-3' : 'py-4'} text-[16px]` : '',
    pendingFilesCount > 0 ? 'border-blue-300 ring-1 ring-blue-200' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight =
        parseInt(getComputedStyle(textarea).lineHeight || '20') * 6; // Max 6 lines
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [value]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as any);
    }
  };

  // Sync refs
  useEffect(() => {
    if (chatInputRef && textareaRef.current) {
      (chatInputRef as any).current = textareaRef.current;
    }
  }, [chatInputRef]);

  // iOS Safari: even at 16px, some combinations still trigger page zoom.
  // As a defensive measure, temporarily disable zoom while the textarea is focused.
  useEffect(() => {
    const el = textareaRef.current;
    if (
      !el ||
      typeof document === 'undefined' ||
      typeof navigator === 'undefined'
    )
      return;

    const isiOS = /iP(hone|od|ad)/.test(navigator.userAgent);
    if (!isiOS) return;

    const toggleViewportZoom = (disable: boolean) => {
      const meta = document.querySelector('meta[name="viewport"]');
      if (!meta) return;
      const content = meta.getAttribute('content') || '';
      const cleaned = content
        .replace(/,\s*maximum-scale=[^,\s]+/g, '')
        .replace(/,\s*user-scalable=[^,\s]+/g, '');
      const updated = disable
        ? `${cleaned}, maximum-scale=1, user-scalable=no`
        : `${cleaned}, user-scalable=yes`;
      meta.setAttribute('content', updated);
    };

    const onFocus = () => toggleViewportZoom(true);
    const onBlur = () => toggleViewportZoom(false);

    el.addEventListener('focus', onFocus);
    el.addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('focus', onFocus);
      el.removeEventListener('blur', onBlur);
      onBlur();
    };
  }, []);

  const containerClasses = [
    compact
      ? 'px-1 py-1 border-t-0 bg-transparent'
      : 'px-4 py-4 border-t border-gray-100 bg-white',
    isMobile && !compact ? 'pb-6' : '',
    // Respect safe area on devices with a home indicator
    'pb-[env(safe-area-inset-bottom)]',
    // Desktop-only breathing room from bottom edge
    'md:mb-2',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <form onSubmit={onSubmit}>
        {/* Chat Input */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={computedPlaceholder}
            enterKeyHint="send"
            inputMode="text"
            autoCapitalize="sentences"
            rows={1}
            className={textareaClass}
            style={{
              minHeight: isMobile ? (compact ? '44px' : '48px') : '42px',
              maxHeight: '140px', // Roughly 6 lines
            }}
          />

          {/* File Upload Button */}
          <div
            className={`absolute ${compact ? 'right-1' : 'right-2'} top-1/2 -translate-y-1/2 flex items-center ${compact ? 'gap-0' : 'gap-1'}`}
          >
            {!hideUploadButton && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isOutOfCredits}
                className={`text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full ${
                  isMobile ? 'p-2 h-auto touch-manipulation' : 'p-1.5 h-auto'
                } ${showFileUpload ? 'bg-gray-100 text-gray-600' : ''}`}
              >
                <Paperclip className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
              </Button>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="sm"
              // when the input is empty or no credits or processing then the button is disabled
              disabled={
                (value.trim().length === 0 && pendingFilesCount === 0) ||
                isOutOfCredits ||
                isProcessing
              }
              className={`bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 rounded-full ${
                isMobile
                  ? `${compact ? 'p-2 min-w-[32px]' : 'p-2 min-w-[40px]'} h-auto touch-manipulation`
                  : 'p-1.5 h-auto min-w-[32px]'
              }`}
            >
              {isProcessing ? (
                <span className="inline-flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                </span>
              ) : (
                <Send className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
              )}
            </Button>
          </div>
        </div>

        {/* Hidden file input for attachments (use sr-only for Safari compatibility) */}
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          accept={accept}
          multiple={allowMultiple}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0 && onPickFiles) onPickFiles(files);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
        />

        {/* Credits Warning - Only show when low credits */}
        {/* Note: The original component conditionally shows a low credits message below. Retained elsewhere if needed. */}
      </form>
    </div>
  );
}
