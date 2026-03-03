import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentProfileSidebar from './StudentProfileSidebar';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key
}));

// Mock next/image
vi.mock('next/image', () => ({
    default: (props: any) => <img {...props} />
}));

// Mock next/link
vi.mock('next/link', () => ({
    default: ({ children, href }: any) => <a href={href}>{children}</a>
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
    Sparkles: () => <div data-testid="sparkles-icon" />
}));

// Mock supabase
vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn()
}));

// Mock api utils
vi.mock('@/lib/api', () => ({
    apiUrl: (path: string) => path
}));

// Mock EditProfileModal
vi.mock('./EditProfileModal', () => ({
    default: () => <div data-testid="edit-profile-modal" />
}));

// Mock LogoutButton
vi.mock('@/components/auth/LogoutButton', () => ({
    default: () => <button>Logout</button>
}));

describe('StudentProfileSidebar', () => {
    const mockProfile = {
        id: '123',
        nombre: 'John',
        apellidos: 'Doe',
        xp: 100,
        status_socio: 'activo',
        rol: 'Estudiante'
    };

    const defaultProps = {
        profile: mockProfile,
        email: 'john@example.com',
        locale: 'es'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('scrollTo', vi.fn());
        vi.stubGlobal('alert', vi.fn());

        // Mock window.location.href
        // In JSDOM we can't easily mock location.href directly by assignment
        // if it's not handled correctly.
        const mockLocation = new URL('http://localhost');
        vi.stubGlobal('location', mockLocation);

        // Mock fetch
        vi.stubGlobal('fetch', vi.fn());
    });

    it('should render profile information correctly', () => {
        render(<StudentProfileSidebar {...defaultProps} />);

        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByText('100')).toBeDefined();
        expect(screen.getByText('john@example.com')).toBeDefined();
        expect(screen.getByText('Estudiante')).toBeDefined();
        expect(screen.getByText('official_partner')).toBeDefined();
    });

    it('should handle membership management success', async () => {
        const mockUrl = 'https://billing.stripe.com/p/session/test';
        (fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ url: mockUrl })
        });

        render(<StudentProfileSidebar {...defaultProps} />);

        const manageBtn = screen.getByText(/managing_subscription/i);
        fireEvent.click(manageBtn);

        await waitFor(() => {
            expect(window.location.href).toBe(mockUrl);
        });
    });

    it('should handle membership management API error with message', async () => {
        const errorMessage = 'Something went wrong';
        (fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ error: errorMessage })
        });

        render(<StudentProfileSidebar {...defaultProps} />);

        const manageBtn = screen.getByText(/managing_subscription/i);
        fireEvent.click(manageBtn);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(errorMessage);
        });
    });

    it('should handle membership management API error without message', async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({})
        });

        render(<StudentProfileSidebar {...defaultProps} />);

        const manageBtn = screen.getByText(/managing_subscription/i);
        fireEvent.click(manageBtn);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('portal_error');
        });
    });

    it('should handle membership management network error', async () => {
        (fetch as any).mockRejectedValue(new Error('Network failure'));

        render(<StudentProfileSidebar {...defaultProps} />);

        const manageBtn = screen.getByText(/managing_subscription/i);
        fireEvent.click(manageBtn);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('connection_error');
        });
    });

    it('should show "verified_member" and not "official_partner" if not socio', () => {
        const nonSocioProfile = { ...mockProfile, status_socio: 'inactive' };
        render(<StudentProfileSidebar {...defaultProps} profile={nonSocioProfile as any} />);

        expect(screen.getByText('verified_member')).toBeDefined();
        expect(screen.queryByText('official_partner')).toBeNull();
    });

    it('should call scrollTo on mount', () => {
        render(<StudentProfileSidebar {...defaultProps} />);
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
    });
});
