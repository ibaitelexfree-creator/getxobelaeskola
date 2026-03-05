'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getAishaResponse } from '@/lib/aisha-responses';
import { ChatMessage } from '@/lib/types';

export const AishaChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleOpen = () => {
        if (!isOpen && messages.length === 0) {
            setMessages([{
                id: 'initial',
                role: 'aisha',
                content: "Hello! I'm Aisha 👋 How can I help you find your perfect home in Dubai today?",
                timestamp: new Date()
            }]);
        }
        setIsOpen(true);
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setIsTyping(true);

        try {
            // Priority 1: Real AI Response from API
            const apiResponse = await fetch('/realstate/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: currentInput })
            });

            if (apiResponse.ok) {
                const data = await apiResponse.json();
                if (data.response) {
                    const aishaMsg: ChatMessage = {
                        id: Date.now().toString(),
                        role: 'aisha',
                        content: data.response,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, aishaMsg]);
                    return;
                }
            }

            // Priority 2: Local Heuristic Fallback (if API fails or is in demo mode)
            const fallbackResponse = getAishaResponse(currentInput);
            const aishaMsgFallback: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'aisha',
                content: fallbackResponse.text,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aishaMsgFallback]);
        } catch (error) {
            console.error('Chat error:', error);
            // Emergency fallback
            setMessages(prev => [...prev, {
                id: 'error',
                role: 'aisha',
                content: "I'm having a brief moment of reflection. How else can I assist you with Dubai real estate?",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 2000 }}>
            {/* Floating Button */}
            <button
                onClick={handleOpen}
                className="chat-toggle"
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))',
                    border: 'none',
                    boxShadow: 'var(--shadow-gold)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}
            >
                <span style={{ fontSize: '1.75rem' }}>💬</span>
                <div
                    style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                        border: '2px solid var(--bg-primary)'
                    }}
                ></div>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="glass-card animate-fade-up"
                    style={{
                        position: 'absolute',
                        bottom: '80px',
                        right: 0,
                        width: '380px',
                        height: '520px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        border: '1px solid var(--border-gold)',
                        boxShadow: 'var(--shadow-md), var(--shadow-gold)'
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'rgba(212,168,67,0.1)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0f', fontWeight: 700 }}>A</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Aisha</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--gold-500)', fontWeight: 600 }}>AI PROPERTY ADVISOR</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem'
                        }}
                    >
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.25rem'
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor: msg.role === 'user' ? 'var(--gold-500)' : 'var(--bg-elevated)',
                                        color: msg.role === 'user' ? '#0a0a0f' : 'var(--text-primary)',
                                        padding: '0.875rem 1rem',
                                        borderRadius: msg.role === 'user' ? '1.25rem 1.25rem 0 1.25rem' : '1.25rem 1.25rem 1.25rem 0',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.5,
                                        border: msg.role === 'aisha' ? '1px solid var(--border-subtle)' : 'none'
                                    }}
                                >
                                    {msg.content}
                                </div>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.25rem', padding: '1rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '1rem 1rem 1rem 0' }}>
                                <div className="typing-dot" style={{ width: '4px', height: '4px', background: 'var(--gold-500)', borderRadius: '50%' }}></div>
                                <div className="typing-dot" style={{ width: '4px', height: '4px', background: 'var(--gold-500)', borderRadius: '50%', animationDelay: '0.2s' }}></div>
                                <div className="typing-dot" style={{ width: '4px', height: '4px', background: 'var(--gold-500)', borderRadius: '50%', animationDelay: '0.4s' }}></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleSendMessage}
                        style={{ padding: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}
                    >
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Type your message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                style={{ paddingRight: '4rem', paddingLeft: '1.25rem' }}
                            />
                            <button
                                type="submit"
                                style={{
                                    position: 'absolute',
                                    right: '0.5rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--gold-400)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    padding: '0.5rem'
                                }}
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <style jsx>{`
        .typing-dot {
          animation: typingBubble 1s infinite ease-in-out;
        }
        @keyframes typingBubble {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
        </div>
    );
};

export default AishaChatWidget;
