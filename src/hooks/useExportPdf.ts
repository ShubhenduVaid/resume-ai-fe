import { useCallback, useRef, useState } from 'react';
import { exportPdf, sanitizeFilename } from '@/lib/print/exportPdf';

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    if (
      typeof window === 'undefined' ||
      typeof requestAnimationFrame === 'undefined'
    ) {
      // SSR or old environment: resolve immediately
      resolve();
      return;
    }
    requestAnimationFrame(() => resolve());
  });
}

export type UseExportPdfOptions = {
  // Optional ref to the preview element; if not provided, hook will query by [data-pdf-content]
  getElement?: () => HTMLElement | null;
  // Called when we need to ensure preview mode is active
  ensurePreviewMode?: () => Promise<void> | void;
  // Optional error surface callback
  onError?: (err: unknown) => void;
};

export function useExportPdf(title: string, options: UseExportPdfOptions = {}) {
  const { getElement, ensurePreviewMode, onError } = options;
  const [isExporting, setIsExporting] = useState(false);
  const lastErrorRef = useRef<unknown | null>(null);

  const handleExport = useCallback(
    async (contentForFallback?: string) => {
      if (typeof window === 'undefined') return; // SSR guard
      setIsExporting(true);
      lastErrorRef.current = null;

      try {
        // Make sure preview mode is on
        if (ensurePreviewMode) {
          await ensurePreviewMode();
        }

        // Wait for the next frame so DOM can settle
        await nextFrame();

        const el =
          getElement?.() ??
          (document.querySelector('[data-pdf-content]') as HTMLElement | null);
        if (!el) {
          throw new Error('[useExportPdf] Preview content not found');
        }

        await exportPdf(el, title);
      } catch (err) {
        lastErrorRef.current = err;
        console.error('[useExportPdf] Error generating PDF:', err);
        onError?.(err);

        // Fallback: download markdown/plain text
        if (contentForFallback) {
          try {
            const a = document.createElement('a');
            const file = new Blob([contentForFallback], { type: 'text/plain' });
            a.href = URL.createObjectURL(file);
            a.download = `${sanitizeFilename(title)}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
          } catch (fallbackErr) {
            console.error(
              '[useExportPdf] Fallback download failed:',
              fallbackErr,
            );
          }
        }
      } finally {
        setIsExporting(false);
      }
    },
    [ensurePreviewMode, getElement, onError, title],
  );

  return {
    isExporting,
    exportPdf: handleExport,
    lastError: lastErrorRef,
  } as const;
}
