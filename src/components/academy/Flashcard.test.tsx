import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Flashcard from './Flashcard';

// Mocks
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, style, animate, onClick }: any) => (
            <div className={className} style={style} onClick={onClick} data-animate={JSON.stringify(animate)}>
                {children}
            </div>
        ),
    },
}));

vi.mock('next/image', () => ({
    default: ({ src, alt, fill, className }: any) => (
        <img src={src} alt={alt} className={className} data-fill={fill ? 'true' : 'false'} />
    ),
}));

describe('Flashcard', () => {
    const mockPregunta = {
        id: 'p1',
        enunciado_es: '¿Qué es un nudo?',
        enunciado_eu: 'Zer da nudo bat?',
        explicacion_es: 'Unidad de velocidad.',
        explicacion_eu: 'Abiadura unitatea.',
        respuesta_correcta: '1 milla por hora',
        imagen_url: '/images/knot.jpg'
    };

    it('should render front side by default', () => {
        const onFlip = vi.fn();
        render(<Flashcard pregunta={mockPregunta} isFlipped={false} onFlip={onFlip} locale="es" />);

        expect(screen.getByText('¿Qué es un nudo?')).toBeDefined();
        expect(screen.getByAltText('Imagen de pregunta')).toBeDefined();

        const motionDiv = screen.getByRole('heading', { level: 3 }).parentElement?.parentElement;
        expect(motionDiv?.getAttribute('data-animate')).toContain('"rotateY":0');
    });

    it('should show back side when flipped', () => {
        render(<Flashcard pregunta={mockPregunta} isFlipped={true} onFlip={() => { }} locale="es" />);

        expect(screen.getByText('Respuesta Correcta')).toBeDefined();
        expect(screen.getByText('1 milla por hora')).toBeDefined();
        expect(screen.getByText('"Unidad de velocidad."')).toBeDefined();
    });

    it('should call onFlip when clicked', () => {
        const onFlip = vi.fn();
        render(<Flashcard pregunta={mockPregunta} isFlipped={false} onFlip={onFlip} locale="es" />);

        const textElement = screen.getByText('¿Qué es un nudo?');
        const cardContainer = textElement.parentElement?.parentElement?.parentElement;

        if (cardContainer) {
            fireEvent.click(cardContainer);
        }

        expect(onFlip).toHaveBeenCalled();
    });

    it('should respect locale for bilingual text', () => {
        render(<Flashcard pregunta={mockPregunta} isFlipped={false} onFlip={() => { }} locale="eu" />);
        expect(screen.getByText('Zer da nudo bat?')).toBeDefined();
    });
});
