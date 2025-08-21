import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorView } from '@codemirror/view';
import { ScrollArea } from './ui/scroll-area';
import {
  FileText,
  MessageSquareText,
  Upload,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { Button } from './ui/button';
import { Markdown } from './markdown/Markdown';

interface DocumentCanvasProps {
  content: string;
  onChange: (content: string) => void;
  isPreviewMode: boolean;
  isMobile?: boolean;
  isEmpty?: boolean;
  hasMessages?: boolean;
  onStartFromScratch?: () => void;
  footerSlot?: React.ReactNode;
  onClickImportResume?: () => void;
  onStartChatting?: () => void;
}

export function DocumentCanvas({
  content,
  onChange,
  isPreviewMode,
  isMobile = false,
  isEmpty = false,
  hasMessages = false,
  onStartFromScratch,
  footerSlot,
  onClickImportResume,
  onStartChatting,
}: DocumentCanvasProps) {
  const extensions = useMemo(
    () => [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      EditorView.theme({
        '&': {
          fontSize: isMobile ? '16px' : '14px', // Prevent zoom on iOS
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        },
        '.cm-content': {
          padding: isMobile ? '20px 16px' : '32px 40px',
          lineHeight: '1.6',
          minHeight: '100%',
          // No extra bottom padding; MiniChat is part of layout
          paddingBottom: null,
        },
        '.cm-focused': {
          outline: 'none',
        },
        '.cm-editor': {
          height: '100%',
        },
        '.cm-scroller': {
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        },
        '.cm-line': {
          paddingLeft: '0',
          paddingRight: '0',
        },
        // Touch-friendly selections on mobile
        '.cm-selectionBackground': {
          backgroundColor: isMobile ? 'rgba(59, 130, 246, 0.3)' : null,
        },
      }),
      EditorView.lineWrapping,
    ],
    [isMobile],
  );

  // Preview Mode Empty State
  if (isPreviewMode && isEmpty) {
    return (
      <div className="h-full bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-lg mx-auto px-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Preview Your Resume
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your resume will appear here as a beautifully formatted document.
              Start by chatting with the AI assistant or importing an existing
              resume.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={onStartChatting}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors w-full focus:outline-none"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MessageSquareText className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Start Chatting
                </h3>
                <p className="text-sm text-gray-600">
                  Tell the AI about your experience and it will create your
                  resume
                </p>
              </button>

              <button
                type="button"
                onClick={onClickImportResume}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors w-full focus:outline-none"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Import Resume
                </h3>
                <p className="text-sm text-gray-600">
                  Drag & drop your existing resume to get started
                </p>
              </button>

              {/* LinkedIn import card disabled pending approval
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Linkedin className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Import LinkedIn
                </h3>
                <p className="text-sm text-gray-600">
                  Use the upload button to import from LinkedIn
                </p>
              </div>
              */}
            </div>

            {!isMobile && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center gap-2 text-blue-700 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">Pro Tip</span>
                </div>
                <p className="text-sm text-blue-600">
                  Press{' '}
                  <kbd className="px-2 py-1 bg-white rounded border border-blue-300 font-mono text-xs">
                    /
                  </kbd>{' '}
                  anywhere to focus the chat input
                </p>
              </div>
            )}
          </div>
        </div>
        {footerSlot && (
          <div className={isMobile ? 'px-4 py-3' : 'px-8 py-4'}>
            {footerSlot}
          </div>
        )}
      </div>
    );
  }

  // Editor Mode Empty State (only show on true first-run with no messages)
  if (!isPreviewMode && isEmpty && !hasMessages) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Edit3 className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Markdown Editor
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Write and edit your resume in Markdown format. The AI assistant can
            help you create content, or you can start typing directly here.
          </p>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-left max-w-md mx-auto mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Markdown Basics:</h3>
            <div className="space-y-2 text-sm text-gray-600 font-mono">
              <div>
                <code># Heading 1</code>{' '}
                <span className="text-gray-400">- Main title</span>
              </div>
              <div>
                <code>## Heading 2</code>{' '}
                <span className="text-gray-400">- Section</span>
              </div>
              <div>
                <code>**Bold text**</code>{' '}
                <span className="text-gray-400">- Bold</span>
              </div>
              <div>
                <code>- List item</code>{' '}
                <span className="text-gray-400">- Bullet point</span>
              </div>
              <div>
                <code>[Link](url)</code>{' '}
                <span className="text-gray-400">- Hyperlink</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() =>
                onChange(
                  '# Your Name\n\n**Your Job Title**\n\n📧 your.email@example.com | 📱 (555) 123-4567\n\n---\n\n## Professional Summary\n\n[Add your professional summary here]\n\n---\n\n## Experience\n\n### Company Name - Job Title\n**Start Date - End Date** | Location\n\n- [Add your responsibilities and achievements]\n- [Use bullet points for easy reading]\n\n---\n\n## Education\n\n**Degree Name**\nUniversity Name | Graduation Year\n\n---\n\n## Skills\n\n- **Technical Skills**: [List your technical skills]\n- **Languages**: [Languages you speak]\n- **Certifications**: [Relevant certifications]',
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start with Template
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isPreviewMode) {
    return (
      <div className="h-full bg-gray-50">
        <ScrollArea className="h-full">
          <div
            className={`mx-auto ${isMobile ? 'px-4 py-6' : 'px-8 py-12 max-w-4xl'}`}
          >
            {/* Document Paper Effect with PDF data attribute */}
            <div
              className={`bg-white shadow-lg border border-gray-100 rounded-lg min-h-[800px] overflow-hidden ${
                isMobile ? 'shadow-md' : 'shadow-lg'
              }`}
              data-pdf-content
            >
              <div className={isMobile ? 'px-6 py-8' : 'px-12 py-12'}>
                <Markdown
                  content={content}
                  variant="document"
                  isMobile={isMobile}
                />
              </div>
            </div>

            {/* Optional footer slot for inline components like MiniChat */}
            {footerSlot && <div className="mt-3">{footerSlot}</div>}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <CodeMirror
        value={content}
        height="100%"
        extensions={extensions}
        onChange={(value) => onChange(value)}
        theme="light"
        basicSetup={{
          lineNumbers: !isMobile, // Hide line numbers on mobile for more space
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightSelectionMatches: false,
          searchKeymap: !isMobile, // Disable search on mobile to avoid conflicts
        }}
        className="h-full"
      />
      {footerSlot && (
        <div className={isMobile ? 'px-4 py-3' : 'px-8 py-4'}>{footerSlot}</div>
      )}
    </div>
  );
}
