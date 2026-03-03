
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    webViewLink: string;
    modifiedTime: string;
    thumbnailLink?: string;
}

export default function DriveExplorerTab() {
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFiles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/drive/list');
            const data = await res.json();
            if (res.ok) {
                setFiles(data.files || []);
            } else {
                setError(data.error || 'Failed to fetch files');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-end">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-[1px] bg-brass-gold/50" />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brass-gold/60">Cloud Documentation</span>
                    </div>
                    <h2 className="text-4xl font-display text-white italic tracking-tight">Google Drive <span className="text-brass-gold underline underline-offset-8 decoration-brass-gold/20">Explorer</span></h2>
                </div>
                <button
                    onClick={fetchFiles}
                    disabled={isLoading}
                    className="px-6 py-2 border border-white/10 text-[10px] uppercase tracking-widest text-white/40 hover:border-brass-gold hover:text-brass-gold transition-all rounded-full"
                >
                    {isLoading ? 'Sincronizando...' : 'Actualizar Vista'}
                </button>
            </header>

            {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-sm">
                    <p className="text-red-500 text-xs font-mono">⚠️ Error: {error}</p>
                    <p className="text-white/40 text-[10px] mt-2 italic">Asegúrate de que la carpeta de Drive esté compartida con la cuenta de servicio.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-32 bg-white/5 border border-white/5 rounded-sm animate-pulse" />
                    ))
                ) : files.length > 0 ? (
                    files.map((file) => (
                        <a
                            key={file.id}
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative p-6 bg-nautical-black border border-white/5 rounded-sm hover:border-brass-gold/40 transition-all overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                <span className="text-2xl">📄</span>
                            </div>

                            <div className="relative z-10 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">{file.mimeType.split('/').pop()?.toUpperCase()}</p>
                                    <h4 className="text-lg font-display text-white group-hover:text-brass-gold transition-colors line-clamp-1">{file.name}</h4>
                                </div>

                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-mono text-white/30 italic">Modificado: {new Date(file.modifiedTime).toLocaleDateString()}</span>
                                    <span className="text-xs text-brass-gold opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">Abrir 🡒</span>
                                </div>
                            </div>

                            {/* Hover effect background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-brass-gold/0 to-brass-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-sm">
                        <p className="text-white/20 italic font-display text-xl underline underline-offset-8 decoration-white/5">No se encontraron archivos en la carpeta compartida.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
