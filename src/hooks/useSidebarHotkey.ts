import { useEffect } from 'react';

export type UseSidebarHotkeyOptions = {
  metaOrCtrl?: boolean;
};

export function useSidebarHotkey(
  key: string,
  handler: () => void,
  options: UseSidebarHotkeyOptions = { metaOrCtrl: true },
): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onKeyDown = (event: KeyboardEvent) => {
      const { metaOrCtrl = true } = options;
      const matchesKey = event.key.toLowerCase() === key.toLowerCase();
      const modifierOk = metaOrCtrl ? event.metaKey || event.ctrlKey : true;
      if (matchesKey && modifierOk) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handler, key, options]);
}
