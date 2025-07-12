'use client';

import React, { useMemo } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { createAvatar } from '@dicebear/core';
import { thumbs } from '@dicebear/collection';
import type { Splide as SplideCore } from '@splidejs/splide';

// It's important to import the Splide CSS
import '@splidejs/react-splide/css';

interface HorizontalPickerProps {
  onIconSelect: (seed: string) => void;
}

const generateSeeds = (count: number) => {
  return Array.from({ length: count }, () => Math.random().toString(36).substring(7));
};

const HorizontalPicker = ({ onIconSelect }: HorizontalPickerProps) => {
  // Memoize the seeds so they don't change on every render
  const avatarSeeds = useMemo(() => generateSeeds(20), []);

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
    <div className="w-full">
      <Splide
        options={splideOptions}
        onMoved={handleMoved}
        aria-label="Avatar Picker"
      >
        {avatarSeeds.map((seed) => (
          <SplideSlide key={seed} data-seed={seed}>
            <div
              className="flex items-center justify-center h-full splide__slide__container"
              dangerouslySetInnerHTML={{
                __html: createAvatar(thumbs, {
                  seed: seed,
                  scale: 80,
                  radius: 20,
                  backgroundColor: ['#00000000'], // Transparent
                  eyesColor: ['1F1F1F'],
                  mouthColor: ['1F1F1F'],
                  shapeColor: ['ffffff'],
                }).toString(),
              }}
            />
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
      `}</style>
    </div>
  );
};

export default HorizontalPicker; 