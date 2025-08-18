import { useEffect, useRef } from 'react';
import type { User, FileAttachment } from '@/types';
import { readFileToAttachment } from '../utils/fileReaders';

interface DnDFileCaptureOptions {
  enabled: boolean;
  user: User | null;
  onFiles: (files: FileAttachment[]) => void;
  onFocusChatInput?: () => void;
  setIsDragActive: (value: boolean) => void;
  setSidebarCollapsed: (value: boolean) => void;
  sidebarCollapsed: boolean;
}

export function useDnDFileCapture({
  enabled,
  user,
  onFiles,
  onFocusChatInput,
  setIsDragActive,
  setSidebarCollapsed,
  sidebarCollapsed,
}: DnDFileCaptureOptions): void {
  const dragCounterRef = useRef(0);

  useEffect(() => {
    if (!enabled || !user) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragActive(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current--;
      if (dragCounterRef.current === 0) {
        setIsDragActive(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      dragCounterRef.current = 0;

      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length === 0) return;

      const fileAttachments: FileAttachment[] = [];
      for (const file of files) {
        const attachment = await readFileToAttachment(file);
        fileAttachments.push(attachment);
      }

      onFiles(fileAttachments);

      // Auto-expand sidebar if collapsed on drop
      if (sidebarCollapsed) setSidebarCollapsed(false);

      // Focus chat input after drop
      if (onFocusChatInput) onFocusChatInput();
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [
    enabled,
    user,
    onFiles,
    onFocusChatInput,
    setIsDragActive,
    setSidebarCollapsed,
    sidebarCollapsed,
  ]);
}
