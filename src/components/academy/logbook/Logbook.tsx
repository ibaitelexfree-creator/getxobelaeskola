'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Camera, CameraResultType } from '@capacitor/camera';
import imageCompression from 'browser-image-compression';
import {
    Book, MapPin, Award, Ship, Waves, Wind,
    ChevronRight, Anchor, Calendar, Download, Plus, Trash2, Smile, Layers, HelpCircle,
    Camera as CameraIcon, Image as ImageIcon, X
} from 'lucide-react';
import { apiUrl } from '@/lib/api';
import { useAcademyFeedback } from '@/hooks/useAcademyFeedback';
import { useSmartTracker } from '@/hooks/useSmartTracker';

// Direct dynamic import with explicit default handling
const LeafletMap = dynamic(
    () => import('./LeafletLogbookMap').then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-[#050b14] animate-pulse flex items-center justify-center text-blue-500/20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-[10px] uppercase tracking-widest">Cargando Mapa...</span>
                </div>
            </div>
        )
    }
);

export default function Logbook() {
    const [activeTab, setActiveTab] = useState<'official' | 'map' | 'skills' | 'diary'>('official');
    const [officialData, setOfficialData] = useState<any>(null);
    const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
    const [allSkills, setAllSkills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingDiary, setLoadingDiary] = useState(false);
    const [isSavingDiary, setIsSavingDiary] = useState(false);
    const [newDiaryContent, setNewDiaryContent] = useState('');
    const [selectedPoint, setSelectedPoint] = useState<any>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const params = useParams();
    const { showMessage } = useAcademyFeedback();

    async function loadDiary() {
        setLoadingDiary(true);
        try {
            const res = await fetch(apiUrl('/api/logbook/diary'));
            if (res.ok) {
                const data = await res.json();
                setDiaryEntries(data);
            }
        } catch (error) {
            console.error('Error loading diary:', error);
        } finally {
            setLoadingDiary(false);
        }
    }

    async function loadSkills() {
        try {
            const res = await fetch(apiUrl('/api/skills'));
            if (res.ok) {
                const data = await res.json();
                setAllSkills(data.habilidades?.todas || []);
            }
        } catch (error) {
            console.error('Error loading skills:', error);
        }
    }

    const {
        isTracking,
        points: trackedPoints,
        startTracking,
        stopTracking,
        statusMessage: trackingStatus
    } = useSmartTracker();

    async function loadData() {
        setLoading(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const res = await fetch(apiUrl('/api/academy/progress'), {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data = await res.json();
            console.log('Logbook Data Loaded:', data);
            setOfficialData(data);
        } catch (error) {
            console.error('Error loading logbook:', error);
            setOfficialData({ horas: [], estadisticas: { horas_totales: 0 }, user: { full_name: 'Invitado' } });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
        loadSkills();
    }, []);

    const handleToggleTracking = async () => {
        if (isTracking) {
            stopTracking();
            // Trigger save after a small delay to ensure last points are captured
            setTimeout(async () => {
                if (trackedPoints.length >= 2) {
                    try {
                        const res = await fetch(apiUrl('/api/logbook/save-tracking'), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ points: trackedPoints })
                        });
                        if (res.ok) {
                            showMessage('Travesía Guardada', 'Tu recorrido ha sido registrado en la bitácora', 'success');
                            loadData();
                        }
                    } catch (e) {
                        console.error('Error saving track', e);
                        showMessage('Error', 'No se pudo guardar el recorrido', 'error');
                    }
                }
            }, 500);
        } else {
            await startTracking();
            showMessage('Seguimiento Iniciado', 'Coge el timón, estamos grabando tu travesía', 'info');
        }
    };


    useEffect(() => {
        if (activeTab === 'diary') {
            loadDiary();
        }
    }, [activeTab]);

    const handleSelectImage = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 80,
                allowEditing: false,
                resultType: CameraResultType.Uri
            });

            if (image.webPath) {
                const response = await fetch(image.webPath);
                const blob = await response.blob();
                const file = new File([blob], `photo_${Date.now()}.jpg`, { type: blob.type });

                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };

                try {
                    const compressedFile = await imageCompression(file, options);
                    setSelectedImages(prev => [...prev, compressedFile]);

                    const previewUrl = URL.createObjectURL(compressedFile);
                    setPreviewUrls(prev => [...prev, previewUrl]);
                } catch (error) {
                    console.error('Compression error:', error);
                    // Fallback to original if compression fails
                    setSelectedImages(prev => [...prev, file]);
                    setPreviewUrls(prev => [...prev, URL.createObjectURL(file)]);
                }
            }
        } catch (error) {
            console.error('Error selecting image:', error);
        }
    };

    const handleRemoveImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            const newUrls = [...prev];
            URL.revokeObjectURL(newUrls[index]);
            newUrls.splice(index, 1);
            return newUrls;
        });
    };

    const uploadImages = async (): Promise<string[]> => {
        if (selectedImages.length === 0) return [];
        setIsUploading(true);
        const uploadedUrls: string[] = [];
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            for (const file of selectedImages) {
                const fileExt = file.name.split('.').pop() || 'jpg';
                const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('logbook-photos')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('logbook-photos')
                    .getPublicUrl(fileName);

                uploadedUrls.push(publicUrl);
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            showMessage('Error', 'No se pudieron subir las imágenes', 'error');
            throw error; // Re-throw to stop entry creation
        } finally {
            setIsUploading(false);
        }
        return uploadedUrls;
    };

    const handleAddDiaryEntry = async () => {
        if (!newDiaryContent.trim()) return;

        setIsSavingDiary(true);
        try {
            const mediaUrls = await uploadImages();

            const res = await fetch(apiUrl('/api/logbook/diary'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contenido: newDiaryContent,
                    media_urls: mediaUrls
                })
            });

            if (res.ok) {
                setNewDiaryContent('');
                setSelectedImages([]);
                setPreviewUrls([]);
                loadDiary();
                showMessage('Éxito', 'Entrada guardada en tu diario', 'success');
            } else {
                showMessage('Error', 'No se pudo guardar la entrada', 'error');
            }
        } catch (error) {
            console.error('Error adding diary entry:', error);
            if (!isUploading) showMessage('Error', 'Error de conexión', 'error');
        } finally {
            setIsSavingDiary(false);
        }
    };

    const handleDeleteDiaryEntry = async (id: string) => {
        try {
            const res = await fetch(apiUrl(`/api/logbook/diary?id=${id}`), {
                method: 'DELETE'
            });

            if (res.ok) {
                loadDiary();
                showMessage('Eliminado', 'Entrada eliminada', 'info');
            }
        } catch (error) {
            console.error('Error deleting diary entry:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
                <p className="text-white/40 text-[10px] uppercase mt-6 tracking-[0.3em]">Sincronizando Bitácora...</p>
            </div>
        );
    }

    const sessions = officialData?.horas || [];

    return (
        <div className={`w-full ${activeTab === 'map' ? 'max-w-7xl' : 'max-w-6xl'} mx-auto h-full flex flex-col font-display p-6 relative pb-20 transition-all duration-700`}>
            {/* Header */}
            <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center shadow-xl shadow-accent/10">
                        <Book className="text-nautical-black w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-white italic">Bitácora Digital</h1>
                        <p className="text-white/40 text-sm mt-1">Historial del Navegante: {officialData?.user?.full_name}</p>
                    </div>
                </div>

                <div className="px-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-center backdrop-blur-md">
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Millas Totales</div>
                    <div className="text-4xl font-black text-white">
                        {((officialData?.estadisticas?.horas_totales || 0) * 5.2).toFixed(1)}
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-3 mb-12">
                {[
                    { id: 'official', label: 'Oficial', icon: <Anchor size={14} /> },
                    { id: 'map', label: 'Mapa', icon: <MapPin size={14} /> },
                    { id: 'skills', label: 'Habilidades', icon: <Award size={14} /> },
                    { id: 'diary', label: 'Diario', icon: <Book size={14} /> }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                            ${activeTab === tab.id
                                ? 'bg-accent text-nautical-black shadow-lg shadow-accent/20 scale-105'
                                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-grow">
                {activeTab === 'official' && (
                    <div className="flex flex-col gap-8">
                        {/* Info Official Description */}
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 backdrop-blur-sm">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 shrink-0">
                                <Award size={32} />
                            </div>
                            <div className="flex-grow text-center md:text-left">
                                <h3 className="text-xl font-bold text-white mb-2 italic">Registro de Millas Oficial</h3>
                                <p className="text-white/50 text-sm leading-relaxed max-w-2xl">
                                    Este cuaderno contiene tus horas de navegación certificadas por Getxo Bela Eskola.
                                    Los registros aquí presentes son <span className="text-blue-400 font-bold">oficiales</span>, validados por instructores, y computan para la obtención de rangos y certificados.
                                    Cada milla te acerca más a tu próximo título.
                                </p>
                            </div>
                            <button
                                onClick={() => showMessage('Info', 'Funcionalidad de solicitud en desarrollo', 'info')}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                                <Plus size={14} /> Solicitar Registro
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {sessions.length > 0 ? (
                                sessions.map((session: any) => (
                                    <div key={session.id} className="group bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 rounded-3xl p-8 transition-all duration-500">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                            <div className="flex items-center gap-8">
                                                <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-3xl">
                                                    ⛵
                                                </div>
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">
                                                        {new Date(session.fecha).toLocaleDateString()}
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white group-hover:text-accent transition-colors">
                                                        {session.tipo}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-white/40 mt-2">
                                                        <span className="flex items-center gap-1"><Ship size={14} /> {session.embarcacion}</span>
                                                        <span className="flex items-center gap-1"><Wind size={14} /> {session.duracion_h}h</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2">
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${session.verificado ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'}`}>
                                                    {session.verificado ? 'Verificado' : 'Pendiente'}
                                                </div>
                                                <div className="text-[10px] text-white/20 uppercase tracking-tighter">ID: {session.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                                    <Anchor className="mx-auto text-white/5 mb-6" size={48} />
                                    <p className="text-white/40 font-bold uppercase tracking-widest text-xs mb-2">Aún no hay registros oficiales</p>
                                    <p className="text-white/20 text-xs max-w-xs mx-auto">Tus sesiones certificadas por la escuela aparecerán aquí automáticamente tras ser validadas.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'map' && (
                    <div className="relative w-full h-[650px] bg-[#050b14] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col">
                        <div className="absolute top-8 left-8 z-[1000] pointer-events-none">
                            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-3xl">
                                <h3 className="text-white font-bold text-sm mb-1 italic">Mapa de Travesías</h3>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest">Visualización de Millas</p>
                            </div>
                        </div>
                        {/* We render the dynamic component only when on the map tab */}
                        <LeafletMap
                            sessions={sessions}
                            selectedPoint={selectedPoint}
                            setSelectedPoint={setSelectedPoint}
                            activePoints={trackedPoints}
                            isTracking={isTracking}
                        />

                        {/* Floating Tracker Controls */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-4">
                            {isTracking && (
                                <div className="bg-black/80 backdrop-blur-xl border border-green-500/30 px-6 py-2 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-green-400">
                                        {trackingStatus}
                                    </span>
                                    <div className="w-px h-4 bg-white/10" />
                                    <span className="text-[10px] uppercase tracking-widest text-white/40">
                                        {trackedPoints.length} Puntos
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={handleToggleTracking}
                                className={`group relative px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-500 flex items-center gap-4 overflow-hidden
                                    ${isTracking
                                        ? 'bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.3)] hover:scale-105'
                                        : 'bg-accent text-nautical-black shadow-[0_0_40px_rgba(var(--accent-rgb),0.2)] hover:scale-110'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <span className="relative z-10 flex items-center gap-3">
                                    {isTracking ? <div className="w-3 h-3 bg-white rounded-sm" /> : <Waves size={18} className="animate-bounce" />}
                                    {isTracking ? 'Finalizar Travesía' : 'Empezar Travesía'}
                                </span>
                            </button>
                        </div>


                        {selectedPoint && (
                            <div className="absolute inset-y-6 right-6 w-80 bg-[#0a1628]/95 backdrop-blur-2xl border border-accent/30 rounded-3xl p-8 shadow-2xl z-[1000] overflow-hidden">
                                <button
                                    onClick={() => setSelectedPoint(null)}
                                    className="absolute top-4 right-4 text-white/20 hover:text-white"
                                >
                                    ✕
                                </button>
                                <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
                                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                                        <Anchor size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-accent font-black uppercase text-[10px] tracking-widest">Travesía</h4>
                                        <p className="text-white font-bold">{selectedPoint.zona_nombre || 'Navegación'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-widest text-white/40">Fecha</span>
                                        <p className="text-sm text-white">{new Date(selectedPoint.fecha).toLocaleDateString()}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-[10px] uppercase tracking-widest text-white/40 font-black">Navegado</span>
                                            <p className="text-lg font-black text-white">{selectedPoint.duracion_h} <span className="text-xs text-accent">h</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'skills' && (
                    <div className="flex flex-col gap-10">
                        <header className="flex items-center justify-between bg-white/5 border border-white/10 p-8 rounded-[2rem]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                                    <Layers size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white italic">Catálogo de Habilidades</h3>
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest">Dominio Técnico y Marino</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-black text-white">
                                    {allSkills.filter(s => s.obtenida).length}
                                </span>
                                <span className="text-white/20 text-xl font-bold"> / {allSkills.length || 12}</span>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(allSkills.length > 0 ? allSkills : (officialData?.habilidades || [])).map((h: any) => {
                                const skill = h.habilidad || h;
                                const isObtained = h.obtenida || !!h.fecha_obtencion;

                                return (
                                    <div key={skill.id} className={`group relative bg-white/[0.03] p-8 rounded-[2.5rem] border transition-all duration-500 ${isObtained ? 'border-accent/30' : 'border-white/5 opacity-60'}`}>
                                        {!isObtained && (
                                            <div className="absolute top-6 right-6 text-white/10 group-hover:text-white/20 transition-colors">
                                                <HelpCircle size={16} />
                                            </div>
                                        )}
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 ${isObtained ? 'bg-accent/10 border border-accent/20 shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)]' : 'bg-white/5 grayscale'}`}>
                                            {skill.icono || '⚡'}
                                        </div>
                                        <h3 className={`text-xl font-bold mb-2 ${isObtained ? 'text-white' : 'text-white/40'}`}>{skill.nombre_es}</h3>
                                        <p className="text-xs text-white/30 leading-relaxed mb-6">{skill.descripcion_es}</p>

                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                                            <span className="text-[10px] uppercase tracking-widest text-white/20 font-black">{skill.categoria}</span>
                                            {isObtained ? (
                                                <span className="text-[10px] uppercase tracking-widest text-accent font-black">Desbloqueado</span>
                                            ) : (
                                                <span className="text-[10px] uppercase tracking-widest text-white/10 font-black italic">Bloqueado</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'diary' && (
                    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                        {/* Add Entry Form */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40">
                                    <Plus size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white italic">Nueva Entrada de Diario</h3>
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest">Tus reflexiones personales de mar</p>
                                </div>
                            </div>

                            <textarea
                                value={newDiaryContent}
                                onChange={(e) => setNewDiaryContent(e.target.value)}
                                placeholder="Hoy la mar estaba brava... Mis sensaciones al timón fueron..."
                                className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-white text-sm focus:outline-none focus:border-accent/40 min-h-[150px] transition-all resize-none mb-6"
                            />

                            {/* Image Previews */}
                            {previewUrls.length > 0 && (
                                <div className="flex flex-wrap gap-4 mb-6">
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden group border border-white/10">
                                            <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-1 right-1 bg-black/50 hover:bg-red-500/80 p-1 rounded-full text-white transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <button className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/40 transition-colors">
                                        <Smile size={18} />
                                    </button>
                                    <button
                                        onClick={handleSelectImage}
                                        className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/40 transition-colors"
                                    >
                                        <CameraIcon size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddDiaryEntry}
                                    disabled={isSavingDiary || (!newDiaryContent.trim() && selectedImages.length === 0)}
                                    className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                                        ${newDiaryContent.trim() || selectedImages.length > 0
                                            ? 'bg-accent text-nautical-black shadow-lg shadow-accent/20 hover:scale-105'
                                            : 'bg-white/5 text-white/20'
                                        }`}
                                >
                                    {isSavingDiary || isUploading ? 'Guardando...' : 'Guardar Entrada'}
                                </button>
                            </div>
                        </div>

                        {/* Recent Entries */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] uppercase tracking-widest text-white/20 font-black ml-4">Entradas Recientes</h4>

                            {loadingDiary ? (
                                <div className="py-12 flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div>
                                </div>
                            ) : diaryEntries.length > 0 ? (
                                diaryEntries.map((entry: any) => (
                                    <div key={entry.id} className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-[2.2rem] p-8 transition-all relative overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={14} className="text-white/20" />
                                                    <span className="text-[10px] uppercase tracking-widest text-white/30">
                                                        {new Date(entry.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteDiaryEntry(entry.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <p className="text-white/70 leading-relaxed italic font-serif">
                                                "{entry.contenido}"
                                            </p>

                                            {/* Gallery */}
                                            {entry.bitacora_multimedia && entry.bitacora_multimedia.length > 0 && (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                                    {entry.bitacora_multimedia.map((media: any) => (
                                                        <div key={media.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group cursor-pointer">
                                                            <img
                                                                src={media.url}
                                                                alt="Logbook Media"
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {entry.tags && entry.tags.length > 0 && (
                                                <div className="flex gap-2 mt-4">
                                                    {entry.tags.map((tag: string) => (
                                                        <span key={tag} className="text-[8px] uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded text-white/20 font-black">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -right-4 -bottom-4 text-white/[0.02] group-hover:text-white/[0.05] transition-colors">
                                            <Book size={120} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center bg-white/[0.01] rounded-[2.5rem] border border-dashed border-white/5">
                                    <Book className="mx-auto text-white/5 mb-4" size={40} />
                                    <p className="text-white/20 italic text-sm font-serif">Tu mar de reflexiones está esperando...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
