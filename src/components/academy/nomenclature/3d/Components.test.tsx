
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import InfoOverlay from './InfoOverlay';
// import BoatModel from './BoatModel';

// Mock ResizeObserver for R3F if needed, though we might not render Canvas here
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

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
  // });

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
  // });

  // BoatModel requires Canvas context, so we just check it is a function
  // it('BoatModel is a valid component', () => {
    // expect(typeof BoatModel).toBe('function');
  // });
// });
