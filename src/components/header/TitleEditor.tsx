import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FileText } from 'lucide-react';
import { useTitleEditor } from '@/hooks/useTitleEditor';

export type TitleEditorProps = {
  title: string;
  onSubmit: (title: string) => void;
  isMobile?: boolean;
};

export function TitleEditor({
  title,
  onSubmit,
  isMobile = false,
}: TitleEditorProps) {
  const {
    isEditing,
    tempTitle,
    setTempTitle,
    beginEditing,
    cancelEditing,
    commitEditing,
    onPopoverOpenChange,
  } = useTitleEditor(title);

  if (isMobile) {
    return (
      <div className="flex items-center rounded-lg overflow-hidden whitespace-nowrap gap-2 p-0 bg-transparent border-0 flex-1 min-w-0 mr-2">
        <Popover
          open={isEditing}
          onOpenChange={(open) => onPopoverOpenChange(open, onSubmit)}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="link"
              size="sm"
              aria-label="Edit document title"
              onClick={() => beginEditing(title)}
              className="h-8 leading-8 px-0 py-0 text-sm font-medium text-gray-900 min-w-0 shrink max-w-[48vw] truncate text-left justify-start hover:underline underline-offset-2"
              title="Edit title"
            >
              <span className="truncate">{title || 'Untitled Resume'}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            className="w-[min(90vw,320px)] p-3"
          >
            <div className="space-y-2">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && commitEditing(onSubmit)}
                autoFocus
                className="text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => cancelEditing(title)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={() => commitEditing(onSubmit)}>
                  Save
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className="flex items-center rounded-lg overflow-hidden whitespace-nowrap gap-2 px-3 py-2 bg-gray-50 border border-gray-200 min-w-0 flex-1 max-w-sm">
      <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
      {isEditing ? (
        <input
          value={tempTitle}
          onChange={(e) => {
            const v = e.target.value;
            setTempTitle(v);
            // Desktop autosave on typing (debounced in parent)
            onSubmit(v);
          }}
          onBlur={() => commitEditing(onSubmit)}
          onKeyDown={(e) => e.key === 'Enter' && commitEditing(onSubmit)}
          className="bg-transparent outline-none text-sm font-medium text-gray-900 min-w-0 flex-1"
          autoFocus
        />
      ) : (
        <button
          onClick={() => beginEditing(title)}
          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors text-left truncate min-w-0 flex-1"
        >
          {title}
        </button>
      )}
      <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0" />
    </div>
  );
}
