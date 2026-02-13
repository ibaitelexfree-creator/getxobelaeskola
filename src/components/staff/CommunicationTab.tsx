'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { ClientDate } from './StaffShared';

interface Newsletter {
    id: string;
    title: string;
    content: string;
    status: string;
    created_at: string;
    scheduled_for?: string;
    sent_at?: string;
    recipients_count?: number;
}

interface CommunicationTabProps {
    newsletters: Newsletter[];
    onSendMessage: (data: { title: string, content: string, scheduled_for?: string }) => Promise<void>;
    isSending: boolean;
}

export default function CommunicationTab({ newsletters, onSendMessage, isSending }: CommunicationTabProps) {
    const t = useTranslations('staff_panel');
    const [title, setTitle] = React.useState('');
    const [content, setContent] = React.useState('');
    const [scheduledFor, setScheduledFor] = React.useState('');

    const handleSubmit = async () => {
        if (!title || !content) {
            alert('Por favor rellena el título y contenido');
            return;
        }
        await onSendMessage({
            title,
            content,
            scheduled_for: scheduledFor || undefined
        });
        setTitle('');
        setContent('');
        setScheduledFor('');
    };

    return (
        <div className="space-y-12 animate-premium-in">
            <header className="flex justify-between items-end border-b border-white/10 pb-12">
                <div className="space-y-2">
                    <span className="text-accent uppercase tracking-[0.4em] text-3xs font-bold block">Central de Operaciones</span>
                    <h2 className="text-6xl font-display text-white italic">{t('communication.title')}</h2>
                    <p className="text-technical text-white/40 tracking-[0.2em] uppercase">{t('communication.subtitle')}</p>
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-16">
                <div className="space-y-8 glass-panel p-12 relative overflow-hidden">
                    <h3 className="text-2xl font-display text-white italic border-b border-white/5 pb-6">{t('communication.new_message')}</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-[0.3em] text-white/30 font-bold">{t('communication.subject')}</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-5 text-white font-display italic outline-none focus:border-accent"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-[0.3em] text-white/30 font-bold">{t('communication.content')}</label>
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="w-full h-64 bg-white/5 border border-white/10 p-5 text-white italic outline-none focus:border-accent resize-none custom-scrollbar"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-3xs uppercase tracking-[0.3em] text-white/30 font-bold">{t('communication.schedule')}</label>
                            <input
                                type="datetime-local"
                                value={scheduledFor}
                                onChange={e => setScheduledFor(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-5 text-white font-mono text-2xs outline-none focus:border-accent"
                            />
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isSending}
                            className="w-full py-6 bg-accent text-nautical-black text-2xs uppercase tracking-[0.5em] font-black hover:bg-white transition-all shadow-xl shadow-accent/20 disabled:opacity-50"
                        >
                            {isSending ? 'PROCESANDO...' : (scheduledFor ? t('communication.save_schedule') : 'ENVIAR AHORA')}
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    <h3 className="text-2xl font-display text-white italic border-b border-white/5 pb-6">{t('communication.history')}</h3>
                    <div className="space-y-6">
                        {newsletters.length > 0 ? newsletters.map((msg, i) => (
                            <div key={i} className="p-8 border border-white/5 rounded-sm hover:bg-white/5 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-lg font-display text-white italic group-hover:text-accent transition-colors">{msg.title}</h4>
                                    <span className="text-technical text-white/20">{msg.recipients_count || 0} {t('communication.messages_count')}</span>
                                </div>
                                <p className="text-sm text-white/40 font-mono mb-4 italic truncate">&quot;{msg.content}&quot;</p>
                                <div className="flex justify-between items-center text-[8px] uppercase tracking-widest text-white/20 font-black">
                                    <span><ClientDate date={msg.created_at} format="short" /></span>
                                    <span className="text-accent">{msg.status === 'scheduled' ? t('communication.scheduled_for') : 'ENVIADO'}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-24 border border-dashed border-white/5 text-center italic text-white/20 font-display text-xl">
                                {t('communication.no_messages')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
