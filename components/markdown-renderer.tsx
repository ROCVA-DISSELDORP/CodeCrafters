"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-zinc max-w-none prose-pre:bg-zinc-800 prose-pre:border prose-pre:border-zinc-700 prose-code:text-indigo-300 prose-a:text-indigo-400">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
