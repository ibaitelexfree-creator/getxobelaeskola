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
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            throw new Error('Aisha API request failed');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Error fetching Aisha response:", error);

        // Fallback logic for offline/error states
        const msg = message.toLowerCase();

        if (msg.includes('budget') || msg.includes('price') || msg.includes('afford') || msg.includes('cost')) {
            return "We have properties ranging from AED 1.2M studios to AED 120M island villas. What's your approximate budget? I can immediately shortlist the best options for you.";
        }
        if (msg.includes('villa') || msg.includes('house')) {
            return "Our villa collection spans Emirates Hills, Arabian Ranches, Al Barari, and Palm Jumeirah. Which community interests you most?";
        }
        if (msg.includes('visit') || msg.includes('viewing') || msg.includes('see') || msg.includes('schedule')) {
            return "I'd love to arrange a private viewing for you! Please share your email and preferred date, and your dedicated advisor will confirm within the hour.";
        }
        if (msg.includes('palm')) {
            return "Palm Jumeirah is Dubai's most iconic address. We have several exceptional properties there — from beachfront townhouses to crown jewel penthouses.";
        }

        return "Thank you for your message! I'm currently having a small connection issue, but I'm Aisha, your AI property advisor. How can I help you find your dream home in Dubai?";
    }
}
