import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';

export type ModeToggleProps = {
  isPreviewMode: boolean;
  onEdit: () => void;
  onPreview: () => void;
  isMobile?: boolean;
};

export function ModeToggle({
  isPreviewMode,
  onEdit,
  onPreview,
  isMobile = false,
}: ModeToggleProps) {
  return (
    <div
      className={`flex items-center rounded-lg flex-shrink-0 ${
        isMobile ? 'p-0 bg-transparent ml-2' : 'bg-gray-100 p-1'
      }`}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        aria-label="Switch to edit mode"
        title="Edit"
        className={`px-2 md:px-3 py-0 h-8 transition-colors text-xs md:text-sm ${
          !isPreviewMode
            ? 'bg-white text-gray-900 shadow-sm hover:bg-white'
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`}
      >
        <Edit className="w-3 h-3 md:w-4 md:h-4" />
        <span className="hidden sm:inline ml-1.5">Edit</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onPreview}
        aria-label="Switch to preview mode"
        title="Preview"
        className={`px-2 md:px-3 py-0 h-8 transition-colors text-xs md:text-sm ${
          isPreviewMode
            ? 'bg-white text-gray-900 shadow-sm hover:bg-white'
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`}
      >
        <Eye className="w-3 h-3 md:w-4 md:h-4" />
        <span className="hidden sm:inline ml-1.5">Preview</span>
      </Button>
    </div>
  );
}
