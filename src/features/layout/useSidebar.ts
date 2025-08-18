import { useCallback, useEffect, useState } from 'react';
import { MAX_SIDEBAR_WIDTH, MIN_SIDEBAR_WIDTH } from '@/config/ui';

export interface SidebarState {
  sidebarWidth: number;
  setSidebarWidth: (w: number) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  isResizing: boolean;
  startResize: (e: React.MouseEvent) => void;
  isMobile: boolean;
}

/**
 * Manages sidebar sizing/collapse and mobile detection.
 */
export function useSidebar(): SidebarState {
  const [sidebarWidth, setSidebarWidth] = useState<number>(360);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || sidebarCollapsed || isMobile) return;
      const newWidth = Math.min(
        Math.max(e.clientX, MIN_SIDEBAR_WIDTH),
        MAX_SIDEBAR_WIDTH,
      );
      setSidebarWidth(newWidth);
    },
    [isResizing, sidebarCollapsed, isMobile],
  );

  const onMouseUp = useCallback(() => setIsResizing(false), []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, onMouseMove, onMouseUp]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setSidebarCollapsed(true);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isMobile) return;
    setIsResizing(true);
  };

  return {
    sidebarWidth,
    setSidebarWidth,
    sidebarCollapsed,
    setSidebarCollapsed,
    isResizing,
    startResize,
    isMobile,
  };
}
