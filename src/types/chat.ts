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
  // When present, represents the resume content after the assistant applied updates for this message
  resumeSnapshot?: string;
  // Indicates if the assistant updated the resume in this reply (used for mobile preview link)
  resumeUpdated?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'apple' | 'linkedin';
}
