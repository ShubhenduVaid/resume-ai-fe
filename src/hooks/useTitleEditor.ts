import { useCallback, useRef, useState } from 'react';

export function useTitleEditor(initialTitle: string) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(initialTitle);
  const skipNextSaveRef = useRef(false);

  const beginEditing = useCallback((currentTitle: string) => {
    setTempTitle(currentTitle);
    setIsEditing(true);
  }, []);

  const cancelEditing = useCallback((resetTo: string) => {
    skipNextSaveRef.current = true;
    setTempTitle(resetTo);
    setIsEditing(false);
  }, []);

  const commitEditing = useCallback(
    (onSubmit: (title: string) => void) => {
      onSubmit(tempTitle);
      setIsEditing(false);
    },
    [tempTitle],
  );

  const onPopoverOpenChange = useCallback(
    (open: boolean, onSubmit: (title: string) => void) => {
      if (!open) {
        if (!skipNextSaveRef.current) {
          onSubmit(tempTitle);
        }
        skipNextSaveRef.current = false;
      }
      setIsEditing(open);
    },
    [tempTitle],
  );

  return {
    isEditing,
    tempTitle,
    setTempTitle,
    beginEditing,
    cancelEditing,
    commitEditing,
    onPopoverOpenChange,
    skipNextSaveRef,
  } as const;
}
