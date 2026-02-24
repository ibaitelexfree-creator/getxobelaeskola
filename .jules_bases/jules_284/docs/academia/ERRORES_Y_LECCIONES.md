# ⚠️ ERRORES Y LECCIONES — Getxo Bela Eskola
## Registro de problemas encontrados y cómo se resolvieron

---

## Formato

> **ERR-XX:** Título del error
> - **Fecha:** cuándo ocurrió
> - **Síntoma:** qué se observó
> - **Causa raíz:** por qué pasó
> - **Solución:** cómo se arregló
> - **Lección:** qué aprendimos para no repetirlo

---

## ERR-01: Generación de contenido excede límite de tokens

- **Fecha:** 2026-02-10
- **Síntoma:** Al generar las 200 preguntas del banco de preguntas, el contenido se cortaba a mitad.
- **Causa raíz:** El volumen de texto superaba el límite de tokens del modelo en una sola respuesta.
- **Solución:** Dividir la generación en 4 archivos separados (parte1, parte2, parte3, parte4).
- **Lección:** Cuando el contenido es extenso, dividir en lotes de ~50 preguntas por archivo. Nunca intentar generar más de 60 preguntas en una sola operación.

---

## ERR-02: (Plantilla vacía — añadir cuando ocurra el siguiente error)

- **Fecha:** —
- **Síntoma:** —
- **Causa raíz:** —
- **Solución:** —
- **Lección:** —

---

## Cómo añadir un nuevo error

1. Copia la plantilla ERR-XX
2. Describe el síntoma tal como lo observaste (sin interpretar)
3. Investiga la causa raíz
4. Documenta la solución exacta
5. Extrae una lección que prevenga el problema en el futuro

**Regla:** Todo error que cueste más de 10 minutos resolver DEBE documentarse aquí.
