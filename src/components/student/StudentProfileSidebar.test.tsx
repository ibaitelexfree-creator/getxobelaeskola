import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentProfileSidebar from './StudentProfileSidebar';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));

// Mock next/image
vi.mock('next/image', () => ({
    default: (props: any) => <img {...props} />
}));

// Mock supabase
vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(),
}));

// Mock child components
vi.mock('./EditProfileModal', () => ({
    default: ({ isOpen, onClose }: any) => isOpen ? (
        <div data-testid="edit-modal">
            <button onClick={onClose}>Close Modal</button>
        </div>
    ) : null
}));

vi.mock('@/components/auth/LogoutButton', () => ({
    default: () => <button>Logout</button>
}));

// Mock apiUrl
vi.mock('@/lib/api', () => ({
    apiUrl: (path: string) => path
}));

describe('StudentProfileSidebar', () => {
    const mockProfile = {
        id: 'student-1',
        nombre: 'John',
        apellidos: 'Doe',
        status_socio: 'activo',
        rol: 'student',
        xp: 1500,
    };

    const mockEmail = 'john.doe@example.com';
    const mockLocale = 'es';

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('scrollTo', vi.fn());
        vi.stubGlobal('alert', vi.fn());

        // Properly mock window.location.href
        const originalLocation = window.location;
        delete (window as any).location;
        window.location = { ...originalLocation, href: '' };
    });

    it('should render profile information correctly', () => {
        render(<StudentProfileSidebar profile={mockProfile as any} email={mockEmail} locale={mockLocale} />);

        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByText(mockEmail)).toBeDefined();
        expect(screen.getByText('1500')).toBeDefined();
        expect(screen.getByText('verified_member')).toBeDefined();
        expect(screen.getByText('official_partner')).toBeDefined();
    });

    it('should open edit modal when clicking edit button', () => {
        render(<StudentProfileSidebar profile={mockProfile as any} email={mockEmail} locale={mockLocale} />);

        fireEvent.click(screen.getByText('edit_profile'));
        expect(screen.getByTestId('edit-modal')).toBeDefined();
    });

    it('should handle successful membership management redirection', async () => {
        const mockUrl = 'https://stripe.com/portal';
        global.fetch = vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ url: mockUrl }),
        });

        render(<StudentProfileSidebar profile={mockProfile as any} email={mockEmail} locale={mockLocale} />);

        fireEvent.click(screen.getByText(/managing_subscription/));

        await waitFor(() => {
            expect(window.location.href).toBe(mockUrl);
        });
    });

    it('should handle API-returned error in membership management', async () => {
        const errorMessage = 'Internal Server Error';
        global.fetch = vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ error: errorMessage }),
        });

        render(<StudentProfileSidebar profile={mockProfile as any} email={mockEmail} locale={mockLocale} />);

        fireEvent.click(screen.getByText(/managing_subscription/));

        await waitFor(() => {
            expect(alert).toHaveBeenCalledWith(errorMessage);
        });
    });

    it('should handle fetch exception in membership management', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        render(<StudentProfileSidebar profile={mockProfile as any} email={mockEmail} locale={mockLocale} />);

        fireEvent.click(screen.getByText(/managing_subscription/));

        await waitFor(() => {
            expect(alert).toHaveBeenCalledWith('connection_error');
        });
    });

    it('should show loading state during membership management', async () => {
        let resolveFetch: any;
        const fetchPromise = new Promise((resolve) => {
            resolveFetch = resolve;
        });
        global.fetch = vi.fn().mockReturnValue(fetchPromise);

        render(<StudentProfileSidebar profile={mockProfile as any} email={mockEmail} locale={mockLocale} />);

        fireEvent.click(screen.getByText(/managing_subscription/));

        expect(screen.getByText('loading')).toBeDefined();

        resolveFetch({
            json: () => Promise.resolve({ url: 'http://test.com' })
        });

        await waitFor(() => {
            expect(screen.queryByText('loading')).toBeNull();
        });
    });
});
