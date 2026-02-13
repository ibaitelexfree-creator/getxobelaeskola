'use client';

import React, { useState } from 'react';

interface LegalConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { fullName: string; email: string; dni: string }) => void;
    consentType: 'course' | 'rental';
    legalText: string;
}

export default function LegalConsentModal({
    isOpen,
    onClose,
    onConfirm,
    consentType,
    legalText
}: LegalConsentModalProps) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [dni, setDni] = useState('');
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [viewingDoc, setViewingDoc] = useState<string | null>(null);

    // Documentos disponibles
    const documents = [
        { name: 'Formulario Inscripción a cursos', path: '/Documentos/Formularios inscripcion, LOPD y normas a firmar al contratar servicioos/Formulario Inscripción a cursos.pdf' },
        { name: 'Formulario Inscripción Socios', path: '/Documentos/Formularios inscripcion, LOPD y normas a firmar al contratar servicioos/Formulario Inscripción Socias.pdf' },
        { name: 'Formulario Inscripción Equipos', path: '/Documentos/Formularios inscripcion, LOPD y normas a firmar al contratar servicioos/Formulario Inscripción Equipos de entrenamiento.pdf' },
        { name: 'Normas y LOPD Udalekus', path: '/Documentos/Formularios inscripcion, LOPD y normas a firmar al contratar servicioos/Formulario Inscripción Udalekus.pdf' },
    ];

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accepted) return;
        setLoading(true);
        onConfirm({ fullName, email, dni });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-nautical-black/90 backdrop-blur-sm">
            <div className="bg-nautical-black border border-white/10 w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-display text-white uppercase tracking-widest">
                        {viewingDoc ? 'Visualizando Documento' : (consentType === 'course' ? 'Términos de Inscripción' : 'Condiciones de Alquiler')}
                    </h2>
                    <button
                        onClick={viewingDoc ? () => setViewingDoc(null) : onClose}
                        className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-widest"
                    >
                        {viewingDoc ? '← Volver' : '✕'}
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                    <div className="p-8 overflow-y-auto space-y-8">
                        {viewingDoc ? (
                            <div className="h-[60vh] border border-white/10">
                                <iframe
                                    src={viewingDoc}
                                    className="w-full h-full"
                                    title="Document Viewer"
                                />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <p className="text-xs uppercase tracking-widest text-accent font-bold">Documentos Legales Obligatorios</p>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {documents.map((doc, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setViewingDoc(doc.path)}
                                                className="group p-4 bg-white/5 border border-white/10 hover:border-accent transition-all text-left flex justify-between items-center"
                                            >
                                                <span className="text-sm text-white/80 group-hover:text-white">{doc.name}</span>
                                                <span className="text-accent">📄</span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-white/40 italic">* Haz clic en cada documento para leerlo online desde aquí mismo.</p>
                                </div>

                                <div className="bg-white/5 p-6 rounded-sm text-sm text-white/70 font-light leading-relaxed max-h-40 overflow-y-auto border border-white/5 italic custom-scrollbar block whitespace-pre-line">
                                    {legalText}
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-3xs uppercase tracking-widest text-accent font-bold">Nombre Completo</label>
                                        <input
                                            required
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 p-4 text-white focus:border-accent outline-none text-sm transition-all"
                                            placeholder="Juan Pérez"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-3xs uppercase tracking-widest text-accent font-bold">DNI / NIE / Pasaporte</label>
                                        <input
                                            required
                                            type="text"
                                            value={dni}
                                            onChange={(e) => setDni(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 p-4 text-white focus:border-accent outline-none text-sm transition-all"
                                            placeholder="12345678Z"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-accent font-bold">Email de Registro</label>
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 p-4 text-white focus:border-accent outline-none text-sm transition-all"
                                        placeholder="juan@ejemplo.com"
                                    />
                                </div>

                                <label className="flex items-start gap-4 cursor-pointer group p-4 border border-accent/20 bg-accent/5 rounded-sm transition-all hover:bg-accent/10">
                                    <input
                                        type="checkbox"
                                        checked={accepted}
                                        onChange={(e) => setAccepted(e.target.checked)}
                                        className="mt-1 w-5 h-5 accent-accent"
                                        required
                                    />
                                    <span className="text-xs text-white/80 group-hover:text-white transition-colors leading-relaxed">
                                        Confirmo que he leído y acepto expresamente los documentos PDF arriba indicados, así como las condiciones detalladas en este formulario. Entiendo que esta aceptación equivale a una firma digital vinculante.
                                    </span>
                                </label>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {!viewingDoc && (
                        <div className="p-8 border-t border-white/10 bg-white/5 flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-5 border border-white/10 text-3xs uppercase tracking-widest font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!accepted || loading}
                                className={`flex-[2] py-5 bg-accent text-nautical-black text-3xs uppercase tracking-widest font-bold transition-all ${!accepted ? 'opacity-30 grayscale' : 'hover:scale-[1.02] shadow-xl shadow-accent/20'}`}
                            >
                                {loading ? 'Procesando...' : 'Firmar y Continuar al Pago'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
