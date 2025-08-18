import { useEffect } from 'react';

interface ResponsiveCallbacks {
  setIsMobile: (value: boolean) => void;
  setSidebarCollapsed: (value: boolean) => void;
}

export function useResponsive({
  setIsMobile,
  setSidebarCollapsed,
}: ResponsiveCallbacks): void {
  useEffect(() => {
    const checkScreenSize = () => {
      const isMob = window.innerWidth < 768;
      setIsMobile(isMob);
      if (isMob) setSidebarCollapsed(true);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [setIsMobile, setSidebarCollapsed]);
}
