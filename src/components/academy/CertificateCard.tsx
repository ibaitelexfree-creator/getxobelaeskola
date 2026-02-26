
'use client';

import { useState } from 'react';
import { Download, Loader2, Award } from 'lucide-react';
import { generateCertificatePDF } from '@/lib/certificates/pdfGenerator';

interface CertificateProps {
    certificate: any;
    studentName: string;
    locale: string;
}

export default function CertificateCard({ certificate, studentName, locale }: CertificateProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsGenerating(true);
        try {
            const courseName = certificate.tipo === 'curso'
                ? (locale === 'eu' ? certificate.curso?.nombre_eu : certificate.curso?.nombre_es)
                : certificate.tipo === 'nivel'
                    ? (locale === 'eu' ? certificate.nivel?.nombre_eu : certificate.nivel?.nombre_es)
                    : 'Capitán de Vela';

<<<<<<< HEAD
            // Map distinction to English types expected by the generator
            const distinctionVal = certificate.nivel_distincion || 'estandar';
            const distinctionMap: Record<string, 'standard' | 'merit' | 'excellence'> = {
                'estandar': 'standard',
                'merito': 'merit',
                'excelencia': 'excellence',
                'standard': 'standard',
                'merit': 'merit',
                'excellence': 'excellence'
            };

=======
>>>>>>> pr-286
            await generateCertificatePDF({
                studentName: studentName || 'Estudiante',
                courseName: courseName || 'Curso de Vela',
                issueDate: certificate.fecha_emision,
                certificateId: certificate.numero_certificado,
                verificationHash: certificate.verificacion_hash,
<<<<<<< HEAD
                distinction: distinctionMap[distinctionVal] || 'standard',
=======
                distinction: certificate.nivel_distincion || 'estandar',
>>>>>>> pr-286
                // hours could be passed if API returned it, skipping for now
            });
        } catch (err) {
            console.error('Error generating PDF', err);
            alert('Error al generar el certificado. Inténtalo de nuevo.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-accent/30 transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="text-3xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
                    <Award className="w-3 h-3" />
                    {certificate.tipo === 'curso' ? 'Certificado de Curso' : certificate.tipo === 'nivel' ? 'Diploma de Nivel' : 'Diploma de Capitán'}
                </div>
                <div className="text-3xs text-white/30 font-mono">
                    #{certificate.numero_certificado}
                </div>
            </div>

            <h4 className="text-white font-bold mb-1 relative z-10">
                {(certificate.distincion || certificate.nivel_distincion === 'excelencia') ? '⭐ ' : ''}
                {certificate.tipo === 'curso' ? (locale === 'eu' ? (certificate.curso?.nombre_eu || certificate.curso?.nombre_es) : certificate.curso?.nombre_es) :
                    certificate.tipo === 'nivel' ? (locale === 'eu' ? (certificate.nivel?.nombre_eu || certificate.nivel?.nombre_es) : certificate.nivel?.nombre_es) :
                        'Capitán de Vela'}
            </h4>

            <div className="flex justify-between items-end mt-4 relative z-10">
                <div className="text-2xs text-white/40">
                    Nota: <span className="text-white">{certificate.nota_final}%</span>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="flex items-center gap-2 text-3xs uppercase tracking-tighter font-black text-accent hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Generando...
                        </>
                    ) : (
                        <>
                            <Download className="w-3 h-3" />
                            Descargar PDF
                        </>
                    )}
                </button>
            </div>

            {/* Background Hover Effect */}
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
}
