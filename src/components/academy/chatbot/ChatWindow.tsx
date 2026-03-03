'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface Source {
  title: string;
  id: string;
  module: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

interface ChatWindowProps {
  onClose: () => void;
}

export const ChatWindow = ({ onClose }: ChatWindowProps) => {
  const t = useTranslations('chatbot');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t('initial_greeting') }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/academy/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();

      let content = data.response;
      if (data.sources && data.sources.length > 0) {
        content += `\n\n**${t('sources')}**\n` +
          data.sources.map((s: Source) => `- [${s.title}](/academy/unit/${s.id}) (${s.module})`).join('\n');
      }

      const botMessage: Message = {
        role: 'assistant',
        content: content,
        sources: data.sources
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: t('error') }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-20 right-6 w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden"
      style={{ maxHeight: 'calc(100vh - 120px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-blue-700 text-white rounded-t-lg shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
            <Bot className="w-5 h-5" />
          </div>
          <span className="font-semibold">{t('title')}</span>
        </div>
        <button onClick={onClose} className="hover:bg-blue-600 p-1 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 bg-slate-900 min-h-[300px]"
      >
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm animate-pulse ml-2 mb-4">
            <Bot className="w-4 h-4" />
            <span>{t('thinking')}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        isLoading={isLoading}
        placeholder={t('placeholder')}
      />
    </motion.div>
  );
};
