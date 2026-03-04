import Link from 'next/link';

export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Página no encontrada / Page Not Found</h2>
          <p>La página que buscas no existe.</p>
          <Link href="/es">Volver al inicio</Link>
        </div>
      </body>
    </html>
  );
}
