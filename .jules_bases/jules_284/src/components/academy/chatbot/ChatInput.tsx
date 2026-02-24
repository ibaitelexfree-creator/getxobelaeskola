'use client';

import { Send, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder: string;
}

export const ChatInput = ({ onSend, isLoading, placeholder }: ChatInputProps) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSend(value);
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-slate-700 bg-slate-900 rounded-b-lg">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-slate-800 text-white placeholder-slate-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={!value.trim() || isLoading}
        className={`p-2 rounded-md transition-colors ${
          !value.trim() || isLoading
            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </form>
  );
};
