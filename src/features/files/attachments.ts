import { apiService } from '@/lib/api';
import type { FileAttachment } from '@/types';

export type UploadsConfig = {
  maxFiles: number;
  maxBytes: number;
  allowedMime: string[];
  accept: string; // for <input accept>
};

let cachedCfg: UploadsConfig | null = null;
let pendingCfg: Promise<UploadsConfig> | null = null;

const DEFAULT_CFG: UploadsConfig = {
  maxFiles: 1,
  maxBytes: 1 * 1024 * 1024,
  allowedMime: [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ],
  accept:
    '.pdf,.txt,.md,.doc,.docx,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword',
};

export async function getUploadsConfig(): Promise<UploadsConfig> {
  if (cachedCfg) return cachedCfg;
  if (pendingCfg) return pendingCfg;
  pendingCfg = (async () => {
    try {
      const { data } = await apiService.fetchPublic<any>('/api/uploads-config');
      if (data && typeof data.maxFiles === 'number') {
        cachedCfg = data as UploadsConfig;
        return cachedCfg;
      }
    } catch {}
    cachedCfg = DEFAULT_CFG;
    return cachedCfg;
  })();
  try {
    return await pendingCfg;
  } finally {
    pendingCfg = null;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb >= 100 ? 0 : 1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;
}

export type FileRejection = { file: File; reason: 'too_large' | 'not_allowed' };

export function validateFiles(
  files: File[],
  cfg: UploadsConfig,
): {
  accepted: File[];
  rejected: FileRejection[];
} {
  const accepted: File[] = [];
  const rejected: FileRejection[] = [];
  for (const f of files) {
    const tooLarge = f.size > cfg.maxBytes;
    const allowed =
      cfg.allowedMime.includes(f.type) || guessAllowedByExt(f.name, cfg);
    if (tooLarge) rejected.push({ file: f, reason: 'too_large' });
    else if (!allowed) rejected.push({ file: f, reason: 'not_allowed' });
    else accepted.push(f);
  }
  if (accepted.length > cfg.maxFiles) {
    // keep only first N per UX rules
    return {
      accepted: accepted.slice(0, cfg.maxFiles),
      rejected: rejected.concat(
        accepted
          .slice(cfg.maxFiles)
          .map((f) => ({ file: f, reason: 'too_large' as const })),
      ),
    };
  }
  return { accepted, rejected };
}

function guessAllowedByExt(name: string, cfg: UploadsConfig): boolean {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf'))
    return cfg.allowedMime.includes('application/pdf');
  if (lower.endsWith('.txt')) return cfg.allowedMime.includes('text/plain');
  if (lower.endsWith('.md')) return cfg.allowedMime.includes('text/markdown');
  if (lower.endsWith('.docx'))
    return cfg.allowedMime.includes(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
  if (lower.endsWith('.doc'))
    return cfg.allowedMime.includes('application/msword');
  return false;
}

export function normalizeAttachment(file: File): FileAttachment {
  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    name: file.name,
    size: file.size,
    type: file.type,
    file,
  };
}
