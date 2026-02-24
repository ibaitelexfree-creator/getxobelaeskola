import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import InfoOverlay from './InfoOverlay';
import BoatModel from './BoatModel';

// Mock ResizeObserver for R3F if needed
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock R3F and Drei to prevent import side-effect errors in JSDOM
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useThree: () => ({ camera: { position: [0, 0, 0] }, gl: { domElement: document.createElement('canvas') }, events: {} }),
  useFrame: () => {},
  useLoader: () => ({}),
  extend: () => {},
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  useGLTF: () => ({ nodes: {}, materials: {} }),
  Environment: () => null,
  Float: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: () => null,
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
    expect(getByText('Pregunta de Repaso')).toBeDefined();
  });

  it('BoatModel is a valid component', () => {
    expect(typeof BoatModel).toBe('function');
  });
});
