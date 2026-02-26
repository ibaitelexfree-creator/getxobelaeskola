
import os

filepath = 'src/components/academy/logbook/Logbook.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# 1. Add Imports
# Find the last import and append.
import_search = "import { useSmartTracker } from '@/hooks/useSmartTracker';"
import_replace = "import { useSmartTracker } from '@/hooks/useSmartTracker';\nimport jsPDF from 'jspdf';\nimport autoTable from 'jspdf-autotable';"

if import_search in content and "import jsPDF" not in content:
    content = content.replace(import_search, import_replace)
    print("Added imports.")

# 2. Add exportToPDF function
# I'll add it before handleAddDiaryEntry
func_search = "const handleAddDiaryEntry = async () => {"
func_insert = """    const exportToPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text('Cuaderno de Bitácora - Getxo Bela Eskola', 14, 22);

        // Subtitle with user name
        doc.setFontSize(12);
        doc.text(`Alumno: ${officialData?.user?.full_name || 'N/A'}`, 14, 32);
        doc.text(`Fecha de exportación: ${new Date().toLocaleDateString()}`, 14, 38);

        // Table Data
        const tableData = diaryEntries.map(entry => [
            new Date(entry.fecha).toLocaleDateString(),
            entry.marina_salida || '-',
            entry.tripulacion || '-',
            entry.condiciones_viento ? `${entry.condiciones_viento.nudos || '-'} kn ${entry.condiciones_viento.direccion || ''}` : '-',
            entry.maniobras ? entry.maniobras.join(', ') : '-',
            entry.observaciones || entry.contenido || '-'
        ]);

        autoTable(doc, {
            head: [['Fecha', 'Marina', 'Tripulación', 'Viento', 'Maniobras', 'Observaciones']],
            body: tableData,
            startY: 45,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [41, 128, 185] }, // Blue color
            columnStyles: {
                0: { cellWidth: 20 }, // Fecha
                1: { cellWidth: 25 }, // Marina
                2: { cellWidth: 30 }, // Tripulacion
                3: { cellWidth: 20 }, // Viento
                4: { cellWidth: 40 }, // Maniobras
                5: { cellWidth: 'auto' } // Observaciones
            }
        });

        doc.save('bitacora_getxo_bela_eskola.pdf');
    };

"""

if func_search in content and "const exportToPDF" not in content:
    content = content.replace(func_search, func_insert + func_search)
    print("Added exportToPDF function.")

# 3. Add Button
# Look for the header in "diary" tab
button_search = """<div className="flex items-center justify-between ml-4">
                                <h4 className="text-[10px] uppercase tracking-widest text-white/20 font-black">Entradas Recientes</h4>
                            </div>"""

button_replace = """<div className="flex items-center justify-between ml-4 mb-4">
                                <h4 className="text-[10px] uppercase tracking-widest text-white/20 font-black">Entradas Recientes</h4>
                                <button
                                    onClick={exportToPDF}
                                    className="text-[10px] uppercase tracking-widest text-accent hover:text-white transition-colors flex items-center gap-2"
                                >
                                    <Download size={14} /> Exportar PDF
                                </button>
                            </div>"""

# Note: I added mb-4 to the container for better spacing if needed, or I can rely on existing spacing.
# The original code had `space-y-6` on the parent div.
# Let's adjust button_search to be precise.
# In previous step I wrote:
# <div className="flex items-center justify-between ml-4">
#     <h4 className="text-[10px] uppercase tracking-widest text-white/20 font-black">Entradas Recientes</h4>
# </div>

if button_search in content:
    content = content.replace(button_search, button_replace)
    print("Added Export Button.")
else:
    print("Button insertion point not found. Trying to find partial match.")
    # Debug
    start_idx = content.find('<h4 className="text-[10px] uppercase tracking-widest text-white/20 font-black">Entradas Recientes</h4>')
    if start_idx != -1:
        print("Found h4 at", start_idx)


with open(filepath, 'w') as f:
    f.write(content)
