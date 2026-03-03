import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentProfileSidebar from './StudentProfileSidebar';
import { Profile } from '@/types/student';

// Mocks
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

vi.mock('next/image', () => ({
    default: ({ src, alt, fill, className }: any) => (
        <img src={src} alt={alt} className={className} data-fill={fill ? 'true' : 'false'} />
    ),
}));

vi.mock('lucide-react', () => ({
    Sparkles: () => <div data-testid="sparkles-icon" />,
}));

vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(),
}));

vi.mock('./EditProfileModal', () => ({
    default: ({ isOpen, onClose }: any) => (
        isOpen ? <div data-testid="edit-profile-modal"><button onClick={onClose}>Close</button></div> : null
    ),
}));

vi.mock('@/components/auth/LogoutButton', () => ({
    default: () => <div data-testid="logout-button" />,
}));

vi.mock('@/lib/api', () => ({
    apiUrl: (path: string) => path,
}));

describe('StudentProfileSidebar', () => {
    const mockProfile: Profile = {
        id: '123',
        nombre: 'John',
        apellidos: 'Doe',
        rol: 'student',
        status_socio: 'activo',
        xp: 500,
    };

    const mockEmail = 'john.doe@example.com';
    const mockLocale = 'es';

    const originalLocation = window.location;

    beforeEach(() => {
        vi.stubGlobal('scrollTo', vi.fn());
        vi.stubGlobal('alert', vi.fn());
        vi.stubGlobal('fetch', vi.fn());
        vi.spyOn(console, 'error').mockImplementation(() => {});

        // Mock window.location.href
        delete (window as any).location;
        window.location = { ...originalLocation, href: '' } as any;
    });

    afterEach(() => {
        window.location = originalLocation;
        vi.restoreAllMocks();
    });

    it('should render profile information correctly', () => {
        render(<StudentProfileSidebar profile={mockProfile} email={mockEmail} locale={mockLocale} />);

        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByText('500')).toBeDefined();
        expect(screen.getByText(mockEmail)).toBeDefined();
        expect(screen.getByText('student')).toBeDefined();
        expect(screen.getByTestId('sparkles-icon')).toBeDefined();
        expect(screen.getByText('official_partner')).toBeDefined();
    });

    it('should not show official partner badge if not socio', () => {
        const nonSocioProfile = { ...mockProfile, status_socio: 'inactivo' };
        render(<StudentProfileSidebar profile={nonSocioProfile} email={mockEmail} locale={mockLocale} />);

        expect(screen.queryByTestId('sparkles-icon')).toBeNull();
        expect(screen.queryByText('official_partner')).toBeNull();
    });

    it('should open edit modal when edit button is clicked', () => {
        render(<StudentProfileSidebar profile={mockProfile} email={mockEmail} locale={mockLocale} />);

        const editButton = screen.getByText('edit_profile');
        fireEvent.click(editButton);

        expect(screen.getByTestId('edit-profile-modal')).toBeDefined();
    });

    describe('handleManageMembership', () => {
        it('should redirect to portal URL on success', async () => {
            const mockUrl = 'https://stripe.com/portal';
            (fetch as any).mockResolvedValueOnce({
                json: async () => ({ url: mockUrl }),
            });

            render(<StudentProfileSidebar profile={mockProfile} email={mockEmail} locale={mockLocale} />);

            const manageButton = screen.getByText('⚙️ managing_subscription');
            fireEvent.click(manageButton);

            await waitFor(() => {
                expect(window.location.href).toBe(mockUrl);
            });
        });

        it('should show alert on API error (e.g., missing URL)', async () => {
            const errorMessage = 'Custom portal error';
            (fetch as any).mockResolvedValueOnce({
                json: async () => ({ error: errorMessage }),
            });

            render(<StudentProfileSidebar profile={mockProfile} email={mockEmail} locale={mockLocale} />);

            const manageButton = screen.getByText('⚙️ managing_subscription');
            fireEvent.click(manageButton);

            await waitFor(() => {
                expect(alert).toHaveBeenCalledWith(errorMessage);
            });
        });

        it('should show default error message if no error in response', async () => {
            (fetch as any).mockResolvedValueOnce({
                json: async () => ({}),
            });

            render(<StudentProfileSidebar profile={mockProfile} email={mockEmail} locale={mockLocale} />);

            const manageButton = screen.getByText('⚙️ managing_subscription');
            fireEvent.click(manageButton);

            await waitFor(() => {
                expect(alert).toHaveBeenCalledWith('portal_error');
            });
        });

        it('should handle network/fetch failure', async () => {
            (fetch as any).mockRejectedValueOnce(new Error('Network error'));

            render(<StudentProfileSidebar profile={mockProfile} email={mockEmail} locale={mockLocale} />);

            const manageButton = screen.getByText('⚙️ managing_subscription');
            fireEvent.click(manageButton);

            await waitFor(() => {
                expect(console.error).toHaveBeenCalledWith('Portal error:', expect.any(Error));
                expect(alert).toHaveBeenCalledWith('connection_error');
            });
        });
    });
});
