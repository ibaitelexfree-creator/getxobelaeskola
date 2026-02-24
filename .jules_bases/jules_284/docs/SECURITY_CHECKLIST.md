# Security & Environment Checklist

Este documento detalla las configuraciones críticas de seguridad y las variables de entorno necesarias para el despliegue en producción de **Getxo Sailing School**.

## 1. Variables de Entorno (Vercel)

| Variable | Descripción | Importancia |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de la instancia de Supabase | Crítica |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Key pública de Supabase | Alta |
| `SUPABASE_SERVICE_ROLE_KEY` | Key de administración (SOLO SERVIDOR) | Crítica |
| `STRIPE_SECRET_KEY` | Clave privada de Stripe para pagos | Crítica |
| `STRIPE_WEBHOOK_SECRET` | Secreto para validar firmas de webhooks | Crítica |
| `RESEND_API_KEY` | Clave para el envío de emails transaccionales | Alta |
| `NEXT_PUBLIC_APP_URL` | URL base de la aplicación (ej: `https://...`) | Alta |

## 2. Recomendaciones de Seguridad

### 2.1 Gestión de Claves
- **Rotación:** Se recomienda rotar las claves secretas (Stripe, Resend, Supabase Service Role) cada 6-12 meses.
- **Exposición:** NUNCA prefijes variables con `NEXT_PUBLIC_` si contienen información sensible. Solo la URL y Anon Key de Supabase deben ser públicas.

### 2.2 Base de Datos (Supabase)
- **RLS (Row Level Security):** Todas las tablas deben tener RLS activado.
- **Service Role:** El uso de `supabaseServiceRole` solo está permitido en API routes (`/api/*`) y nunca en el cliente.
- **Políticas:** Revisa las políticas de `profiles` para asegurar que un usuario solo pueda leer sus propios datos privados.

### 2.3 Webhooks
- **Validación:** El endpoint `/api/webhook` DEBE validar la firma de Stripe usando `STRIPE_WEBHOOK_SECRET` para evitar ataques de replay o inyección de pagos falsos.

### 2.4 Emails (Resend)
- **Dominio:** En producción, configura y verifica el dominio en el panel de Resend para evitar que los correos terminen en SPAM.
- **From Address:** Asegúrate de que `DEFAULT_FROM_EMAIL` coincida con el dominio verificado.

## 3. Checklist de Lanzamiento
- [ ] RLS activado en todas las tablas de Supabase.
- [ ] `NEXT_PUBLIC_APP_URL` configurado correctamente.
- [ ] Stripe en modo 'Live'.
- [ ] Dominio de Resend verificado (DKIM/SPF).
- [ ] Error Boundaries validados visualmente.
- [ ] Logs de desarrollo eliminados (`console.log` sensibles).
