import { render } from '@testing-library/react';
import InteractiveGrid from '../InteractiveGrid';
import React from 'react';
import { GridStateProvider } from '@/context/GridStateContext';

describe('InteractiveGrid', () => {
  it('renders a canvas element', () => {
    const { container } = render(
      <GridStateProvider warps={[]} createWarp={() => {}} updateWarp={() => {}} deleteWarp={() => {}} isSaving={false}>
        <InteractiveGrid />
      </GridStateProvider>
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
}); 