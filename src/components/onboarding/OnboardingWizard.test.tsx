import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OnboardingWizard from './OnboardingWizard';

// Mock useRouter
const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('OnboardingWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
  });

  it('renders welcome step initially', () => {
    render(<OnboardingWizard />);
    expect(screen.getByText(/¡Bienvenido a Getxo Bela Eskola!/i)).toBeInTheDocument();
  });

  it('navigates through steps and submits data', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<OnboardingWizard />);

    // Step 1: Welcome -> Start
    fireEvent.click(screen.getByText('Comenzar'));

    // Step 2: Q1 -> Select option (e.g., Expert - value 3)
    expect(screen.getByText('1. ¿Cuál es tu experiencia navegando?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Soy un experto'));

    // Step 3: Q2 -> Select option (e.g., Advanced - value 3)
    expect(screen.getByText('2. ¿Qué conocimientos técnicos tienes?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Entiendo de trimado y meteorología avanzada'));

    // Step 4: Q3 -> Select option (e.g., Captain - value 3)
    expect(screen.getByText('3. ¿Tienes alguna titulación náutica?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Patrón de Yate o superior'));

    // Step 5: Result
    expect(screen.getByText('¡Evaluación Completada!')).toBeInTheDocument();
    expect(screen.getByText('Avanzado')).toBeInTheDocument(); // 3+3+3 = 9 >= 6 -> Avanzado

    // Finish -> Submit
    fireEvent.click(screen.getByText('Finalizar y Guardar Perfil'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/perfiles', expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          xp: 50,
          nivel_inicial: 'Avanzado',
          onboarding_completed: true,
        }),
      }));
    });

    expect(pushMock).toHaveBeenCalledWith('/dashboard');
    expect(refreshMock).toHaveBeenCalled();
  });
});
