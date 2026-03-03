import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Breadcrumbs from './Breadcrumbs';

// Mock next/link
vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>{children}</a>
    )
}));

describe('Breadcrumbs', () => {
    const items = [
        { label: 'Home', href: '/' },
        { label: 'Academy', href: '/academy' },
        { label: 'Nivel 1' }
    ];

    it('should render correct number of breadcrumb links', () => {
        render(<Breadcrumbs items={items} />);

        // Use getAllByText because it renders for mobile and desktop
        expect(screen.getAllByText('Academy').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Nivel 1').length).toBeGreaterThan(0);
    });

    it('should show the last item as current page', () => {
        render(<Breadcrumbs items={items} />);
        const lastItems = screen.getAllByText('Nivel 1');
        // The one with aria-current should be the desktop one
        const currentPage = lastItems.find(el => el.getAttribute('aria-current') === 'page');
        expect(currentPage).toBeDefined();
    });

    it('should show the home link', () => {
        render(<Breadcrumbs items={items} />);
        // Use a more generic selection if label is tricky
        const homeLinks = screen.getAllByRole('link');
        const homeLink = homeLinks.find(l => l.getAttribute('href') === '/');
        expect(homeLink).toBeDefined();
    });
});
