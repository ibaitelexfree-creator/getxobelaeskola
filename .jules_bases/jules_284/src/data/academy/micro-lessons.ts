export interface MicroLesson {
  id: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  likes: number;
}

export const microLessons: MicroLesson[] = [
  {
    id: '1',
    title: 'El Ojo del Viento',
    description: 'Entiende la zona donde las velas no portan y cómo evitarla.',
    category: 'Maniobra',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
    duration: 120,
    likes: 1240,
  },
  {
    id: '2',
    title: 'Nudo de Bolina',
    description: 'El rey de los nudos: seguro, fuerte y fácil de deshacer.',
    category: 'Cabuyería',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1621669071720-c2084c8d506d?w=800&q=80',
    duration: 60,
    likes: 850,
  },
  {
    id: '3',
    title: 'Barlovento vs Sotavento',
    description: 'Aprende a diferenciar los lados del barco según el viento.',
    category: 'Teoría',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505080857763-eec772cd197d?w=800&q=80',
    duration: 180,
    likes: 2100,
  },
  {
    id: '4',
    title: 'Prioridades de Paso',
    description: 'Reglas básicas para evitar abordajes en el mar.',
    category: 'Seguridad',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1564654929828-56885dfb5643?w=800&q=80',
    duration: 150,
    likes: 1540,
  },
  {
    id: '5',
    title: 'Partes de la Vela',
    description: 'Puño de driza, amura y escota. ¿Cuál es cuál?',
    category: 'Partes',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517409547039-b9d936528752?w=800&q=80',
    duration: 90,
    likes: 980,
  }
];
