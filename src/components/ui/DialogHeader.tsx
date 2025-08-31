'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import useAutoFitFontSize from '@/lib/hooks/useAutoFitFontSize';

interface DialogHeaderProps {
  title: string | string[];
  photoURL?: string;
  children?: React.ReactNode;
  className?: string;
  onProfileClick?: () => void;
}

const DialogHeader = ({ title, photoURL, children, className, onProfileClick }: DialogHeaderProps) => {
  const titleArray = Array.isArray(title) ? title : [title];
  const titleRef = useRef<HTMLDivElement>(null);

  useAutoFitFontSize(titleArray, titleRef as React.RefObject<HTMLDivElement>);

  return (
    <div className={cn("flex justify-between gap-2", titleArray.length > 1 ? "items-start" : "items-center", className)}>
      <div 
        className={cn("flex items-center gap-4 flex-grow", { 'cursor-pointer': !!onProfileClick })}
        style={{ minWidth: 0 }}
        onClick={onProfileClick}
      >
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