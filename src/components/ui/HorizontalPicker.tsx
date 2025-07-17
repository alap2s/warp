'use client';

import React, { useMemo } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import Image from 'next/image';
import type { Splide as SplideCore } from '@splidejs/splide';

// It's important to import the Splide CSS
import '@splidejs/react-splide/css';

interface HorizontalPickerProps {
  onIconSelect: (seed: string) => void;
}

const HorizontalPicker = ({ onIconSelect }: HorizontalPickerProps) => {
  const avatarSeeds = useMemo(() => [
    'Thumb01.svg',
    'Thumb02.svg',
    'Thumb03.svg',
    'Thumb04.svg',
    'Thumb05.svg'
  ], []);

  const splideOptions = {
    type: 'loop',
    perPage: 3,
    focus: 'center',
    arrows: false,
    pagination: false,
    gap: '1rem',
    drag: 'free',
    snap: true,
    height: '100px',
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
    <div className="w-[272px]">
      <Splide
        options={splideOptions}
        onMoved={handleMoved}
        aria-label="Avatar Picker"
      >
        {avatarSeeds.map((seed) => (
          <SplideSlide key={seed} data-seed={seed}>
            <div
              className="flex items-center justify-center h-full splide__slide__container"
            >
              <div className="border-2 border-transparent rounded-[36px] p-1">
                <Image
                  src={`/thumbs/${seed}`}
                  alt="Avatar"
                  width={80}
                  height={80}
                />
              </div>
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
        .splide__slide.is-active .border-transparent {
          border-color: white;
        }
      `}</style>
    </div>
  );
};

export default HorizontalPicker; 