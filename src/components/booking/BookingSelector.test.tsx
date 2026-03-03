import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import BookingSelector from './BookingSelector';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key
}));

// Mock next/navigation
const mockReplace = vi.fn();
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: mockReplace,
        push: mockPush,
    }),
    usePathname: () => '/es/courses/test-course'
}));

// Mock Supabase
const mockGetUser = vi.fn();
const mockFrom = vi.fn(() => ({
    select: vi.fn(() => ({
        eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
    }))
}));

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getUser: mockGetUser,
        },
        from: mockFrom
    })
}));

// Mock LegalConsentModal to trigger onConfirm directly
vi.mock('../shared/LegalConsentModal', () => ({
    default: ({ isOpen, onConfirm, onClose }: any) => {
        if (!isOpen) return null;
        return (
            <div data-testid="legal-modal">
                <button data-testid="confirm-legal" onClick={() => onConfirm({ fullName: 'John Doe', email: 'john@example.com', dni: '12345678Z' })}>Confirm</button>
                <button data-testid="close-legal" onClick={onClose}>Close</button>
            </div>
        );
    }
}));

// Mock window.location
const originalLocation = window.location;

describe('BookingSelector', () => {
    const editions = [
        { id: '1', fecha_inicio: '2025-01-01', fecha_fin: '2025-01-10', plazas_totales: 10, plazas_ocupadas: 5 }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // @ts-ignore
        delete window.location;
        window.location = {
            ...originalLocation,
            href: '',
            pathname: '/es/courses/test-course',
            search: '',
            origin: 'http://localhost'
        };
        global.fetch = vi.fn();
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'test@example.com' } }, error: null });
    });

    afterEach(() => {
        window.location = originalLocation;
    });

    it('should handle successful booking flow', async () => {
        (global.fetch as any)
            .mockResolvedValueOnce({ ok: true }) // Consent API
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ url: 'https://checkout.stripe.com/test' })
            }); // Checkout API

        await act(async () => {
            render(<BookingSelector editions={editions} coursePrice={100} courseId="course-1" />);
        });

        // Select edition
        const editionButton = screen.getByLabelText(/select_date/i);
        fireEvent.click(editionButton);

        // Click book
        const bookButton = screen.getByText(/book_for 100€/i);
        fireEvent.click(bookButton);

        // Confirm legal
        const confirmButton = screen.getByTestId('confirm-legal');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(window.location.href).toBe('https://checkout.stripe.com/test');
        });
    });

    it('should redirect to login if user is not authenticated', async () => {
        mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

        await act(async () => {
            render(<BookingSelector editions={editions} coursePrice={100} courseId="course-1" />);
        });

        fireEvent.click(screen.getByLabelText(/select_date/i));
        fireEvent.click(screen.getByText(/book_for 100€/i));

        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/es/auth/login'));
    });

    it('should handle consent API error', async () => {
        (global.fetch as any).mockResolvedValueOnce({ ok: false }); // Consent API fails

        await act(async () => {
            render(<BookingSelector editions={editions} coursePrice={100} courseId="course-1" />);
        });

        fireEvent.click(screen.getByLabelText(/select_date/i));
        fireEvent.click(screen.getByText(/book_for 100€/i));
        fireEvent.click(screen.getByTestId('confirm-legal'));

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith(
                expect.stringContaining('error=No+se+pudo+registrar+la+firma+legal.+Int%C3%A9ntalo+de+nuevo.'),
                expect.any(Object)
            );
        });
    });

    it('should handle checkout API error', async () => {
        (global.fetch as any)
            .mockResolvedValueOnce({ ok: true }) // Consent OK
            .mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ error: 'Checkout failed' })
            }); // Checkout Fails

        await act(async () => {
            render(<BookingSelector editions={editions} coursePrice={100} courseId="course-1" />);
        });

        fireEvent.click(screen.getByLabelText(/select_date/i));
        fireEvent.click(screen.getByText(/book_for 100€/i));
        fireEvent.click(screen.getByTestId('confirm-legal'));

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith(
                expect.stringContaining('error=Checkout+failed'),
                expect.any(Object)
            );
        });
    });

    it('should handle 401 error and redirect to login during checkout', async () => {
        (global.fetch as any)
            .mockResolvedValueOnce({ ok: true }) // Consent OK
            .mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: 'Unauthorized' })
            });

        await act(async () => {
            render(<BookingSelector editions={editions} coursePrice={100} courseId="course-1" />);
        });

        fireEvent.click(screen.getByLabelText(/select_date/i));
        fireEvent.click(screen.getByText(/book_for 100€/i));
        fireEvent.click(screen.getByTestId('confirm-legal'));

        await waitFor(() => {
            expect(window.location.href).toBe('/es/auth/login?msg=verify_email');
        });
    });
});
