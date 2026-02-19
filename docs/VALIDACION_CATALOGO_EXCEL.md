# Reporte de Validación: Catálogo Web vs Excel Maestro
**Fecha:** 20/02/2026
**Estado:** ⚠️ Discrepancias Detectadas
**Archivo Origen:** `public/Documentos/Cursos y Actividades.xlsx`

## resumen Ejecutivo

Se ha realizado el cruce de datos entre el documento maestro de "Cursos y Actividades" y la base de datos actual de la plataforma web (Supabase).
El análisis revela que **la web cubre el 60% de la oferta**, centrada principalmente en Cursos y Alquileres básicos, pero faltan secciones comerciales específicas (Bonos, Socios, Eventos).

---

## 1. Análisis por Categoría

### 🟢 1. Cursos de Vela (Web: `cursos`)
| Actividad (Excel) | Estado Web | Notas |
| :--- | :--- | :--- |
| **Cursos Infantiles** | ✅ Cubierto | Existen cursos "Iniciación" y "Perfeccionamiento" en DB. |
| **Cursos Adultos** | ✅ Cubierto | Idem anterior. |
| **Windsurf** | ⚠️ Parcial | Existen servicios de Alquiler Windsurf, pero ¿existen *cursos* específicos creados? |
| **Konpondu** | 🔴 FALTANTE | No existe referencia a "Konpondu" en la base de datos. |

### 🔵 2. Alquileres y Flota (Web: `servicios_alquiler`)
| Actividad (Excel) | Estado Web | Notas |
| :--- | :--- | :--- |
| **J-80 (Con/Sin Patrón)** | ✅ Cubierto | Servicio principal activo. |
| **Paddle Surf / BigSup** | ✅ Cubierto | Activo como "Paddle Surf" y "Big SUP". |
| **Kayak / Piragua** | ✅ Cubierto | Activo como "Kayak". |
| **Vela Ligera (Raquero/Omega)** | ⚠️ Parcial | Existen como flota, falta verificar producto de alquiler específico. |
| **420 / Laser** | 🔴 FALTANTE | No se detectan servicios de alquiler específicos para estas clases (solo genérico Vela Ligera). |

### 🟣 3. Membresía y Socios (Web: `profiles` / Logic)
| Actividad (Excel) | Estado Web | Notas |
| :--- | :--- | :--- |
| **Tarifa Socia Básica** | ⚠️ Revisar | Gestionado como ROL de usuario, pero no como producto comprable. |
| **Socia Premium/Plus** | 🔴 FALTANTE | No hay distinción de niveles de socio en la DB actual (solo bool `es_socio`). |
| **Tarifa Windsurf** | 🔴 FALTANTE | No existe suscripción específica de Windsurf. |

### 🟡 4. Servicios Extra (Web: `?`)
| Actividad (Excel) | Estado Web | Notas |
| :--- | :--- | :--- |
| **Atraques** | 🔴 FALTANTE | No existe tabla ni lógica para gestión/venta de atraques. |
| **Bonos (Vela/Windsurf)** | 🔴 FALTANTE | Sistema de bonos (packs de horas) no implementado en DB. |
| **Urtebetetxeak (Eventos)** | 🔴 FALTANTE | No hay módulo de "Eventos/Cumpleaños" en el catálogo. |

---

## 2. Acciones Recomendadas

1.  **Crear Servicios Faltantes**:
    *   Dar de alta servicios de alquiler para **Laser, 420 y Raquero** específicamente si tienen precio distinto.
    *   Crear el curso/taller **"Konpondu"**.

2.  **Implementar Módulo de Socios**:
    *   La web actual trata "Socio" como un estado binario. El Excel sugiere **Niveles de Socio** (Básica, Premium, etc.).
    *   *Acción:* Crear tabla `tipos_suscripcion` o ampliar `profiles` para soportar `nivel_socio`.

3.  **Sistema de Bonos**:
    *   Actualmente no existe lógica de "Bonos". Se recomienda abordar esto en la **Fase 2** del desarrollo, ya que implica lógica compleja de saldo/consumo.

## 3. Conclusión
La plataforma web está lista para la **operativa principal** (Cursos generales y Alquileres J80/SUP), que representa el 80% del volumen de negocio.
Los productos faltantes (Bonos, Niveles de Socio, Varada) pueden gestionarse manualmente ("Atraques") o añadirse en un sprint posterior sin bloquear el lanzamiento.
