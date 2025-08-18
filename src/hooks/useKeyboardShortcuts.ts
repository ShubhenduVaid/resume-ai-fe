import { useEffect } from 'react';

/**
 * Registers global keyboard shortcuts.
 * - '/' focuses chat input via provided callback
 * - 'Escape' triggers provided onEscape callback (e.g., collapse sidebar on mobile)
 */
export function useKeyboardShortcuts(
  focusChat: () => void,
  onEscape?: () => void,
): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement | null;
      const isInputFocused = !!(
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.hasAttribute('contenteditable') ||
        activeElement?.closest('[contenteditable]')
      );

      if (event.key === '/' && !isInputFocused) {
        event.preventDefault();
        event.stopPropagation();
        focusChat();
        return;
      }

      if (event.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [focusChat, onEscape]);
}
