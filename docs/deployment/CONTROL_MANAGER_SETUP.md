# Control Manager: Configuración Totalmente Automática (VPS)

Tu sistema ahora es **100% independiente**. El "Cerebro" (Orquestador) y el "Panel de Control" (Dashboard) viven juntos en tu VPS bajo el dominio `controlmanager.cloud`.

## 1. Acceso Universal
Ya no necesitas abrir terminales en tu PC para que el sistema funcione. Todo está automatizado en Docker:

- **Dashboard:** `https://controlmanager.cloud`
- **Orquestador (API):** `https://controlmanager.cloud/api` (Gestionado automáticamente por el dashboard)
- **Seguridad:** El sistema fuerza HTTPS automáticamente y renueva certificados con Traefik.

## 2. IA Local Opcional (Modo Híbrido)
Si en algún momento quieres que tu PC local ayude al VPS (por ejemplo, para tareas pesadas de Antigravity usando tu GPU), puedes hacerlo:

1. Ejecuta el túnel en tu PC:
   ```powershell
   npx -y cloudflared tunnel --url http://localhost:3323
   ```
2. En el Dashboard (`controlmanager.cloud`), añade la URL resultante en **Settings**.
3. **Por defecto, NO es necesario.** El VPS se gestiona solo.

## 3. Despliegue Automático (CI/CD)
Cada vez que haces un cambio en el código y lo subes a GitHub (rama `main`), ocurre lo siguiente:
1. GitHub construye 3 imágenes de Docker (Web, Dashboard, Orquestador).
2. Se suben a tu registro privado (GHCR).
3. GitHub entra en tu VPS vía SSH y actualiza todo el stack automáticamente.

## 4. Notas Técnicas (Arreglado)
- **404 / Insegura:** Se ha solucionado añadiendo Middlewares de redirección HTTPS y consolidando el stack en una sola red Docker compartida con Traefik.
- **Base URL:** El dashboard ahora detecta automáticamente si estás en `controlmanager.cloud` y se conecta al orquestador del VPS sin configuración previa.
