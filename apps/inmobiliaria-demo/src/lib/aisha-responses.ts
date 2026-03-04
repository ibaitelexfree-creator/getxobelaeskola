export function getAishaResponse(message: string): {
    text: string;
    quickReplies?: string[];
} {
    const msg = message.toLowerCase();

    // -- IDENTITY / NAME --
    if (msg.includes('quien eres') || msg.includes('who are you') || msg.includes('llamas') || msg.includes('name')) {
        return {
            text: "I am Aisha, your dedicated AI property advisor for Luxe Dubai Estates. I specialize in finding the most prestigious properties in Dubai. How can I assist you today?",
            quickReplies: ['Browse villas', 'My budget', 'Schedule viewing']
        };
    }

    // -- GREETINGS --
    if (msg.includes('hola') || msg.includes('hello') || msg.includes('hi ') || msg === 'hi') {
        return {
            text: "Hello! I'm Aisha 👋 I can help you find your perfect home in Dubai. Are you looking for a villa, a penthouse, or perhaps an investment opportunity?",
            quickReplies: ['Villas', 'Penthouses', 'Investment Guide']
        };
    }

    // -- BUDGET / PRICE --
    if (msg.includes('budget') || msg.includes('price') || msg.includes('afford') || msg.includes('cost') || msg.includes('precio') || msg.includes('cuanto') || msg.includes('presupuesto')) {
        return {
            text: "We have properties ranging from AED 1.2M studios in Dubai Marina to AED 120M island villas on the Palm. What's your approximate budget? I can immediately shortlist the best options for you.",
            quickReplies: ['Under AED 5M', 'AED 5M - 20M', 'AED 20M+']
        };
    }

    // -- VILLAS --
    if (msg.includes('villa') || msg.includes('house') || msg.includes('casa')) {
        return {
            text: "Our villa collection spans Emirates Hills, Arabian Ranches, Al Barari, and Palm Jumeirah. We currently have stunning options from AED 6.8M to AED 120M. Which community interests you most?",
            quickReplies: ['Emirates Hills', 'Palm Jumeirah', 'Al Barari']
        };
    }

    // -- PENTHOUSES --
    if (msg.includes('penthouse') || msg.includes('atico')) {
        return {
            text: "Our penthouses are truly extraordinary. The Pearl Residence on Palm Jumeirah (AED 45M) and the Bluewaters Sky Penthouse (AED 28M) are our crown jewels. Both are available now — shall I arrange a private viewing?",
            quickReplies: ['View The Pearl', 'View Bluewaters', 'Schedule viewing']
        };
    }

    // -- PALM JUMEIRAH --
    if (msg.includes('palm') || msg.includes('palma')) {
        return {
            text: "Palm Jumeirah is Dubai's most iconic address. We have 3 exceptional properties there — from a beachfront townhouse at AED 15M to The Pearl Residence penthouse at AED 45M. All come with private beach access.",
            quickReplies: ['View Palm properties', 'Schedule viewing']
        };
    }

    // -- DOWNTOWN --
    if (msg.includes('downtown') || msg.includes('burj')) {
        return {
            text: "Downtown Dubai offers the most iconic living experience — waking up to Burj Khalifa views daily. Our Downtown Panorama apartment (AED 3.8M) is a spectacular option. Would you like full details?",
            quickReplies: ['View Downtown Panorama', 'Other areas']
        };
    }

    // -- VIEWINGS / SCHEDULE --
    if (msg.includes('visit') || msg.includes('viewing') || msg.includes('see') || msg.includes('schedule') || msg.includes('cita') || msg.includes('ver') || msg.includes('visita')) {
        return {
            text: "I'd love to arrange a private viewing for you! Our team is available 7 days a week, including evenings. Please share your email and preferred date, and your dedicated advisor will confirm within the hour.",
            quickReplies: ['This week', 'Next week', 'Contact me directly']
        };
    }

    // -- MORTGAGE / FINANCE --
    if (msg.includes('mortgage') || msg.includes('finance') || msg.includes('loan') || msg.includes('hipoteca')) {
        return {
            text: "UAE banks offer mortgages up to 75% LTV for residents and 60% for non-residents. Current rates range from 3.5-5% fixed. For a AED 5M property, you'd typically need AED 1.25-2M down payment. Want me to introduce you to our preferred mortgage advisor?",
            quickReplies: ['Yes, connect me', 'Calculate mortgage', 'Tell me more']
        };
    }

    // -- VISA --
    if (msg.includes('golden visa') || msg.includes('residency') || msg.includes('visa')) {
        return {
            text: "Any property purchase above AED 2M qualifies you for the UAE 10-Year Golden Visa! That's permanent residency for you and your family. Most of our portfolio qualifies. It's one of the most compelling reasons to invest in Dubai right now.",
            quickReplies: ['Which properties qualify?', 'Tell me more']
        };
    }

    // -- INVESTMENT --
    if (msg.includes('invest') || msg.includes('rental') || msg.includes('yield') || msg.includes('roi') || msg.includes('invertir') || msg.includes('rentabilidad')) {
        return {
            text: "Dubai offers some of the world's highest rental yields — typically 5-8% gross, with zero property or income tax. Business Bay, Dubai Marina, and JBR consistently deliver strong returns. Would you like our Investment Guide?",
            quickReplies: ['Send Investment Guide', 'Best areas for ROI']
        };
    }

    // -- CATCH ALL --
    return {
        text: "I'm not sure I fully understood that, but I'm here to help! I can provide info on luxury villas, penthouses, ROI trends, or the Golden Visa. What area of Dubai are you most interested in?",
        quickReplies: ['Browse properties', 'Market trends', 'My budget', 'Schedule viewing']
    };
}
