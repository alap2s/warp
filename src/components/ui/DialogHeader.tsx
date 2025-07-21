'use client';

import React, { useRef, useLayoutEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface DialogHeaderProps {
  title: string[];
  children?: React.ReactNode;
  className?: string;
}

const DialogHeader = ({ title, children, className }: DialogHeaderProps) => {
  const titleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(60);

  useLayoutEffect(() => {
    const calculateFontSize = () => {
      if (titleRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const childrenWidth = Array.from(containerRef.current.children)
          .slice(1)
          .reduce((acc, child) => acc + (child as HTMLElement).offsetWidth, 0);
        
        const availableWidth = containerWidth - childrenWidth - 24;
        const longestWord = title.reduce((a, b) => a.length > b.length ? a : b, '');
        
        let newFontSize = 10;
        const testEl = document.createElement('span');
        testEl.style.fontFamily = 'system-ui, sans-serif';
        testEl.style.fontWeight = '400';
        testEl.style.position = 'absolute';
        testEl.style.visibility = 'hidden';
        testEl.style.whiteSpace = 'nowrap';
        document.body.appendChild(testEl);

        for (let i = 10; i <= 60; i++) {
          testEl.style.fontSize = `${i}px`;
          testEl.innerText = longestWord;
          if (testEl.offsetWidth < availableWidth) {
            newFontSize = i;
          } else {
            break;
          }
        }
        
        document.body.removeChild(testEl);
        setFontSize(newFontSize);
      }
    };

    calculateFontSize();

    const resizeObserver = new ResizeObserver(calculateFontSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    const currentContainerRef = containerRef.current;
    return () => {
      if (currentContainerRef) {
        resizeObserver.unobserve(currentContainerRef);
      }
    };
  }, [title]);

  return (
    <div ref={containerRef} className={cn("flex justify-between gap-3", className)}>
      <div ref={titleRef} className="flex-grow overflow-hidden">
        {title.map((word, index) => (
          <h2
            key={index}
            className="font-title font-normal text-white whitespace-nowrap"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1' }}
          >
            {word}
          </h2>
        ))}
      </div>
      <div className="flex-shrink-0 flex items-start gap-2">
        {children}
      </div>
    </div>
  );
};

export default DialogHeader; 