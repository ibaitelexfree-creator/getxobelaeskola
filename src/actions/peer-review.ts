// This file no longer uses 'use server' to allow static export for Capacitor.
// It now calls an API route instead.

export async function getPendingReviews(moduleId: string) {
    try {
        const res = await fetch(`/api/peer-review?moduleId=${moduleId}`);
        return await res.json();
    } catch (error) {
        console.error('Error fetching pending reviews:', error);
        return { error: 'Error de conexión' };
    }
}

export async function submitReview(reviewData: {
    intentoId: string;
    puntuacion: number;
    rubricaValores: any;
    feedback: string;
    moduleId: string;
}) {
    try {
        const res = await fetch('/api/peer-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData),
        });
        return await res.json();
    } catch (error) {
        console.error('Error submitting review:', error);
        return { error: 'Error de conexión' };
    }
}
