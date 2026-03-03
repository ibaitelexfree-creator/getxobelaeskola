'use client';

import React from 'react';

interface SubmissionViewerProps {
    content: any;
    activityTitle: string;
}

export default function SubmissionViewer({ content, activityTitle }: SubmissionViewerProps) {
    // Determine content type
    const textContent = typeof content === 'string' ? content : content?.text || content?.respuesta || JSON.stringify(content, null, 2);
    const fileUrl = content?.fileUrl || content?.archivo_url;

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-display italic text-white mb-4">Ejercicio: {activityTitle}</h3>

            <div className="prose prose-invert max-w-none">
                {textContent && (
                    <div className="bg-black/30 p-4 rounded text-white/90 whitespace-pre-wrap font-mono text-sm">
                        {textContent}
                    </div>
                )}

                {fileUrl && (
                    <div className="mt-4">
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-accent hover:underline"
                        >
                            <span className="text-xl">📎</span> Ver Archivo Adjunto
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
