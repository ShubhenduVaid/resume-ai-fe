/*
 * Pure utility to export a provided HTMLElement to a printable iframe and trigger browser print.
 * Best-effort collection of styles with CORS-safe guards. Falls back to throwing on error.
 */

export function sanitizeFilename(input: string): string {
  return input
    .replace(/^Resume\s*-\s*/i, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

/**
 * Export an element to PDF via a hidden iframe and window.print().
 * Caller is responsible for sequencing (e.g., switching to preview mode before calling).
 */
export async function exportPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('[exportPdf] DOM is not available (SSR)');
  }

  // Collect styles from the current document (best-effort).
  const styleSheets = Array.from(document.styleSheets);
  let allStyles = '';
  try {
    styleSheets.forEach((styleSheet) => {
      try {
        const rules = Array.from(
          styleSheet.cssRules || (styleSheet as any).rules || [],
        );
        rules.forEach((rule) => {
          allStyles += (rule as CSSStyleRule).cssText + '\n';
        });
      } catch {
        // Ignore CORS-restricted stylesheets.
      }
    });
  } catch (e) {
    // Non-fatal; continue without some styles.
    console.warn('[exportPdf] Could not extract all styles:', e);
  }

  const previewHTML = element.innerHTML;
  const cleanFilename = sanitizeFilename(filename);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.top = '-10000px';
  iframe.style.left = '-10000px';
  iframe.style.width = '8.27in'; // A4 width
  iframe.style.height = '11.69in'; // A4 height
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error('[exportPdf] Could not access iframe document');
  }

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${cleanFilename}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { margin: 0.75in; size: A4; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: white; padding: 0; margin: 0;
            -webkit-print-color-adjust: exact; print-color-adjust: exact; line-height: 1.5;
          }

          /* Page styles copied from host document */
          ${allStyles}

          /* Print overrides */
          .max-w-4xl { max-width: none !important; }
          .mx-auto { margin-left: 0 !important; margin-right: 0 !important; }
          .px-8, .px-12 { padding-left: 0 !important; padding-right: 0 !important; }
          .py-12 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .shadow-lg { box-shadow: none !important; }
          .border { border: none !important; }
          .rounded-lg { border-radius: 0 !important; }
          .bg-gray-50, .bg-white { background: white !important; }

          h1, h2, h3 { page-break-after: avoid; break-after: avoid; }
          p, li, ul { page-break-inside: avoid; break-inside: avoid; }

          @media print {
            body { font-size: 12px !important; }
            h1 { font-size: 24px !important; margin-bottom: 8px !important; }
            h2 { font-size: 16px !important; margin-top: 20px !important; margin-bottom: 8px !important; }
            h3 { font-size: 14px !important; margin-top: 12px !important; margin-bottom: 4px !important; }
            p, li { font-size: 12px !important; }

            .text-3xl { font-size: 24px !important; }
            .text-2xl { font-size: 20px !important; }
            .text-xl { font-size: 18px !important; }
            .text-lg { font-size: 16px !important; }
            .text-base { font-size: 14px !important; }
            .text-sm { font-size: 12px !important; }
            .text-xs { font-size: 11px !important; }

            .mb-3 { margin-bottom: 8px !important; }
            .mb-4 { margin-bottom: 12px !important; }
            .mt-6 { margin-top: 20px !important; }
            .mt-4 { margin-top: 12px !important; }
          }
        </style>
      </head>
      <body>
        <div style="padding:0;margin:0;background:white;">${previewHTML}</div>
      </body>
    </html>
  `);
  iframeDoc.close();

  await new Promise<void>((resolve) => {
    const done = () => resolve();
    if (iframe.contentWindow?.document?.readyState === 'complete') {
      return resolve();
    }
    iframe.onload = done;
    // Fallback
    setTimeout(done, 1000);
  });

  if (iframe.contentWindow) {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }

  // Cleanup iframe after a delay
  setTimeout(() => {
    try {
      document.body.removeChild(iframe);
    } catch {
      // no-op
    }
  }, 2000);
}
