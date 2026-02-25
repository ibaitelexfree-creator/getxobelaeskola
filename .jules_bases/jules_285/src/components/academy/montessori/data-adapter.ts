import { BOAT_PARTS, BoatPart } from '@/lib/academy/boat-parts-data';
import { KNOTS_DATA, Knot } from '@/lib/academy/knots-data';
import { FLASHCARDS_DATA, FlashcardData } from '@/lib/academy/flashcards-data';
import { MontessoriTopic, Difficulty, TopicCategory } from './types';

function mapDifficulty(diff: string): Difficulty {
    switch (diff) {
        case 'facil': return 0.2;
        case 'medio': return 0.5;
        case 'dificil': return 0.8;
        default: return 0.5;
    }
}

function mapBoatPartCategory(cat: BoatPart['category']): TopicCategory {
    switch (cat) {
        case 'structure': return 'structure';
        case 'rigging': return 'rigging';
        case 'sails': return 'sails';
        case 'deck': return 'deck';
        default: return 'general';
    }
}

function mapKnotCategory(cat: Knot['category']): TopicCategory {
    return 'knots';
}

function mapFlashcardCategory(cat: FlashcardData['category']): TopicCategory {
    switch (cat) {
        case 'luces': return 'lights';
        case 'banderas': return 'flags';
        case 'nudos': return 'knots';
        case 'radio': return 'radio';
        default: return 'general';
    }
}

export const getAllTopics = (): MontessoriTopic[] => {
    const boatPartTopics: MontessoriTopic[] = BOAT_PARTS.map(part => ({
        id: `boat-part-${part.id}`,
        type: 'boat-part',
        title: part.name,
        description: part.definition,
        difficulty: 0.3, // Default difficulty for nomenclature
        category: mapBoatPartCategory(part.category),
        originalData: part
    }));

    const knotTopics: MontessoriTopic[] = KNOTS_DATA.map(knot => ({
        id: `knot-${knot.id}`,
        type: 'knot',
        title: knot.name,
        description: knot.description,
        difficulty: mapDifficulty(knot.difficulty),
        category: mapKnotCategory(knot.category),
        imageUrl: knot.steps[0]?.image_url, // Use first step image if available
        originalData: knot
    }));

    const flashcardTopics: MontessoriTopic[] = FLASHCARDS_DATA.map(card => ({
        id: `flashcard-${card.id}`,
        type: 'flashcard',
        title: card.back.title,
        description: card.back.description,
        difficulty: mapDifficulty(card.difficulty),
        category: mapFlashcardCategory(card.category),
        imageUrl: card.front.type === 'image' ? card.front.content : undefined,
        originalData: card
    }));

    return [...boatPartTopics, ...knotTopics, ...flashcardTopics];
};
