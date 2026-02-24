'use client';

import React, { useState } from 'react';
import { validateIdentityDocument, validateEmail, DocumentType } from '@/lib/utils/validators';
import { useTranslations } from 'next-intl';

export type ActivityType = 'course' | 'rental' | 'udalekus' | 'membership' | 'training';

interface LegalConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { fullName: string; email: string; dni: string; password?: string }) => void;
    activityType: ActivityType;
    legalText: string;
    initialData?: {
        fullName?: string;
        email?: string;
        dni?: string;
    };
}

export default function LegalConsentModal({
    isOpen,
    onClose,
    onConfirm,
    activityType,
    legalText,
    initialData
}: LegalConsentModalProps) {
    const t = useTranslations('legal_modal');
    const tV = useTranslations('validation');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [dni, setDni] = useState('');
    const [documentType, setDocumentType] = useState<DocumentType>('DNI');
    const [dniError, setDniError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [viewingDoc, setViewingDoc] = useState<string | null>(null);

    // Initial data hydration
    React.useEffect(() => {
        if (isOpen && initialData) {
            if (initialData.fullName) setFullName(initialData.fullName);
            if (initialData.email) setEmail(initialData.email);
            if (initialData.dni) setDni(initialData.dni);
        }
    }, [isOpen, initialData]);

    const documents = React.useMemo(() => {
        const allDocs = [
            { id: 'course', name: 'Formulario Inscripción a cursos', path: '/Documentos/Formularios inscripcion, LOPD y normas a firmar al contratar servicioos/Formulario Inscripción a cursos.pdf' },
            { id: 'membership', name: 'Formulario Inscripción Socios', path: '/Documentos/Formularios inscripcion, LOPD y normas a firmar al contratar servicioos/Formulario Inscripción Socias.pdf' },
            { id: 'training', name: 'Formulario Inscripción Equipos', path: '/Documentos/Formularios inscripcion, LOPD y normas a firmar al contratar servicioos/Formulario Inscripción Equipos de entrenamiento.pdf' },
            { id: 'udalekus', name: 'Normas y LOPD Udalekus', path: '/Documentos/Formularios inscripcion, LOPD y normas a firmar al contratar servicioos/Formulario Inscripción Udalekus.pdf' },
        ];

        switch (activityType) {
            case 'udalekus':
                return allDocs.filter(d => d.id === 'udalekus' || d.id === 'course');
            case 'membership':
                return allDocs.filter(d => d.id === 'membership');
            case 'training':
                return allDocs.filter(d => d.id === 'training');
            case 'rental':
            case 'course':
            default:
                return allDocs.filter(d => d.id === 'course');
        }
    }, [activityType]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accepted) return;

        // Validate DNI/NIE/Passport
        const validation = validateIdentityDocument(dni, documentType);
        if (!validation.isValid) {
            setDniError(validation.message || tV('email_invalid')); // Using generic if message empty
            return;
        }

        // Validate Email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            setEmailError(emailValidation.message || tV('email_invalid'));
            return;
        }

        setLoading(true);
        onConfirm({
            fullName,
            email,
            dni: dni.toUpperCase().trim()
        });
    };

    return (
        <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4 bg-nautical-black/90 backdrop-blur-sm">
            <div className="bg-nautical-black border border-white/10 w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-display text-white uppercase tracking-widest">
                        {viewingDoc ? t('viewing_doc') : (activityType === 'rental' ? t('rental_title') : t('terms_title'))}
                    </h2>
                    <button
                        onClick={viewingDoc ? () => setViewingDoc(null) : onClose}
                        className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-widest"
                    >
                        {viewingDoc ? `← ${t('back')}` : '✕'}
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden h-full">
                    <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar flex-1">
                        {viewingDoc ? (
                            <div className="h-full min-h-[50vh] border border-white/10">
                                <iframe
                                    src={viewingDoc}
                                    className="w-full h-full"
                                    title="Document Viewer"
                                />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <p className="text-xs uppercase tracking-widest text-accent font-bold">{t('mandatory_docs')}</p>
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
                                    <p className="text-[10px] text-white/40 italic">{t('click_to_read')}</p>
                                </div>

                                <div className="bg-white/5 p-6 rounded-sm text-sm text-white/70 font-light leading-relaxed max-h-32 overflow-y-auto border border-white/5 italic custom-scrollbar block whitespace-pre-line">
                                    {legalText}
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-3xs uppercase tracking-widest text-accent font-bold">{t('full_name')}</label>
                                        <input
                                            required
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 p-4 text-white focus:border-accent outline-none text-sm transition-all"
                                            placeholder="Juan Pérez"
                                            readOnly={!!initialData?.fullName}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-3xs uppercase tracking-widest text-accent font-bold">{t('identity_doc')}</label>
                                        <div className="flex gap-2">
                                            <select
                                                value={documentType}
                                                onChange={(e) => {
                                                    const newType = e.target.value as DocumentType;
                                                    setDocumentType(newType);
                                                    if (dni) {
                                                        const validation = validateIdentityDocument(dni, newType);
                                                        setDniError(validation.isValid ? null : validation.message || 'Error');
                                                    }
                                                }}
                                                className="bg-white/5 border border-white/10 p-4 text-white focus:border-accent outline-none text-sm transition-all appearance-none cursor-pointer hover:bg-white/10"
                                            >
                                                <option value="DNI" className="bg-nautical-black">DNI</option>
                                                <option value="NIE" className="bg-nautical-black">NIE</option>
                                                <option value="PASPORT" className="bg-nautical-black">Pasaporte</option>
                                            </select>
                                            <input
                                                required
                                                type="text"
                                                value={dni}
                                                onChange={(e) => {
                                                    setDni(e.target.value);
                                                    if (dniError) setDniError(null);
                                                }}
                                                onBlur={() => {
                                                    if (dni) {
                                                        const validation = validateIdentityDocument(dni, documentType);
                                                        if (!validation.isValid) {
                                                            setDniError(validation.message || tV('email_invalid'));
                                                        }
                                                    }
                                                }}
                                                className={`flex-1 bg-white/5 border ${dniError ? 'border-red-500/50' : 'border-white/10'} p-4 text-white focus:border-accent outline-none text-sm transition-all`}
                                                placeholder={documentType === 'DNI' ? '12345678Z' : documentType === 'NIE' ? 'X1234567L' : 'Pasaporte N123456'}
                                                readOnly={!!initialData?.dni}
                                            />
                                        </div>
                                        {dniError && (
                                            <p className="text-red-400 text-[10px] mt-1 pl-1 flex items-center gap-1">
                                                <span>⚠️</span> {dniError}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-accent font-bold">{t('email_label')}</label>
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (emailError) setEmailError(null);
                                        }}
                                        onBlur={() => {
                                            if (email) {
                                                const validation = validateEmail(email);
                                                if (!validation.isValid) {
                                                    setEmailError(validation.message || tV('email_invalid'));
                                                }
                                            }
                                        }}
                                        className={`w-full bg-white/5 border ${emailError ? 'border-red-500/50' : 'border-white/10'} p-4 text-white focus:border-accent outline-none text-sm transition-all`}
                                        placeholder="juan@ejemplo.com"
                                        readOnly={!!initialData?.email}
                                    />
                                    {emailError && (
                                        <p className="text-red-400 text-xs mt-1 pl-1 flex items-center gap-1">
                                            <span>⚠️</span> {emailError}
                                        </p>
                                    )}
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
                                        {t('confirmation_checkbox')}
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
                                {t('cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={!accepted || loading}
                                className={`flex-[2] py-5 bg-accent text-nautical-black text-3xs uppercase tracking-widest font-bold transition-all ${!accepted ? 'opacity-30 grayscale' : 'hover:scale-[1.02] shadow-xl shadow-accent/20'}`}
                            >
                                {loading ? t('processing') : t('sign_and_continue')}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
