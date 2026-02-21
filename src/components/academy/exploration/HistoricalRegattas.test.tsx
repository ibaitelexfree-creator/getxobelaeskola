import { render, screen, fireEvent } from '@testing-library/react';
import HistoricalRegattas from './HistoricalRegattas';
import { HISTORICAL_REGATTAS } from '@/data/academy/historicalRegattas';
import { vi } from 'vitest';

// Mock the Map component since we can't render Leaflet in jsdom easily
vi.mock('./RegattaMap', () => ({
    default: () => <div data-testid="regatta-map">Map Placeholder</div>
}));

// Mock Lucide icons to avoid rendering issues and keep test clean
vi.mock('lucide-react', () => ({
    Play: () => <span>Play</span>,
    Pause: () => <span>Pause</span>,
    SkipBack: () => <span>SkipBack</span>,
    SkipForward: () => <span>SkipForward</span>,
    Wind: () => <span>Wind</span>,
    Thermometer: () => <span>Thermometer</span>,
    Waves: () => <span>Waves</span>,
    Info: () => <span>Info</span>,
    List: () => <span>List</span>,
    X: () => <span>X</span>,
}));

describe('HistoricalRegattas', () => {
    it('renders the list of regattas', () => {
        render(<HistoricalRegattas />);

        HISTORICAL_REGATTAS.forEach(regatta => {
            const elements = screen.getAllByText(regatta.name);
            expect(elements.length).toBeGreaterThan(0);
        });
    });

    it('selects a regatta when clicked', () => {
        render(<HistoricalRegattas />);

        const secondRegatta = HISTORICAL_REGATTAS[1];
        const button = screen.getByText(secondRegatta.name);

        fireEvent.click(button);

        // Check if the title in the overlay updated
        // Note: The title appears in the list and in the overlay.
        // screen.getAllByText returns array.
        const titles = screen.getAllByText(secondRegatta.name);
        expect(titles.length).toBeGreaterThan(1); // List item + Overlay title
    });

    it('renders playback controls', () => {
        render(<HistoricalRegattas />);
        expect(screen.getByText('Play')).toBeInTheDocument();
        expect(screen.getByText('SkipBack')).toBeInTheDocument();
        expect(screen.getByText('SkipForward')).toBeInTheDocument();
    });
});
