'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Anchor, MessageCircle, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    role: 'user' | 'model';
    content: string;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: '¡Hola! Soy El Piloto, tu instructor virtual. ¿En qué puedo ayudarte hoy con tu navegación?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            if (!response.ok) {
                throw new Error('Error al conectar con el servidor');
            }

            const data = await response.json();
            const botMessage: Message = { role: 'model', content: data.response };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            setMessages(prev => [...prev, { role: 'model', content: 'Lo siento, he tenido un problema técnico. Por favor, intenta de nuevo.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', duration: 0.3 }}
                        className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-600 p-1.5 rounded-full">
                                    <Anchor size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">El Piloto</h3>
                                    <p className="text-xs text-slate-400">Asistente Náutico IA</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                                        }`}
                                    >
                                        {msg.role === 'model' ? (
                                            <div className="text-sm space-y-2">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        p: ({node, ...props}: any) => <p {...props} className="leading-relaxed" />,
                                                        a: ({node, ...props}: any) => <a {...props} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" />,
                                                        ul: ({node, ...props}: any) => <ul {...props} className="list-disc pl-4 space-y-1 my-2" />,
                                                        ol: ({node, ...props}: any) => <ol {...props} className="list-decimal pl-4 space-y-1 my-2" />,
                                                        li: ({node, ...props}: any) => <li {...props} className="pl-1" />,
                                                        strong: ({node, ...props}: any) => <strong {...props} className="font-semibold text-blue-200" />,
                                                        em: ({node, ...props}: any) => <em {...props} className="italic text-slate-300" />,
                                                        h1: ({node, ...props}: any) => <h1 {...props} className="text-lg font-bold text-white mt-4 mb-2" />,
                                                        h2: ({node, ...props}: any) => <h2 {...props} className="text-base font-bold text-white mt-3 mb-2" />,
                                                        h3: ({node, ...props}: any) => <h3 {...props} className="text-sm font-bold text-white mt-2 mb-1" />,
                                                        blockquote: ({node, ...props}: any) => <blockquote {...props} className="border-l-2 border-blue-500 pl-3 italic text-slate-400 my-2" />,
                                                        code: ({node, ...props}: any) => <code {...props} className="bg-slate-800 px-1 py-0.5 rounded text-xs font-mono text-blue-200" />
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 p-3 rounded-lg rounded-bl-none border border-slate-700 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-0"></div>
                                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></div>
                                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-300"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Pregunta sobre navegación..."
                                className="flex-1 bg-slate-900 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700 placeholder:text-slate-500"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-colors z-50 border-2 border-slate-900"
                aria-label={isOpen ? "Cerrar chat" : "Abrir chat con El Piloto"}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </motion.button>
        </div>
    );
}
