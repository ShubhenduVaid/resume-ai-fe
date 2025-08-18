import React from 'react';
import { Upload } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';

interface FileUploadSectionProps {
  onFileUpload: (content: string, filename: string) => void;
  onCloseSection: () => void;
}

export function FileUploadSection({
  onFileUpload,
  onCloseSection,
}: FileUploadSectionProps) {
  return (
    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Import Resume
          </span>
        </div>
        <FileUpload
          onFileUpload={(content, filename) => {
            onFileUpload(content, filename);
            onCloseSection();
          }}
        />
      </div>
    </div>
  );
}
