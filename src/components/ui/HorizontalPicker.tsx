'use client';

import React, { useMemo } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import Image from 'next/image';
import type { Splide as SplideCore } from '@splidejs/splide';

// It's important to import the Splide CSS
import '@splidejs/react-splide/css';

interface HorizontalPickerProps {
  onIconSelect: (seed: string) => void;
  defaultValue?: string;
}

const HorizontalPicker = ({ onIconSelect, defaultValue }: HorizontalPickerProps) => {
  const avatarSeeds = useMemo(() => [
    'Thumbs01.svg',
    'Thumbs02.svg',
    'Thumbs03.svg',
    'Thumbs04.svg',
    'Thumbs05.svg'
  ], []);

  const initialIndex = defaultValue ? avatarSeeds.indexOf(defaultValue) : 0;

  const splideOptions = {
    type: 'loop',
    perPage: 3,
    focus: 'center',
    arrows: false,
    pagination: false,
    gap: '1rem',
    drag: 'free',
    snap: true,
    height: '120px',
    start: initialIndex,
  };

  const handleMoved = (splide: SplideCore) => {
    const activeSlide = splide.Components.Slides.getAt(splide.index);
    if (activeSlide && activeSlide.slide) {
      const seed = activeSlide.slide.getAttribute('data-seed');
      if (seed) {
        onIconSelect(seed);
      }
    }
  };

  return (
    <div style={{ overflow: 'hidden' }}>
      <Splide
        options={splideOptions}
        onMoved={handleMoved}
        onMounted={(splide: SplideCore) => splide.refresh()}
        aria-label="Avatar Picker"
      >
        {avatarSeeds.map((seed) => (
          <SplideSlide key={seed} data-seed={seed}>
            <div
              className="flex items-center justify-center h-full splide__slide__container"
            >
              <Image
                src={`/Thumbs/${seed}`}
                alt="Avatar"
                width={80}
                height={80}
                className="avatar-image"
                style={{ height: 'auto' }}
              />
            </div>
          </SplideSlide>
        ))}
      </Splide>
      <style jsx global>{`
        .splide__slide {
          opacity: 0.5;
          transform: scale(0.8);
          transition: opacity 0.3s, transform 0.3s;
        }
        .splide__slide.is-active {
          opacity: 1;
          transform: scale(1);
        }
        .splide__slide.is-active .avatar-image {
          filter: drop-shadow(0px 0px 0.5px white) drop-shadow(0px 0px 0.5px white) drop-shadow(0px 0px 0.5px white);
        }
        .splide__slide__container {
          background-color: transparent;
        }
        .splide__track {
        }
      `}</style>
    </div>
  );
};

export default HorizontalPicker; 