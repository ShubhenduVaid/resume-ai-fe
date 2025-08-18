import React from 'react';
import type { Components } from 'react-markdown';

export function getDocumentComponents(
  isMobile: boolean | undefined,
): Components {
  return {
    h1: ({ children, ...props }) => {
      const hasLink = React.Children.toArray(children).some(
        (child) => React.isValidElement(child) && (child as any).type === 'a',
      );

      if (hasLink) {
        return (
          <div className="text-center mb-3" {...props}>
            <h1
              className={`font-bold text-gray-900 mb-0 leading-tight ${
                isMobile ? 'text-2xl' : 'text-3xl'
              }`}
            >
              {children}
            </h1>
          </div>
        );
      }

      return (
        <h1
          className={`font-bold mb-4 mt-6 text-gray-900 border-b border-gray-300 pb-2 first:mt-0 ${
            isMobile ? 'text-xl' : 'text-2xl'
          }`}
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }) => (
      <h2
        className={`font-semibold mt-6 mb-3 text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-1 first:mt-0 ${
          isMobile ? 'text-base' : 'text-lg'
        }`}
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        className={`font-semibold mt-4 mb-2 text-gray-900 ${
          isMobile ? 'text-sm' : 'text-base'
        }`}
        {...props}
      >
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => {
      const text = React.Children.toArray(children).join('');

      const hasContactInfo =
        React.Children.toArray(children).some(
          (child) => React.isValidElement(child) && (child as any).type === 'a',
        ) &&
        typeof text === 'string' &&
        text.includes('@');

      if (hasContactInfo) {
        return (
          <div className="text-center mb-4 contact-info" {...props}>
            <p
              className={`text-gray-600 mb-0 ${isMobile ? 'text-xs' : 'text-sm'}`}
            >
              {children}
            </p>
          </div>
        );
      }

      return (
        <p
          className={`mb-3 text-gray-800 leading-relaxed ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}
          {...props}
        >
          {children}
        </p>
      );
    },
    a: ({ children, href, ...props }) => (
      <a
        href={href as string}
        className="text-blue-600 hover:text-blue-800 no-underline touch-manipulation"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
    ul: ({ children, ...props }) => (
      <ul className="mb-3 space-y-1 text-gray-800" {...props}>
        {children}
      </ul>
    ),
    li: ({ children, ...props }) => (
      <li
        className={`leading-relaxed flex items-start gap-2 ${
          isMobile ? 'text-xs' : 'text-sm'
        }`}
        {...props}
      >
        <span
          className={`inline-block bg-gray-500 rounded-full flex-shrink-0 ${
            isMobile ? 'w-1 h-1 mt-1.5' : 'w-1.5 h-1.5 mt-2'
          }`}
        ></span>
        <span className="flex-1">{children}</span>
      </li>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-gray-900" {...props}>
        {children}
      </strong>
    ),
    hr: ({ ...props }) => (
      <div className="text-center my-4 divider" {...props}>
        <div className="inline-flex items-center space-x-2">
          <span className="text-gray-400">•</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-400">•</span>
        </div>
      </div>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-blue-200 pl-6 italic text-gray-700 my-4 bg-blue-50 py-3 rounded-r"
        {...props}
      >
        {children}
      </blockquote>
    ),
    code: ({ children, className, ...props }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code
            className={`bg-gray-100 px-2 py-1 rounded font-mono text-gray-800 ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }) => (
      <pre
        className={`bg-gray-50 border border-gray-200 p-4 rounded-lg overflow-x-auto font-mono mb-4 ${
          isMobile ? 'text-xs' : 'text-sm'
        }`}
        {...props}
      >
        {children}
      </pre>
    ),
  };
}

export default getDocumentComponents;
