import { useCallback, useEffect, useRef, useState } from 'react';
import type { FileAttachment } from '@/types/chat';

export interface DragDropState {
  isDragActive: boolean;
  pendingFiles: FileAttachment[];
  setPendingFiles: React.Dispatch<React.SetStateAction<FileAttachment[]>>;
  removePendingFile: (id: string) => void;
}

/**
 * Handles global drag-and-drop of files and maintains a pending list.
 */
export function useGlobalDragDrop(enabled: boolean): DragDropState {
  const [isDragActive, setIsDragActive] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<FileAttachment[]>([]);
  const dragCounterRef = useRef<number>(0);

  const removePendingFile = useCallback((id: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  useEffect(() => {
    if (!enabled) return;

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
      if (dragCounterRef.current === 0) setIsDragActive(false);
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

      const attachments: FileAttachment[] = [];
      for (const file of files) {
        const att: FileAttachment = {
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          name: file.name,
          size: file.size,
          type: file.type,
        };
        if (
          file.type.startsWith('text/') ||
          file.name.endsWith('.md') ||
          file.name.endsWith('.txt')
        ) {
          const content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) =>
              resolve((ev.target?.result as string) || '');
            reader.onerror = reject;
            reader.readAsText(file);
          });
          att.content = content;
        }
        attachments.push(att);
      }
      setPendingFiles((prev) => [...prev, ...attachments]);
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
  }, [enabled]);

  return { isDragActive, pendingFiles, setPendingFiles, removePendingFile };
}
