import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import { getDocumentComponents } from './components/documentComponents';
import { getResumeComponents } from './components/resumeComponents';
import { placeholder } from '@uiw/react-codemirror';

export type MarkdownVariant = 'document' | 'resume' | 'chat';

interface MarkdownProps {
  content: string;
  variant: MarkdownVariant;
  isMobile?: boolean;
  className?: string;
}

// component maps moved to their own files above

export function Markdown({
  content,
  variant,
  isMobile = false,
  className,
}: MarkdownProps) {
  const remarkPlugins = React.useMemo(() => {
    switch (variant) {
      case 'chat':
        return [remarkGfm, remarkBreaks] as any[];
      case 'document':
      case 'resume':
      default:
        return [remarkGfm] as any[];
    }
  }, [variant]);

  const rehypePlugins = React.useMemo(() => {
    switch (variant) {
      case 'resume':
        return [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
          rehypeHighlight,
        ] as any[];
      case 'document':
        return [rehypeSlug, rehypeHighlight] as any[];
      case 'chat':
      default:
        return [] as any[];
    }
  }, [variant]);

  const components = React.useMemo<Components>(() => {
    switch (variant) {
      case 'document':
        return getDocumentComponents(isMobile);
      case 'resume':
        return getResumeComponents();
      case 'chat':
      default:
        return {};
    }
  }, [variant, isMobile]);

  const skipHtml = variant === 'chat';

  return (
    <ReactMarkdown
      className={className}
      skipHtml={skipHtml}
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}

export default Markdown;
