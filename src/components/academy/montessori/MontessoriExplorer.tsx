import React, { useState, useMemo } from 'react';
import { MontessoriTopic, InteractionResult, TopicCategory } from './types';
import { TopicCard } from './TopicCard';
import { RecommendationBanner } from './RecommendationBanner';
import TopicStudyModal from './TopicStudyModal';
import { Search, Filter } from 'lucide-react';

interface MontessoriExplorerProps {
    topics: MontessoriTopic[];
    history: { topicId: string; result: InteractionResult; timestamp: number }[];
    ability: number;
    recommendedTopic: MontessoriTopic | null;
    onRecordInteraction: (topicId: string, result: InteractionResult) => void;
}

const CATEGORIES: { id: TopicCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Todo' },
    { id: 'structure', label: 'Estructura' },
    { id: 'rigging', label: 'Aparejo' },
    { id: 'sails', label: 'Velas' },
    { id: 'deck', label: 'Maniobra' },
    { id: 'knots', label: 'Nudos' },
    { id: 'lights', label: 'Luces' },
    { id: 'flags', label: 'Banderas' },
    { id: 'radio', label: 'Radio' }
];

export const MontessoriExplorer: React.FC<MontessoriExplorerProps> = ({
    topics,
    history,
    ability,
    recommendedTopic,
    onRecordInteraction
}) => {
    const [selectedCategory, setSelectedCategory] = useState<TopicCategory | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<MontessoriTopic | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter topics
    const filteredTopics = useMemo(() => {
        return topics.filter(topic => {
            const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
            const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  topic.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [topics, selectedCategory, searchQuery]);

    const handleTopicClick = (topic: MontessoriTopic) => {
        setSelectedTopic(topic);
        setIsModalOpen(true);
    };

    const handleRecordResult = (result: InteractionResult) => {
        if (selectedTopic) {
            onRecordInteraction(selectedTopic.id, result);
        }
    };

    const getTopicStatus = (topicId: string) => {
        // Check if mastered (last result was success)
        // Or if viewed (exists in history)
        // For simplicity, just check if last interaction was success
        const interactions = history.filter(h => h.topicId === topicId).sort((a, b) => b.timestamp - a.timestamp);
        if (interactions.length > 0) {
            return interactions[0].result === 'success' ? 'mastered' : 'available';
        }
        return 'available'; // Default to available
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Recommendation Banner */}
            {recommendedTopic && (
                <RecommendationBanner
                    topic={recommendedTopic}
                    onStart={() => handleTopicClick(recommendedTopic)}
                />
            )}

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-24 z-20 bg-nautical-deep/90 backdrop-blur py-4 border-b border-white/5">
                <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                selectedCategory === cat.id
                                    ? 'bg-accent text-nautical-black'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Buscar concepto..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors placeholder:text-white/20"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                </div>
            </div>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
                {filteredTopics.map(topic => (
                    <TopicCard
                        key={topic.id}
                        topic={topic}
                        status={getTopicStatus(topic.id)}
                        onClick={() => handleTopicClick(topic)}
                    />
                ))}

                {filteredTopics.length === 0 && (
                    <div className="col-span-full py-20 text-center text-white/40">
                        <p className="text-sm uppercase tracking-widest">No se encontraron temas</p>
                    </div>
                )}
            </div>

            {/* Study Modal */}
            <TopicStudyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                topic={selectedTopic}
                onRecordResult={handleRecordResult}
            />
        </div>
    );
};
