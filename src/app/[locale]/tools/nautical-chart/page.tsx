import { Metadata } from 'next';
import NauticalChartTool from '@/components/tools/nautical-chart/NauticalChartTool';

export const metadata: Metadata = {
  title: 'Carta Náutica Interactiva | Getxo Bela Eskola',
  description: 'Planificador de rutas y carta náutica con OpenSeaMap.',
};

export default function NauticalChartPage() {
  return <NauticalChartTool />;
}
