export function getAishaResponse(message: string): {
    text: string;
    quickReplies?: string[];
} {
    const msg = message.toLowerCase();

    if (msg.includes('budget') || msg.includes('price') || msg.includes('afford') || msg.includes('cost')) {
        return {
            text: "We have properties ranging from AED 1.2M studios to AED 120M island villas. What's your approximate budget? I can immediately shortlist the best options for you.",
            quickReplies: ['Under AED 5M', 'AED 5M - 20M', 'AED 20M+']
        };
    }
    if (msg.includes('villa') || msg.includes('house')) {
        return {
            text: "Our villa collection spans Emirates Hills, Arabian Ranches, Al Barari, and Palm Jumeirah. We currently have stunning options from AED 6.8M to AED 120M. Which community interests you most?",
            quickReplies: ['Emirates Hills', 'Palm Jumeirah', 'Al Barari']
        };
    }
    if (msg.includes('penthouse')) {
        return {
            text: "Our penthouses are truly extraordinary. The Pearl Residence on Palm Jumeirah (AED 45M) and the Bluewaters Sky Penthouse (AED 28M) are our crown jewels. Both are available now — shall I arrange a private viewing?",
            quickReplies: ['View The Pearl', 'View Bluewaters', 'Schedule viewing']
        };
    }
    if (msg.includes('palm')) {
        return {
            text: "Palm Jumeirah is Dubai's most iconic address. We have 3 exceptional properties there — from a beachfront townhouse at AED 15M to The Pearl Residence penthouse at AED 45M. All come with private beach access.",
            quickReplies: ['View Palm properties', 'Schedule viewing']
        };
    }
    if (msg.includes('downtown') || msg.includes('burj')) {
        return {
            text: "Downtown Dubai offers the most iconic living experience — waking up to Burj Khalifa views daily. Our Downtown Panorama apartment (AED 3.8M) is a spectacular option. Would you like full details?",
            quickReplies: ['View Downtown Panorama', 'Other areas']
        };
    }
    if (msg.includes('visit') || msg.includes('viewing') || msg.includes('see') || msg.includes('schedule')) {
        return {
            text: "I'd love to arrange a private viewing for you! Our team is available 7 days a week, including evenings. Please share your email and preferred date, and your dedicated advisor will confirm within the hour.",
            quickReplies: ['This week', 'Next week', 'Contact me directly']
        };
    }
    if (msg.includes('mortgage') || msg.includes('finance') || msg.includes('loan')) {
        return {
            text: "UAE banks offer mortgages up to 75% LTV for residents and 60% for non-residents. Current rates range from 3.5-5% fixed. For a AED 5M property, you'd typically need AED 1.25-2M down payment. Want me to introduce you to our preferred mortgage advisor?",
            quickReplies: ['Yes, connect me', 'Calculate mortgage', 'Tell me more']
        };
    }
    if (msg.includes('golden visa') || msg.includes('residency') || msg.includes('visa')) {
        return {
            text: "Any property purchase above AED 2M qualifies you for the UAE 10-Year Golden Visa! That's permanent residency for you and your family. Most of our portfolio qualifies. It's one of the most compelling reasons to invest in Dubai right now.",
            quickReplies: ['Which properties qualify?', 'Tell me more']
        };
    }
    if (msg.includes('invest') || msg.includes('rental') || msg.includes('yield') || msg.includes('roi')) {
        return {
            text: "Dubai offers some of the world's highest rental yields — typically 5-8% gross, with zero property or income tax. Business Bay, Dubai Marina, and JBR consistently deliver strong returns. Would you like our Investment Guide?",
            quickReplies: ['Send Investment Guide', 'Best areas for ROI']
        };
    }

    return {
        text: "Thank you for your message! I'm Aisha, your AI property advisor. I can help you find the perfect Dubai property, arrange viewings, or answer any questions about the market. What are you looking for?",
        quickReplies: ['Browse villas', 'Browse apartments', 'My budget', 'Schedule viewing']
    };
}
