
'use client';

import React, { useState, useEffect } from 'react';


interface Course {
    id: string;
    slug: string;
    nombre_es: string;
    nombre_eu: string;
    descripcion_es: string;
    descripcion_eu: string;
    precio: number;
    duracion_h: number;
    nivel: string;
    imagen_url: string;
    activo: boolean;
    visible?: boolean;
}

export default function CoursesTab() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Course>>({
        nombre_es: '',
        nombre_eu: '',
        descripcion_es: '',
        descripcion_eu: '',
        precio: 0,
        duracion_h: 0,
        nivel: 'iniciacion',
        imagen_url: '',
        slug: '',
        activo: true,
        visible: true
    });

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/courses/list');
            const data = await res.json();
            if (res.ok) {
                setCourses(data.courses || []);
            } else {
                console.error('Error fetching courses:', data.error);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleCreate = () => {
        setEditingCourse(null);
        setFormData({
            nombre_es: '',
            nombre_eu: '',
            descripcion_es: '',
            descripcion_eu: '',
            precio: 0,
            duracion_h: 0,
            nivel: 'iniciacion',
            imagen_url: '',
            slug: '',
            activo: true,
            visible: true
        });
        setIsModalOpen(true);
    };

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            ...course,
            visible: course.visible ?? true
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const endpoint = editingCourse
                ? '/api/admin/courses/update'
                : '/api/admin/courses/create';

            const payload = editingCourse
                ? { ...formData, id: editingCourse.id }
                : formData;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                setIsModalOpen(false);
                fetchCourses(); // Refresh list
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error saving course:', error);
            alert('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = async (id: string, currentStatus: boolean) => {
        if (!confirm(`¿Estás seguro de que quieres ${currentStatus ? 'archivar' : 'activar'} este curso?`)) return;

        try {
            const res = await fetch('/api/admin/courses/archive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, activo: !currentStatus })
            });

            if (res.ok) {
                fetchCourses();
            } else {
                alert('Error al cambiar estado');
            }
        } catch (error) {
            console.error('Error archiving:', error);
        }
    };

    if (loading) {
        return <div className="p-8 text-white/50 animate-pulse">Cargando cursos...</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-display text-white italic">Catálogo de Cursos</h2>
                    <p className="text-white/40 text-sm">Gestiona la oferta formativa de la escuela</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-accent text-nautical-black px-6 py-3 text-2xs uppercase tracking-widest font-black hover:bg-white transition-all shadow-lg shadow-accent/20"
                >
                    + Nuevo Curso
                </button>
            </header>

            <div className="grid gap-4">
                {courses.map(course => (
                    <div key={course.id} className={`p-6 border rounded-sm flex justify-between items-center transition-all ${course.activo ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-red-900/10 border-red-500/20 opacity-60'}`}>
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 flex items-center justify-center text-xl rounded-sm ${course.activo ? 'bg-accent/10 text-accent' : 'bg-white/5 text-white/20'}`}>
                                ⛵
                            </div>
                            <div>
                                <h3 className="text-xl font-display text-white">{course.nombre_es}</h3>
                                <div className="flex gap-4 text-2xs text-white/40 mt-1">
                                    <span className="font-mono">{course.precio}€</span>
                                    <span>•</span>
                                    <span>{course.duracion_h}h</span>
                                    <span>•</span>
                                    <span className="uppercase tracking-wider text-accent">{course.nivel}</span>
                                    <span>•</span>
                                    <span className={course.visible ? 'text-green-500/60' : 'text-orange-500/60'}>
                                        {course.visible ? 'VISIBLE' : 'OCULTO'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleEdit(course)}
                                className="px-4 py-2 border border-white/10 text-2xs uppercase tracking-widest text-white/60 hover:text-white hover:border-white/30 transition-all"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => handleArchive(course.id, course.activo)}
                                className={`px-4 py-2 border text-2xs uppercase tracking-widest transition-all ${course.activo ? 'border-red-500/20 text-red-500/60 hover:text-red-500 hover:border-red-500/50' : 'border-green-500/20 text-green-500/60 hover:text-green-500'}`}
                            >
                                {course.activo ? 'Archivar' : 'Activar'}
                            </button>
                        </div>
                    </div>
                ))}

                {courses.length === 0 && (
                    <div className="p-12 text-center border border-dashed border-white/10 rounded-sm text-white/20">
                        No hay cursos registrados.
                    </div>
                )}
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-nautical-black/90 backdrop-blur-md">
                    <div className="w-full max-w-2xl bg-nautical-black border border-white/10 p-8 shadow-2xl overflow-y-auto max-h-[90vh] animate-premium-in">
                        <h3 className="text-2xl font-display text-white italic mb-6">
                            {editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Nombre (ES)</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-accent"
                                        value={formData.nombre_es}
                                        onChange={e => setFormData({ ...formData, nombre_es: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Nombre (EU)</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-accent"
                                        value={formData.nombre_eu}
                                        onChange={e => setFormData({ ...formData, nombre_eu: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Precio (€)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-accent"
                                        value={formData.precio}
                                        onChange={e => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Duración (h)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-accent"
                                        value={formData.duracion_h}
                                        onChange={e => setFormData({ ...formData, duracion_h: parseFloat(e.target.value) })}
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Nivel</label>
                                    <select
                                        className="w-full bg-nautical-black border border-white/10 p-3 text-white outline-none focus:border-accent"
                                        value={formData.nivel}
                                        onChange={e => setFormData({ ...formData, nivel: e.target.value })}
                                    >
                                        <option value="iniciacion" className="bg-nautical-black">Iniciación</option>
                                        <option value="intermedio" className="bg-nautical-black">Intermedio</option>
                                        <option value="avanzado" className="bg-nautical-black">Avanzado</option>
                                        <option value="profesional" className="bg-nautical-black">Profesional</option>
                                    </select>
                                </div>
                            </div>

                            {!editingCourse && (
                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Slug (URL)</label>
                                    <input
                                        placeholder="autogenerado-si-vacio"
                                        className="w-full bg-white/5 border border-white/10 p-3 text-white/60 outline-none focus:border-accent font-mono text-sm"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Imagen URL</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-accent font-mono text-sm"
                                    value={formData.imagen_url}
                                    onChange={e => setFormData({ ...formData, imagen_url: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Descripción (ES)</label>
                                    <textarea
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-accent resize-none text-sm"
                                        value={formData.descripcion_es}
                                        onChange={e => setFormData({ ...formData, descripcion_es: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-3xs uppercase tracking-widest text-white/40 font-bold">Descripción (EU)</label>
                                    <textarea
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-accent resize-none text-sm"
                                        value={formData.descripcion_eu}
                                        onChange={e => setFormData({ ...formData, descripcion_eu: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-sm">
                                <input
                                    type="checkbox"
                                    id="visible"
                                    className="w-5 h-5 accent-accent"
                                    checked={formData.visible}
                                    onChange={e => setFormData({ ...formData, visible: e.target.checked })}
                                />
                                <label htmlFor="visible" className="text-xs text-white/80 cursor-pointer select-none">
                                    Este curso está visible en el catálogo público para compra
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-4 border border-white/10 text-2xs uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-4 bg-accent text-nautical-black text-2xs uppercase tracking-widest font-black hover:bg-white transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Guardando...' : 'Guardar Curso'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
