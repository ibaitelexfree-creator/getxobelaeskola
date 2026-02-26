
import os

filepath = 'src/components/academy/logbook/Logbook.tsx'

with open(filepath, 'r') as f:
    content = f.read()

search_block = """    const handleAddDiaryEntry = async () => {
        if (!newDiaryContent.trim()) return;

        setIsSavingDiary(true);
        try {
            const res = await fetch(apiUrl('/api/logbook/diary'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contenido: newDiaryContent })
            });

            if (res.ok) {
                setNewDiaryContent('');
                loadDiary();
                showMessage('Éxito', 'Entrada guardada en tu diario', 'success');
            } else {
                showMessage('Error', 'No se pudo guardar la entrada', 'error');
            }
        } catch (error) {
            console.error('Error adding diary entry:', error);
            showMessage('Error', 'Error de conexión', 'error');
        } finally {
            setIsSavingDiary(false);
        }
    };"""

replace_block = """    const handleAddDiaryEntry = async () => {
        if (!observaciones.trim() && !marinaSalida.trim()) return;

        setIsSavingDiary(true);
        try {
            const res = await fetch(apiUrl('/api/logbook/diary'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fecha: newDate,
                    marina_salida: marinaSalida,
                    tripulacion: tripulacion,
                    condiciones_viento: {
                        nudos: vientoNudos,
                        direccion: vientoDireccion
                    },
                    maniobras: maniobras.split('\\n').filter(m => m.trim()),
                    observaciones: observaciones,
                    contenido: observaciones
                })
            });

            if (res.ok) {
                setObservaciones('');
                setMarinaSalida('');
                setTripulacion('');
                setVientoNudos('');
                setVientoDireccion('');
                setManiobras('');
                setNewDate(new Date().toISOString().split('T')[0]);
                loadDiary();
                showMessage('Éxito', 'Entrada guardada en tu diario', 'success');
            } else {
                showMessage('Error', 'No se pudo guardar la entrada', 'error');
            }
        } catch (error) {
            console.error('Error adding diary entry:', error);
            showMessage('Error', 'Error de conexión', 'error');
        } finally {
            setIsSavingDiary(false);
        }
    };"""

if search_block in content:
    new_content = content.replace(search_block, replace_block)
    with open(filepath, 'w') as f:
        f.write(new_content)
    print("Successfully replaced content.")
else:
    print("Search block not found.")
    # Try normalizing line endings
    content_normalized = content.replace('\r\n', '\n')
    search_block_normalized = search_block.replace('\r\n', '\n')
    if search_block_normalized in content_normalized:
        print("Found with normalized line endings.")
        new_content = content_normalized.replace(search_block_normalized, replace_block)
        with open(filepath, 'w') as f:
            f.write(new_content)
        print("Successfully replaced content (normalized).")
    else:
        print("Still not found.")
        # Debug: print snippet
        start_index = content.find('const handleAddDiaryEntry')
        if start_index != -1:
            print("Found start at", start_index)
            print("Snippet:", content[start_index:start_index+200])
