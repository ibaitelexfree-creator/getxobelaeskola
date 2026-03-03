import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentProfileSidebar from './StudentProfileSidebar';
import { Profile } from '@/types/student';

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

// Mock @/lib/api
vi.mock('@/lib/api', () => ({
    apiUrl: (path: string) => path
}));

// Mock sub-components
vi.mock('./EditProfileModal', () => ({
    default: () => <div data-testid="edit-profile-modal" />
}));

vi.mock('@/components/auth/LogoutButton', () => ({
    default: () => <button>Logout</button>
}));

// Mock window.scrollTo
window.scrollTo = vi.fn();
// Mock window.location
const originalLocation = window.location;
// @ts-ignore
delete window.location;
window.location = { ...originalLocation, href: '' } as any;

const mockProfile: Profile = {
    id: '1',
    nombre: 'John',
    apellidos: 'Doe',
    xp: 100,
    status_socio: 'activo',
    rol: 'student'
};

describe('StudentProfileSidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        window.alert = vi.fn();
    });

    it('should scroll to top on mount', () => {
        render(<StudentProfileSidebar profile={mockProfile} email="john@example.com" locale="es" />);
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
    });

    it('should render profile information', () => {
        render(<StudentProfileSidebar profile={mockProfile} email="john@example.com" locale="es" />);
        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByText('john@example.com')).toBeDefined();
        expect(screen.getByText('100')).toBeDefined();
    });

    it('should handle manage membership success path', async () => {
        const mockUrl = 'https://billing.stripe.com/p/session/test';
        (global.fetch as any).mockResolvedValue({
            json: () => Promise.resolve({ url: mockUrl })
        });

        render(<StudentProfileSidebar profile={mockProfile} email="john@example.com" locale="es" />);

        const manageBtn = screen.getByText(/managing_subscription/);
        fireEvent.click(manageBtn);

        await waitFor(() => {
            expect(window.location.href).toBe(mockUrl);
        });
    });

    it('should handle manage membership error from API', async () => {
        (global.fetch as any).mockResolvedValue({
            json: () => Promise.resolve({ error: 'Some API Error' })
        });

        render(<StudentProfileSidebar profile={mockProfile} email="john@example.com" locale="es" />);

        const manageBtn = screen.getByText(/managing_subscription/);
        fireEvent.click(manageBtn);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Some API Error');
        });
    });

    it('should handle manage membership fetch exception', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network Error'));

        render(<StudentProfileSidebar profile={mockProfile} email="john@example.com" locale="es" />);

        const manageBtn = screen.getByText(/managing_subscription/);
        fireEvent.click(manageBtn);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('connection_error');
        });
    });

    it('should not show membership buttons if not socio', () => {
        const nonSocioProfile = { ...mockProfile, status_socio: 'no_socio' };
        render(<StudentProfileSidebar profile={nonSocioProfile} email="john@example.com" locale="es" />);

        expect(screen.queryByText(/managing_subscription/)).toBeNull();
        expect(screen.queryByText(/membership_card/)).toBeNull();
    });
});
