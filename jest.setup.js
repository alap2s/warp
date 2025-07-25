// jest.setup.js
import 'whatwg-fetch';
import '@testing-library/jest-dom';

global.setImmediate = (callback) => {
  callback();
};

// Mock for ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

// Mock for HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = () => {
  return {
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn((x, y, w, h) => ({
      data: new Uint8ClampedArray(w * h * 4)
    })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => ({
      data: new Uint8ClampedArray(0)
    })),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  };
}; 

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' },
    profile: { username: 'test-user', icon: 'test-icon' },
    loading: false,
    refreshProfile: jest.fn(),
  }),
}));

jest.mock('@splidejs/react-splide', () => ({
  Splide: ({ children }) => <div>{children}</div>,
  SplideSlide: ({ children }) => <div>{children}</div>,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} />;
  },
})); 