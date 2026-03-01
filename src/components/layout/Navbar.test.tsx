import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Navbar from './Navbar';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useParams: () => ({ locale: 'es' }),
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => '/es/home'
}));

// Mock supabase
vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
            signOut: vi.fn().mockResolvedValue({ error: null })
        }
    })
}));

// Mock next/image
vi.mock('next/image', () => ({
    default: (props: any) => <img {...props} />
}));

describe('Navbar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the logo and main navigation links', async () => {
        render(<Navbar />);

        // Wait for loading to finish (though it's fast in mocks)
        await waitFor(() => expect(screen.getByAltText('Getxo Bela Eskola')).toBeDefined());

        expect(screen.getByText('GETXO')).toBeDefined();
        // Check for some nav items - they are translated by our mock as the key itself
        expect(screen.getAllByText('courses').length).toBeGreaterThan(0);
        expect(screen.getAllByText('academy').length).toBeGreaterThan(0);
    });

    it('should show login link when not authenticated', async () => {
        render(<Navbar />);
        await waitFor(() => expect(screen.getAllByText('login').length).toBeGreaterThan(0));
    });

    it('should open mobile menu when clicking toggle', async () => {
        const { container } = render(<Navbar />);

        // Find by class since it has no label
        const toggle = container.querySelector('.xl\\:hidden') as HTMLButtonElement;
        fireEvent.click(toggle);

        // Mobile menu overlay has 'fixed inset-0 z-[90] ...'
        const overlay = container.querySelector('.bg-nautical-deep.xl\\:hidden');
        expect(overlay?.className).toContain('opacity-100');
    });
});
