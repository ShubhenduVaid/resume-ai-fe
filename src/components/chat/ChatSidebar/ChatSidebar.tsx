import React, { useState, useRef } from 'react';
import type { ChatSidebarProps } from '@/components/chat/types/chat';
import { Header } from './Header';
import { MessagesList } from './Messages/MessagesList';
import { PendingFilesPreview } from './PendingFilesPreview';
import { FileUploadSection } from './FileUploadSection';
import { CreditsBanner } from './CreditsBanner';
import { ChatInput } from './ChatInput';
import {
  formatFileSize,
  formatRelativeTime,
} from '@/components/chat/utils/formatters';

export function ChatSidebar({
  messages,
  onChatSubmit,
  onFileUpload,
  creditsRemaining,
  chatInputRef,
  isMobile = false,
  onClose,
  onBuyCredits,
  pendingFiles = [],
  onRemovePendingFile,
  isEmpty = false,
  isProcessing = false,
  onRevertSnapshot,
  currentContent,
  onPickFiles,
  exposeOpenFileDialog,
  onPreviewResumeUpdates,
}: ChatSidebarProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const openPickerRef = useRef<(() => void) | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (inputMessage.trim() || pendingFiles.length > 0) &&
      creditsRemaining > 0 &&
      !isProcessing
    ) {
      onChatSubmit(inputMessage.trim() || 'Imported files', pendingFiles);
      setInputMessage('');
    }
  };

  const isOutOfCredits = creditsRemaining === 0;
  const isLowCredits = creditsRemaining < 10;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Header
        creditsRemaining={creditsRemaining}
        isProcessing={isProcessing}
        isMobile={isMobile}
        onClose={onClose}
        onBuyCredits={onBuyCredits}
      />

      {/* Messages */}
      <MessagesList
        messages={messages}
        isProcessing={isProcessing}
        formatRelativeTime={formatRelativeTime}
        formatFileSize={formatFileSize}
        onRevert={onRevertSnapshot}
        currentContent={currentContent}
        onClickImportResume={() => openPickerRef.current?.()}
        isMobile={isMobile}
        onPreviewResumeUpdates={onPreviewResumeUpdates}
      />

      {/* Pending Files Preview */}
      {pendingFiles.length > 0 && (
        <PendingFilesPreview
          pendingFiles={pendingFiles}
          onRemovePendingFile={onRemovePendingFile}
          formatFileSize={formatFileSize}
        />
      )}

      {/* File Upload Section */}
      {showFileUpload && (
        <FileUploadSection
          onFileUpload={(content, filename) => {
            onFileUpload(content, filename);
            setShowFileUpload(false);
          }}
          onCloseSection={() => setShowFileUpload(false)}
        />
      )}

      {/* Out of Credits Warning */}
      <CreditsBanner
        isOutOfCredits={isOutOfCredits}
        onBuyCredits={onBuyCredits}
      />

      {/* Chat Input */}
      <ChatInput
        value={inputMessage}
        onChange={setInputMessage}
        onSubmit={handleSubmit}
        isOutOfCredits={isOutOfCredits}
        isProcessing={isProcessing}
        isMobile={isMobile}
        pendingFilesCount={pendingFiles.length}
        messagesCount={messages.length}
        chatInputRef={chatInputRef}
        onToggleUpload={() => setShowFileUpload(!showFileUpload)}
        showFileUpload={showFileUpload}
        exposeOpenFileDialog={(open) => {
          openPickerRef.current = open;
          if (exposeOpenFileDialog) exposeOpenFileDialog(open);
        }}
        onPickFiles={onPickFiles}
      />

      {/* Low-credits inline message removed; now shown as part of header subtitle */}
    </div>
  );
}

export default ChatSidebar;
