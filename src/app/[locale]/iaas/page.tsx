import IAaaSLanding from '@/components/iaas/IAaaSLanding';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IAaaS - Infraestructura de Inteligencia Artificial',
  description: 'Infraestructura escalable, segura y global para el despliegue de modelos de IA y agentes autónomos.',
  alternates: {
    canonical: '/iaas',
  },
};

export default function IAaaSPage() {
  return <IAaaSLanding />;
}
