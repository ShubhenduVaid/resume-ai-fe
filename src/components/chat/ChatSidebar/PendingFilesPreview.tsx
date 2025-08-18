import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';
import type { FileAttachment } from '../types/chat';

interface PendingFilesPreviewProps {
  pendingFiles: FileAttachment[];
  onRemovePendingFile?: (fileId: string) => void;
  formatFileSize: (bytes: number) => string;
}

export function PendingFilesPreview({
  pendingFiles,
  onRemovePendingFile,
  formatFileSize,
}: PendingFilesPreviewProps) {
  if (pendingFiles.length === 0) return null;
  return (
    <div className="px-4 py-3 border-t border-gray-100 bg-blue-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-900">
          Files to attach
        </span>
        <span className="text-xs text-blue-700">
          {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {pendingFiles.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-2 bg-white rounded-lg p-2"
          >
            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>
            {onRemovePendingFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemovePendingFile(file.id)}
                className="text-gray-400 hover:text-red-600 p-1 h-auto"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
