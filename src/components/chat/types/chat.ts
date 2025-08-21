export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  file?: File;
}

export interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
  type: 'user' | 'system';
  attachments?: FileAttachment[];
  resumeSnapshot?: string;
  // Indicates the assistant updated the resume for this message
  resumeUpdated?: boolean;
  // Optional AI-suggested next actions (0-3 strings). Clicking inserts into input.
  suggestedActions?: string[];
}

export interface ChatSidebarProps {
  messages: ChatMessage[];
  onChatSubmit: (message: string, attachments?: FileAttachment[]) => void;
  onFileUpload: (content: string, filename: string) => void;
  creditsRemaining: number;
  chatInputRef: React.RefObject<HTMLTextAreaElement>;
  isMobile?: boolean;
  onClose?: () => void;
  onBuyCredits?: () => void;
  isBootstrapped?: boolean;
  pendingFiles?: FileAttachment[];
  onRemovePendingFile?: (fileId: string) => void;
  isEmpty?: boolean;
  isProcessing?: boolean;
  currentContent?: string;
  onRevertSnapshot?: (snapshot: string, messageId: string) => void;
  onPickFiles?: (files: File[]) => void;
  exposeOpenFileDialog?: (open: () => void) => void;
  onPreviewResumeUpdates?: () => void;
}
