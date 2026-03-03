export interface ChatMessage {
    id: string;
    role: 'user' | 'aisha';
    text: string;
    timestamp: Date;
}

/**
 * Fetches a response from Aisha the AI Advisor.
 * Primary: Calls the local Next.js API route which uses Gemini.
 * Fallback: Uses basic keyword matching if the API is unavailable.
 */
export async function getAishaResponse(message: string): Promise<string> {
    try {
        // Handle potential subpath deployment
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        let apiPath = '/api/chat';

        // Check if we are in the controlmanager subpath but NOT already having the full prefix
        // Next.js with basePath often expects the full path for fetch if it's absolute from root
        if (currentPath.includes('/controlmanager/realstate')) {
            apiPath = '/controlmanager/realstate/api/chat';
        }

        const response = await fetch(apiPath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn("Aisha API not available, using smart fallback. Status:", response.status);
            throw new Error('Aisha API request failed');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Error fetching Aisha response:", error);

        // Fallback logic for offline/error states
        const msg = message.toLowerCase();

        if (msg.includes('budget') || msg.includes('price') || msg.includes('afford') || msg.includes('cost')) {
            return "Luxe Dubai Estates offers an exclusive portfolio ranging from AED 1.2M executive studios to AED 120M private island mansions. May I ask what investment range you are considering today?";
        }
        if (msg.includes('villa') || msg.includes('house')) {
            return "Our villa collection in Emirates Hills and Palm Jumeirah represents the pinnacle of Dubai living. Are you looking for a contemporary beachfront residence or a more traditional palatial estate?";
        }
        if (msg.includes('penthouse')) {
            return "Our collection includes some of the world's most sought-after penthouses, featuring private pools and 360-degree skyline views. Shall I shortlist our current off-market opportunities for you?";
        }
        if (msg.includes('visit') || msg.includes('viewing') || msg.includes('see') || msg.includes('schedule')) {
            return "I would be delighted to arrange a private viewing for you. We offer personalized tours via chauffeured transport or private helicopter for our elite properties. Please share your contact details or email, and an advisor will coordinate with you.";
        }
        if (msg.includes('palm')) {
            return "Palm Jumeirah remains our most highly requested location. We currently have several distinguished 'Garden Homes' and signature villas ready for immediate acquisition.";
        }
        if (msg.includes('invest') || msg.includes('rental') || msg.includes('yield') || msg.includes('roi')) {
            return "Dubai's real estate market continues to outperform global benchmarks, offering yields up to 8% tax-free. I can provide a detailed ROI analysis for our top-performing assets if you'd like.";
        }
        if (msg.includes('privacy') || msg.includes('legal') || msg.includes('data') || msg.includes('terms') || msg.includes('policy')) {
            return "We take data protection very seriously at Luxe Dubai Estates. Our Privacy Policy is fully compliant with UAE Federal Law No. 45 and RERA regulations. You can find the full details at /privacy-policy. Is there a specific legal aspect you're concerned about?";
        }

        return "I'm currently attending to several high-profile consultations, but I'm here to assist! I'm Aisha, your AI luxury property advisor. Are you interested in exploring our villas, penthouses, or perhaps a signature residence on the Palm?";
    }
}
