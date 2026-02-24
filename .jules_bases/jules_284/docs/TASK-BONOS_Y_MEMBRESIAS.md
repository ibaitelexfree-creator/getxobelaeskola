# Plan de Implementación: Sistema de Bonos y Membresías Premium
**Estado:** Pendiente de Ejecución
**Prioridad:** Alta (Fase 2)

## 1. Resumen del Objetivo
Implementar la lógica de negocio para soportar **Bonos de Horas** (packs prepago de navegación) y **Niveles de Socio** (descuentos recurrentes), tal como se define en el catálogo comercial "Cursos y Actividades.xlsx".

---

## 2. Arquitectura de Datos (Supabase)

### 2.1. Tabla: `tipos_bono` (Catálogo)
Definición de los productos "Bono" vendibles.
*   `id` (uuid, PK)
*   `nombre` (text): "Bono 10 Horas", "Bono Temporada", etc.
*   `horas_totales` (int): Cantidad de horas que otorga.
*   `precio` (numeric): Costo del bono.
*   `validez_dias` (int): Días de vigencia desde la compra (ej: 365).
*   `categorias_validas` (text[]): Array de categorías donde aplica (e.g., `['veleros', 'windsurf']`).
*   `activo` (bool)

### 2.2. Tabla: `bonos_usuario` (Wallet del Cliente)
El saldo activo de cada usuario.
*   `id` (uuid, PK)
*   `usuario_id` (uuid, FK -> profiles)
*   `tipo_bono_id` (uuid, FK -> tipos_bono)
*   `horas_restantes` (numeric): Saldo actual.
*   `fecha_compra` (timestamp)
*   `fecha_expiracion` (timestamp)
*   `estado` (enum): 'activo', 'agotado', 'expirado'.

### 2.3. Tabla: `movimientos_bono` (Auditoría)
Historial de consumo.
*   `id` (uuid)
*   `bono_id` (uuid, FK)
*   `reserva_id` (uuid, FK -> reservas_alquiler, nullable)
*   `tipo_movimiento` (enum): 'compra', 'consumo', 'ajuste_manual', 'devolucion'.
*   `horas` (numeric): Cantidad sumada o restada.
*   `created_at` (timestamp)

### 2.4. Actualización: `profiles` (Socios)
*   `nivel_socio` (enum): 'basico', 'plata', 'oro'.
*   `fecha_renovacion_socio` (timestamp).

---

## 3. Lógica Backend (Next.js / Supabase RPC)

### 3.1. RPC: `comprar_bono(user_id, tipo_bono_id)`
*   Verifica pago (Stripe webhook).
*   Inserta en `bonos_usuario`.
*   Registra movimiento inicial en `movimientos_bono`.

### 3.2. RPC: `consumir_horas(user_id, horas, categoria)`
Lógica crítica para el momento del "Checkout" de alquiler.
1.  Busca bonos activos del usuario que incluyan la `categoria`.
2.  Ordena por fecha de expiración más próxima (FIFO).
3.  Descuenta horas. Si un bono no alcanza, puede saltar al siguiente o requerir pago mixto (bono + dinero).
4.  Retorna éxito o error "Saldo Insuficiente".

---

## 4. Frontend (Interfaces)

### 4.1. Panel de Usuario (Student Dashboard)
*   **Widget "Mi Saldo"**: Visualización gráfica (círculo de progreso) de horas restantes.
*   **Historial de Uso**: Tabla filtrada de `movimientos_bono`.
*   **Botón "Recargar Saldo"**: Acceso directo a comprar más bonos.

### 4.2. Flujo de Reserva (Booking)
*   En el paso de pago, añadir opción: **"Pagar con Bono"**.
*   Mostrar saldo disponible y calcular si cubre la reserva.
*   Si cubre: Costo 0€.
*   Si no cubre: Mostrar alerta y opción de pagar diferencia.

### 4.3. Panel de Staff (Admin)
*   Vista de detalle de usuario: Ver saldo de bonos.
*   Herramienta de **"Ajuste Manual"**: Para compensaciones por mal tiempo (devolver horas al bono).

---

## 5. Plan de Fases

### Fase 2.1: Estructura y Semilla (Día 1)
*   Crear migraciones SQL para las nuevas tablas.
*   Insertar datos semilla de `tipos_bono` (Bono 10h, Bono 20h).

### Fase 2.2: Lógica de Compra (Día 2)
*   Crear productos en Stripe correspondientes a los bonos.
*   Conectar webhook para alta automática.

### Fase 2.3: Consumo en Reservas (Día 2-3)
*   Modificar `BookingForm` para consultar saldo.
*   Implementar lógica de descuento en BD.

### Fase 2.4: Interfaz UI (Día 4)
*   Diseñar tarjetas de bonos en Dashboard.
*   Implementar vistas de historial.
