export interface TideSection {
  id: string;
  title: string;
  content: string; // Rich text / HTML-like
  image?: string;
  interactive?: 'rule_12_calculator' | 'tide_table_example';
}

export interface TideLesson {
  id: string;
  title: string;
  description: string;
  sections: TideSection[];
}

export const TIDES_LESSON_DATA: TideLesson = {
  id: 'mareas-abra',
  title: 'Teoría de Mareas: El Abra',
  description: 'Comprende los fenómenos de las mareas en la Bahía del Abra, incluyendo definiciones clave, fuerzas generadoras y la Regla de los Duodécimos para el cálculo de alturas.',
  sections: [
    {
      id: 'intro',
      title: 'Introducción a las Mareas',
      content: `Las mareas son el movimiento periódico de ascenso y descenso del nivel del mar, producido principalmente por la atracción gravitatoria que ejercen la Luna y el Sol sobre la Tierra.

**Conceptos Clave:**
- **Pleamar (High Water):** El nivel más alto alcanzado por la marea.
- **Bajamar (Low Water):** El nivel más bajo alcanzado por la marea.
- **Amplitud de Marea:** La diferencia de altura entre una pleamar y una bajamar consecutivas.
- **Cero Hidrográfico:** El nivel de referencia para las sondas en las cartas náuticas (generalmente la bajamar escorada).`,
      image: '/images/academy/tides-intro.svg'
    },
    {
      id: 'forces',
      title: 'Fuerzas Generadoras',
      content: `La marea es el resultado de dos fuerzas principales:
1. **Fuerza de Atracción Gravitatoria:** La Luna (y en menor medida el Sol) "tira" del agua hacia sí.
2. **Fuerza Centrífuga:** Generada por la rotación del sistema Tierra-Luna.

Cuando la Luna y el Sol están alineados (Luna Nueva o Llena), sus fuerzas se suman, produciendo **Mareas Vivas** (Spring Tides) con mayor amplitud.
Cuando forman un ángulo recto (Cuarto Creciente o Menguante), sus fuerzas se contrarrestan, produciendo **Mareas Muertas** (Neap Tides) con menor amplitud.`
    },
    {
      id: 'local-context',
      title: 'El Abra (Bilbao): Características Locales',
      content: `En la zona del Abra y el Puerto de Bilbao, las mareas son de tipo **Semidiurno**. Esto significa que se producen dos pleamares y dos bajamares cada día lunar (aprox. 24h 50m).

**Datos Típicos:**
- **Mareas Vivas:** Amplitud máxima en torno a 4.5 - 5.0 metros.
- **Mareas Muertas:** Amplitud mínima en torno a 1.0 - 1.5 metros.
- **Establecimiento de Puerto:** El retardo de la pleamar respecto al paso de la Luna por el meridiano local es constante para cada puerto.

Es crucial consultar el **Anuario de Mareas** local para obtener las horas y alturas exactas.`
    },
    {
      id: 'rule-of-twelfths',
      title: 'La Regla de los Duodécimos',
      content: `Para estimar la altura de la marea en un instante intermedio entre la Pleamar y la Bajamar, se utiliza la **Regla de los Duodécimos**. Asume que la marea sigue una curva sinusoidal.

La amplitud total se divide en 12 partes. El cambio de nivel por hora es:
- **1ª Hora:** 1/12 de la amplitud.
- **2ª Hora:** 2/12 de la amplitud.
- **3ª Hora:** 3/12 de la amplitud.
- **4ª Hora:** 3/12 de la amplitud.
- **5ª Hora:** 2/12 de la amplitud.
- **6ª Hora:** 1/12 de la amplitud.

Total: 12/12 (la amplitud completa).`
    },
    {
      id: 'calculator',
      title: 'Calculadora: Regla de los Duodécimos',
      content: 'Utiliza esta herramienta interactiva para estimar la altura de la marea en una hora específica basándote en los datos de la Pleamar y Bajamar del día.',
      interactive: 'rule_12_calculator'
    }
  ]
};
