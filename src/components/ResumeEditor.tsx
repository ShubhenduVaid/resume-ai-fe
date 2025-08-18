import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { ScrollArea } from './ui/scroll-area';
import { Markdown } from './markdown/Markdown';

interface ResumeEditorProps {
  content: string;
  onChange: (content: string) => void;
  isPreviewMode: boolean;
}

export function ResumeEditor({
  content,
  onChange,
  isPreviewMode,
}: ResumeEditorProps) {
  const extensions = useMemo(
    () => [markdown({ base: markdownLanguage, codeLanguages: languages })],
    [],
  );

  if (isPreviewMode) {
    return (
      <ScrollArea className="h-full">
        <div className="p-8 max-w-4xl mx-auto">
          <div className="prose prose-gray max-w-none dark:prose-invert">
            <Markdown content={content} variant="resume" />
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className="h-full">
      <CodeMirror
        value={content}
        height="100%"
        extensions={extensions}
        onChange={(value) => onChange(value)}
        theme={undefined} // Will use light theme by default, can be switched to oneDark for dark mode
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightSelectionMatches: false,
          searchKeymap: true,
        }}
        className="h-full"
        style={{
          fontSize: '14px',
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        }}
      />
    </div>
  );
}
