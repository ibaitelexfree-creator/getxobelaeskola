import React from 'react';
import { render, screen } from '@testing-library/react';
import StaffClient from './StaffClient';
import { vi, describe, it, expect } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        order: () => ({ data: [], error: null }),
      }),
    }),
  }),
}));

// Mock dynamic components to avoid loading complex children
vi.mock('next/dynamic', () => ({
  default: () => {
    const Component = () => <div>Dynamic Component</div>;
    Component.displayName = 'DynamicComponent';
    return Component;
  },
}));

// Mock AccessibleModal since it might use portals or other DOM features
vi.mock('../../shared/AccessibleModal', () => ({
  default: ({ children, isOpen }: { children: React.ReactNode, isOpen: boolean }) => isOpen ? <div>{children}</div> : null,
}));

describe('StaffClient', () => {
  it('renders navigation tabs', () => {
    const mockProfile = {
      id: '1',
      nombre: 'Test',
      apellidos: 'User',
      email: 'test@example.com',
      rol: 'admin',
    };

    render(
      <StaffClient
        userProfile={mockProfile}
        initialRentals={[]}
        locale="es"
      />
    );

    // Check for some tab labels (keys from useTranslations mock)
    expect(screen.getByText('tabs.overview')).toBeDefined();
    expect(screen.getByText('tabs.rentals')).toBeDefined();
    expect(screen.getByText('INGRESOS')).toBeDefined();
  });
});
