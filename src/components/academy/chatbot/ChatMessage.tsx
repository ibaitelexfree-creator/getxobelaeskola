'use client';

import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div
      className={`flex w-full mb-4 ${role === 'user' ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed ${
          role === 'user'
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700 shadow-md"
        }`}
      >
        <div className="prose prose-invert prose-sm max-w-none break-words">
          <ReactMarkdown
            components={{
              a: (props) => <a {...props} className="text-blue-300 hover:text-blue-200 underline" target="_blank" rel="noopener noreferrer" />,
              p: (props) => <p {...props} className="mb-2 last:mb-0" />,
              ul: (props) => <ul {...props} className="list-disc pl-4 mb-2 space-y-1" />,
              ol: (props) => <ol {...props} className="list-decimal pl-4 mb-2 space-y-1" />,
              li: (props) => <li {...props} className="mb-0" />,
              strong: (props) => <strong {...props} className="font-bold text-white" />
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
