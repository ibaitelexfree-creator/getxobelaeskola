export type TermCategory = 'maniobras' | 'partes del barco' | 'meteorología' | 'reglamento' | 'otros';

export interface NauticalTerm {
    id: string;
    term: string;
    definition: string;
    category: TermCategory | string;
    relatedCourseSlug?: string;
}
