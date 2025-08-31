'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface DialogHeaderProps {
  title: string | string[];
  photoURL?: string;
  children?: React.ReactNode;
  className?: string;
}

const useAutoFitFontSize = (text: string | string[], ref: React.RefObject<HTMLDivElement>) => {
  useLayoutEffect(() => {
    const titleArray = Array.isArray(text) ? text : [text];
    if (!ref.current || titleArray.length === 0) return;

    const container = ref.current;
    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) return;

    const containerWidth = container.offsetWidth;

    // Create a temporary element for measurement
    const tempElement = document.createElement('span');
    const computedStyle = window.getComputedStyle(children[0]);
    
    tempElement.style.fontFamily = computedStyle.fontFamily;
    tempElement.style.fontWeight = computedStyle.fontWeight;
    tempElement.style.letterSpacing = computedStyle.letterSpacing;
    tempElement.style.fontSize = '60px'; // max font size
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.style.whiteSpace = 'nowrap'; // prevent wrapping during measurement
    document.body.appendChild(tempElement);
    
    let minFontSize = 60;

    titleArray.forEach(word => {
      tempElement.textContent = word;
      const textWidth = tempElement.scrollWidth;
      
      if (textWidth > containerWidth) {
        const newSize = (containerWidth / textWidth) * 60;
        minFontSize = Math.min(minFontSize, newSize);
      }
    });

    document.body.removeChild(tempElement);

    const finalFontSize = Math.max(12, minFontSize);

    children.forEach(child => {
      child.style.fontSize = `${finalFontSize}px`;
    });

  }, [text, ref]);
};

const DialogHeader = ({ title, photoURL, children, className }: DialogHeaderProps) => {
  const titleArray = Array.isArray(title) ? title : [title];
  const titleRef = useRef<HTMLDivElement>(null);

  useAutoFitFontSize(titleArray, titleRef as React.RefObject<HTMLDivElement>);

  return (
    <div className={cn("flex justify-between gap-2", titleArray.length > 1 ? "items-start" : "items-center", className)}>
      <div className="flex items-center gap-4 flex-grow" style={{ minWidth: 0 }}>
        {photoURL && (
          <Image
            src={photoURL}
            alt="Profile Photo"
            width={48}
            height={48}
            className="rounded-xl object-cover"
          />
        )}
        <div ref={titleRef} className="flex-grow" style={{ minWidth: 0 }}>
          {titleArray.map((word, index) => (
            <h2
              key={index}
              className="dialog-title"
            >
              {word}
            </h2>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        {React.Children.map(children, (child, index) =>
          React.isValidElement(child) ? React.cloneElement(child, { key: index } as React.Attributes) : child
        )}
      </div>
    </div>
  );
};

export default DialogHeader; 