import React from 'react';
import { FileText } from 'lucide-react';
import type { FileAttachment } from '../../types/chat';

export interface MessageAttachmentsProps {
  attachments: FileAttachment[];
  formatFileSize: (bytes: number) => string;
}

function MessageAttachmentsComponent({
  attachments,
  formatFileSize,
}: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className="mb-2 flex justify-start">
      <div className="max-w-[280px]">
        {attachments.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 mb-1"
          >
            <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const MessageAttachments = React.memo(MessageAttachmentsComponent);
