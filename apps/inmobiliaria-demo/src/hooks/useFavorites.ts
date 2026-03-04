'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useFavorites(userId: string | undefined) {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchFavorites = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('favorites')
            .select('property_slug')
            .eq('user_id', userId);

        if (!error && data) {
            setFavorites(data.map(f => f.property_slug));
        }
        setLoading(false);
    }, [userId, supabase]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const toggleFavorite = async (propertySlug: string) => {
        if (!userId) return false;

        const isFavorite = favorites.includes(propertySlug);

        if (isFavorite) {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('property_slug', propertySlug);

            if (!error) {
                setFavorites(prev => prev.filter(slug => slug !== propertySlug));
                return true;
            }
        } else {
            const { error } = await supabase
                .from('favorites')
                .insert([{ user_id: userId, property_slug: propertySlug }]);

            if (!error) {
                setFavorites(prev => [...prev, propertySlug]);
                return true;
            }
        }
        return false;
    };

    return { favorites, toggleFavorite, loading, refresh: fetchFavorites };
}
