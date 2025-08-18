import { useEffect, useState } from 'react';

interface LayoutState {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  isResizing: boolean;
  setIsResizing: (value: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  isMobile: boolean;
  setIsMobile: (value: boolean) => void;
  isDragActive: boolean;
  setIsDragActive: (value: boolean) => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function computeSidebarWidthForViewport(width: number): number {
  // Slightly larger ratio as requested
  const targetPct =
    width >= 1920 ? 0.42 : width >= 1536 ? 0.44 : width >= 1280 ? 0.46 : 0.48;
  const raw = Math.round(width * targetPct);
  return clamp(raw, 560, 820);
}

export function useLayoutState(): LayoutState {
  // Use an SSR-safe constant to avoid hydration mismatches.
  // The real width is computed post-mount.
  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // After mount, compute the actual width based on viewport.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    const next = w < 1024 ? 0 : computeSidebarWidthForViewport(w);
    setSidebarWidth(next);
  }, []);

  return {
    sidebarWidth,
    setSidebarWidth,
    isResizing,
    setIsResizing,
    sidebarCollapsed,
    setSidebarCollapsed,
    isMobile,
    setIsMobile,
    isDragActive,
    setIsDragActive,
  };
}
