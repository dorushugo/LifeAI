"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

interface MarkdownProps {
  children: string;
}

export function Markdown({ children }: MarkdownProps) {
  const components: Components = {
    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="list-disc ml-4 mb-4">{children}</ul>,
    ol: ({ children }) => (
      <ol className="list-decimal ml-4 mb-4">{children}</ol>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,
    a: ({ children, href }) => (
      <a
        href={href}
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  };

  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
}
