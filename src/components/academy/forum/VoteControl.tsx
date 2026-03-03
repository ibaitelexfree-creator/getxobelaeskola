'use client';

import React, { useState } from 'react';
import { apiUrl } from '@/lib/api';

interface VoteControlProps {
    itemId: string;
    itemType: 'pregunta' | 'respuesta';
    initialVotes: number;
    initialUserVote?: 'up' | 'down' | null;
}

export default function VoteControl({ itemId, itemType, initialVotes, initialUserVote }: VoteControlProps) {
    const [votes, setVotes] = useState(initialVotes);
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(initialUserVote || null);
    const [loading, setLoading] = useState(false);

    const handleVote = async (type: 'up' | 'down') => {
        if (loading) return;
        setLoading(true);

        const originalVotes = votes;
        const originalUserVote = userVote;

        // Optimistic update
        let newVotes = votes;
        let newUserVote = userVote;

        if (userVote === type) {
            // Remove vote
            newVotes -= (type === 'up' ? 1 : -1);
            newUserVote = null;
        } else {
            // Change or add vote
            if (userVote) {
                // Change from one to another
                newVotes += (type === 'up' ? 2 : -2);
            } else {
                // Add new
                newVotes += (type === 'up' ? 1 : -1);
            }
            newUserVote = type;
        }

        setVotes(newVotes);
        setUserVote(newUserVote);

        try {
            const endpoint = itemType === 'pregunta'
                ? `/api/forum/questions/${itemId}/vote`
                : `/api/forum/answers/${itemId}/vote`;

            const res = await fetch(apiUrl(endpoint), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            });

            if (!res.ok) {
                throw new Error('Failed to vote');
            }
        } catch (error) {
            console.error(error);
            // Revert
            setVotes(originalVotes);
            setUserVote(originalUserVote);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-1 text-white/70">
            <button
                onClick={() => handleVote('up')}
                className={`p-1 rounded hover:bg-white/10 transition-colors ${userVote === 'up' ? 'text-accent' : ''}`}
                disabled={loading}
                aria-label="Upvote"
            >
                ▲
            </button>
            <span className="font-mono text-sm font-bold">{votes}</span>
            <button
                onClick={() => handleVote('down')}
                className={`p-1 rounded hover:bg-white/10 transition-colors ${userVote === 'down' ? 'text-red-400' : ''}`}
                disabled={loading}
                aria-label="Downvote"
            >
                ▼
            </button>
        </div>
    );
}
