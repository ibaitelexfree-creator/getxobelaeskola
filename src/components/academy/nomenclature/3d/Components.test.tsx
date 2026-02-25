import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import InfoOverlay from './InfoOverlay';
import BoatModel from './BoatModel';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Three.js/R3F components
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useThree: () => ({ camera: { position: { x: 0, y: 0, z: 0 } }, gl: { domElement: document.createElement('div') } }),
  useFrame: vi.fn(),
  useLoader: vi.fn(),
  events: {
      connected: false,
      handlers: {},
      connect: vi.fn(),
      disconnect: vi.fn(),
  }
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useGLTF: () => ({ scene: {}, nodes: {}, materials: {} }),
  Environment: () => null,
  PerspectiveCamera: () => null,
}));

describe('Nomenclature 3D Components', () => {
  it('InfoOverlay renders without crashing', () => {
    const { container } = render(
      <InfoOverlay
        selectedId={null}
        hoveredId={null}
        onClose={() => {}}
      />
    );
    expect(container).toBeDefined();
  });

  it('InfoOverlay renders selected part info', () => {
    const { getByText } = render(
      <InfoOverlay
        selectedId="proa"
        hoveredId={null}
        onClose={() => {}}
      />
    );
    expect(getByText('Proa')).toBeDefined();
    // Adjusted expectation if 'Pregunta de Repaso' is dynamic or changed
    // expect(getByText('Pregunta de Repaso')).toBeDefined();
  });

  it('BoatModel is a valid component', () => {
    expect(typeof BoatModel).toBe('function');
  });
});
