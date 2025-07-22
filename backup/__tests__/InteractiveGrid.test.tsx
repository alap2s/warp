import { render } from '@testing-library/react';
import InteractiveGrid from '../InteractiveGrid';
import React from 'react';

describe('InteractiveGrid', () => {
  it('renders a canvas element', () => {
    const { container } = render(<InteractiveGrid />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
}); 