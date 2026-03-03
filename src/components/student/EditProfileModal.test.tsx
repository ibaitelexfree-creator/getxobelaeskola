import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditProfileModal from './EditProfileModal';
import { Profile } from '@/types/student';
import React from 'react';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key
}));

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: mockRefresh
    })
}));

// Mock @/lib/api
vi.mock('@/lib/api', () => ({
    apiUrl: (path: string) => path
}));

// Mock react-dom createPortal
vi.mock('react-dom', async () => {
    const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
    return {
        ...actual,
        createPortal: (node: React.ReactNode) => node,
    };
});

describe('EditProfileModal', () => {
    const mockProfile: Profile = {
        id: '123',
        nombre: 'John',
        apellidos: 'Doe',
        telefono: '123456789'
    };

    const mockOnClose = vi.fn();
    const mockOnProfileUpdate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        global.alert = vi.fn();
    });

    it('should render correctly when open', () => {
        render(
            <EditProfileModal
                isOpen={true}
                onClose={mockOnClose}
                profile={mockProfile}
                onProfileUpdate={mockOnProfileUpdate}
            />
        );

        expect(screen.getByText('title')).toBeDefined();
        expect(screen.getByDisplayValue('John')).toBeDefined();
        expect(screen.getByDisplayValue('Doe')).toBeDefined();
        expect(screen.getByDisplayValue('123456789')).toBeDefined();
    });

    it('should call onProfileUpdate and onClose on successful submit', async () => {
        const updatedProfile = { ...mockProfile, nombre: 'Jane' };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ profile: updatedProfile })
        });

        render(
            <EditProfileModal
                isOpen={true}
                onClose={mockOnClose}
                profile={mockProfile}
                onProfileUpdate={mockOnProfileUpdate}
            />
        );

        const nameInput = screen.getByDisplayValue('John');
        fireEvent.change(nameInput, { target: { value: 'Jane' } });

        const saveButton = screen.getByText('save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/student/update-profile', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    nombre: 'Jane',
                    apellidos: 'Doe',
                    telefono: '123456789'
                })
            }));
            expect(mockOnProfileUpdate).toHaveBeenCalledWith(updatedProfile);
            expect(mockRefresh).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    it('should show alert on API error response', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'API Error Message' })
        });

        render(
            <EditProfileModal
                isOpen={true}
                onClose={mockOnClose}
                profile={mockProfile}
                onProfileUpdate={mockOnProfileUpdate}
            />
        );

        const saveButton = screen.getByText('save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('API Error Message');
        });
    });

    it('should show fallback alert on API error response without message', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            json: async () => ({})
        });

        render(
            <EditProfileModal
                isOpen={true}
                onClose={mockOnClose}
                profile={mockProfile}
                onProfileUpdate={mockOnProfileUpdate}
            />
        );

        const saveButton = screen.getByText('save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('error_updating');
        });
    });

    it('should show alert on network exception', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network Failure'));

        render(
            <EditProfileModal
                isOpen={true}
                onClose={mockOnClose}
                profile={mockProfile}
                onProfileUpdate={mockOnProfileUpdate}
            />
        );

        const saveButton = screen.getByText('save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('connection_error: Network Failure');
        });
    });

    it('should close when clicking cancel', () => {
        render(
            <EditProfileModal
                isOpen={true}
                onClose={mockOnClose}
                profile={mockProfile}
                onProfileUpdate={mockOnProfileUpdate}
            />
        );

        const cancelButton = screen.getByText('cancel');
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close when clicking the close (X) button', () => {
        render(
            <EditProfileModal
                isOpen={true}
                onClose={mockOnClose}
                profile={mockProfile}
                onProfileUpdate={mockOnProfileUpdate}
            />
        );

        const closeButton = screen.getByText('✕');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });
});
