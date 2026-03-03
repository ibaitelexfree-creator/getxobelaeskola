import { SailboatPart } from '@/types/sailboat-3d';

export const sailboatMetadata: SailboatPart[] = [
  // JARCIA
  {
    id: 'mastil',
    category: 'Jarcia',
    label: 'Mástil',
    camera: {
      position: { x: 5, y: 10, z: 5 },
      target: { x: 0, y: 5, z: 0 }
    },
    description_html: '<p>El <strong>mástil</strong> es el palo vertical que sostiene las velas. Es fundamental para la propulsión y soporta grandes tensiones.</p>'
  },
  {
    id: 'botavara',
    category: 'Jarcia',
    label: 'Botavara',
    camera: {
      position: { x: 2, y: 3, z: 2 },
      target: { x: 0, y: 2, z: -1 }
    },
    description_html: '<p>La <strong>botavara</strong> es el palo horizontal articulado en la parte inferior del mástil que sostiene la vela mayor y permite orientarla.</p>'
  },
  {
    id: 'obenques',
    category: 'Jarcia',
    label: 'Obenques',
    camera: {
      position: { x: 4, y: 8, z: 4 },
      target: { x: 0, y: 8, z: 0 }
    },
    description_html: '<p>Los <strong>obenques</strong> son los cables laterales que sujetan el mástil y evitan que caiga hacia los lados.</p>'
  },

  // CASCO
  {
    id: 'casco',
    category: 'Casco',
    label: 'Casco',
    camera: {
      position: { x: 15, y: 5, z: 15 },
      target: { x: 0, y: 0, z: 0 }
    },
    description_html: '<p>El <strong>casco</strong> es el cuerpo principal del barco que le proporciona flotabilidad e impermeabilidad.</p>'
  },
  {
    id: 'proa',
    category: 'Casco',
    label: 'Proa',
    camera: {
      position: { x: 8, y: 2, z: 0 },
      target: { x: 4, y: 0, z: 0 }
    },
    description_html: '<p>La <strong>proa</strong> es la parte delantera del barco, diseñada en forma de cuña para cortar el agua con facilidad.</p>'
  },
  {
    id: 'popa',
    category: 'Casco',
    label: 'Popa',
    camera: {
      position: { x: -8, y: 2, z: 0 },
      target: { x: -4, y: 0, z: 0 }
    },
    description_html: '<p>La <strong>popa</strong> es la parte trasera del barco, donde generalmente se ubica el puesto de gobierno.</p>'
  },

  // APÉNDICES
  {
    id: 'quilla',
    category: 'Apéndices',
    label: 'Quilla',
    camera: {
      position: { x: 2, y: -5, z: 2 },
      target: { x: 0, y: -2, z: 0 }
    },
    description_html: '<p>La <strong>quilla</strong> es el apéndice inferior pesado que proporciona estabilidad (contrapeso) y evita la deriva lateral al navegar.</p>'
  },
  {
    id: 'timon',
    category: 'Apéndices',
    label: 'Timón',
    camera: {
      position: { x: -6, y: 0, z: 0 },
      target: { x: -5, y: -1, z: 0 }
    },
    description_html: '<p>El <strong>timón</strong> es el mecanismo sumergido en la popa utilizado para dirigir el rumbo del barco.</p>'
  },

  // VELAMEN
  {
    id: 'mayor',
    category: 'Velamen',
    label: 'Vela Mayor',
    camera: {
      position: { x: 0, y: 8, z: 10 },
      target: { x: 0, y: 6, z: 0 }
    },
    description_html: '<p>La <strong>vela mayor</strong> es la vela principal, de gran tamaño, situada detrás del mástil y sostenida por la botavara.</p>'
  },
  {
    id: 'foque',
    category: 'Velamen',
    label: 'Foque',
    camera: {
      position: { x: 4, y: 4, z: 6 },
      target: { x: 2, y: 3, z: 0 }
    },
    description_html: '<p>El <strong>foque</strong> es la vela triangular situada en la proa, por delante del mástil, que ayuda en la maniobra y propulsión.</p>'
  }
];
