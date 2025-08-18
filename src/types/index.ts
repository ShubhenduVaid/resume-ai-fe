export type OAuthProvider = 'google' | 'apple' | 'linkedin';

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  file?: File; // raw file blob for uploads
}

export interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
  type: 'user' | 'system';
  attachments?: FileAttachment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: OAuthProvider;
}
