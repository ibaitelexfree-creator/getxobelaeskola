import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileProfileClient from './MobileProfileClient';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
    }),
    usePathname: () => '/',
}));

// Mock supabase client
vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        },
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null }),
    }),
}));

// Mock sub-components to avoid complex renders
vi.mock('@/components/student/EditProfileModal', () => ({
    default: () => <div data-testid="edit-profile-modal" />
}));
vi.mock('@/components/student/SafetySettingsModal', () => ({
    default: () => <div data-testid="safety-settings-modal" />
}));
vi.mock('@/components/auth/LogoutButton', () => ({
    default: () => <button>Logout</button>
}));

describe('MobileProfileClient', () => {
    const mockProfile = {
        id: '123',
        nombre: 'Test',
        apellidos: 'User',
        telefono: '123456789',
        rol: 'student',
    };

    it('sets NEXT_LOCALE cookie with Secure flag when switching language', () => {
        const cookieSpy = vi.spyOn(document, 'cookie', 'set');

        render(<MobileProfileClient profile={mockProfile} email="test@example.com" locale="es" />);

        const enButton = screen.getByText('English').closest('button');
        expect(enButton).toBeTruthy();

        fireEvent.click(enButton!);

        expect(cookieSpy).toHaveBeenCalledWith(expect.stringContaining('NEXT_LOCALE=en'));
        expect(cookieSpy).toHaveBeenCalledWith(expect.stringContaining('Secure'));

        cookieSpy.mockRestore();
    });
});
