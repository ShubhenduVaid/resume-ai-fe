import type { FileAttachment } from '@/types';

export async function readFileToAttachment(
  file: File,
): Promise<FileAttachment> {
  const attachment: FileAttachment = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: file.name,
    size: file.size,
    type: file.type,
    file,
  };

  // Read content for text files
  if (
    file.type.startsWith('text/') ||
    file.name.endsWith('.md') ||
    file.name.endsWith('.txt')
  ) {
    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve((ev.target?.result as string) || '');
        reader.onerror = reject;
        reader.readAsText(file);
      });
      attachment.content = content;
    } catch {
      // ignore read error
    }
  }

  return attachment;
}
