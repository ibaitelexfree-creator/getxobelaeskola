
import os

filepath = 'src/components/academy/logbook/Logbook.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# Define the block to replace.
# The original block is quite long, I'll try to match a significant part of it.
# It starts with {activeTab === 'diary' && ( and ends with )}

search_start = "{activeTab === 'diary' && ("
search_end = "                                <p className=\"text-white/20 italic text-sm font-serif\">Tu mar de reflexiones está esperando...</p>\n                                </div>\n                            )}\n                        </div>\n                    </div>\n                )}"

# I'll construct the replacement block
replacement_block = """{activeTab === 'diary' && (
                    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                        {/* Add Entry Form */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40">
                                    <Plus size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white italic">Nueva Entrada de Diario</h3>
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest">Registra tu experiencia náutica</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Fecha</label>
                                    <input
                                        type="date"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-accent/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Marina de Salida</label>
                                    <input
                                        type="text"
                                        value={marinaSalida}
                                        onChange={(e) => setMarinaSalida(e.target.value)}
                                        placeholder="Ej. Real Club Marítimo"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-accent/40"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Tripulación</label>
                                <input
                                    type="text"
                                    value={tripulacion}
                                    onChange={(e) => setTripulacion(e.target.value)}
                                    placeholder="Nombres de los tripulantes..."
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-accent/40"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Viento (Nudos)</label>
                                    <input
                                        type="number"
                                        value={vientoNudos}
                                        onChange={(e) => setVientoNudos(e.target.value)}
                                        placeholder="Ej. 12"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-accent/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Dirección Viento</label>
                                    <input
                                        type="text"
                                        value={vientoDireccion}
                                        onChange={(e) => setVientoDireccion(e.target.value)}
                                        placeholder="Ej. NW"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-accent/40"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Maniobras Practicadas</label>
                                <textarea
                                    value={maniobras}
                                    onChange={(e) => setManiobras(e.target.value)}
                                    placeholder="Viradas, trasluchadas, rizos..."
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-accent/40 min-h-[100px] resize-none"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Observaciones</label>
                                <textarea
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    placeholder="Reflexiones sobre la navegación, estado del mar..."
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-accent/40 min-h-[150px] resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end">
                                <button
                                    onClick={handleAddDiaryEntry}
                                    disabled={isSavingDiary || (!observaciones.trim() && !marinaSalida.trim())}
                                    className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                                        ${(observaciones.trim() || marinaSalida.trim())
                                            ? 'bg-accent text-nautical-black shadow-lg shadow-accent/20 hover:scale-105'
                                            : 'bg-white/5 text-white/20'
                                        }`}
                                >
                                    {isSavingDiary ? 'Guardando...' : 'Guardar Entrada'}
                                </button>
                            </div>
                        </div>

                        {/* Recent Entries */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between ml-4">
                                <h4 className="text-[10px] uppercase tracking-widest text-white/20 font-black">Entradas Recientes</h4>
                            </div>

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

                                            {/* Logbook Details Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 border-b border-white/5 pb-6">
                                                {entry.marina_salida && (
                                                    <div>
                                                        <span className="text-[8px] uppercase tracking-widest text-white/20 block mb-1">Salida</span>
                                                        <span className="text-xs text-white/70">{entry.marina_salida}</span>
                                                    </div>
                                                )}
                                                {entry.tripulacion && (
                                                    <div>
                                                        <span className="text-[8px] uppercase tracking-widest text-white/20 block mb-1">Tripulación</span>
                                                        <span className="text-xs text-white/70 truncate">{entry.tripulacion}</span>
                                                    </div>
                                                )}
                                                {entry.condiciones_viento?.nudos && (
                                                    <div>
                                                        <span className="text-[8px] uppercase tracking-widest text-white/20 block mb-1">Viento</span>
                                                        <span className="text-xs text-white/70">{entry.condiciones_viento.nudos} kn {entry.condiciones_viento.direccion}</span>
                                                    </div>
                                                )}
                                                {entry.maniobras && entry.maniobras.length > 0 && (
                                                    <div>
                                                        <span className="text-[8px] uppercase tracking-widest text-white/20 block mb-1">Maniobras</span>
                                                        <span className="text-xs text-white/70">{entry.maniobras.length} registradas</span>
                                                    </div>
                                                )}
                                            </div>

                                            {entry.observaciones && (
                                                <div className="mb-4">
                                                    <span className="text-[8px] uppercase tracking-widest text-white/20 block mb-2">Observaciones</span>
                                                    <p className="text-white/70 leading-relaxed italic font-serif text-sm">
                                                        "{entry.observaciones}"
                                                    </p>
                                                </div>
                                            )}

                                            {!entry.observaciones && entry.contenido && (
                                                 <p className="text-white/70 leading-relaxed italic font-serif text-sm">
                                                    "{entry.contenido}"
                                                </p>
                                            )}

                                            {entry.maniobras && entry.maniobras.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    {entry.maniobras.map((m: string, idx: number) => (
                                                        <span key={idx} className="text-[8px] uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded text-white/20 font-black">
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Legacy tags support if any */}
                                            {(!entry.maniobras || entry.maniobras.length === 0) && entry.tags && entry.tags.length > 0 && (
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
                )}"""

start_idx = content.find(search_start)
end_idx = content.find(search_end)

if start_idx != -1 and end_idx != -1:
    # Need to include the end string in the replacement range
    end_idx += len(search_end)
    new_content = content[:start_idx] + replacement_block + content[end_idx:]
    with open(filepath, 'w') as f:
        f.write(new_content)
    print("Successfully replaced UI block.")
else:
    print("Could not find the UI block.")
    print("Start found:", start_idx)
    print("End found:", end_idx)
