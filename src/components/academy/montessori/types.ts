export type InteractionResult = 'success' | 'failure';

export type Difficulty = number; // 0.0 to 1.0

export type TopicCategory = 'structure' | 'rigging' | 'sails' | 'deck' | 'knots' | 'lights' | 'flags' | 'radio' | 'general';

export interface MontessoriTopic {
    id: string;
    type: 'boat-part' | 'knot' | 'flashcard';
    title: string;
    description: string;
    difficulty: Difficulty;
    category: TopicCategory;
    imageUrl?: string;
    originalData: any;
}
