'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { LucideProps, Loader2, LineSquiggle } from 'lucide-react';
import { keywordToIconName } from '@/lib/icon-map'; // Assuming this is where your map is

interface DynamicIconProps extends LucideProps {
  name: string;
}

const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  const [Icon, setIcon] = useState<React.ComponentType<LucideProps> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadIcon = async () => {
      setIsLoading(true);
      try {
        const iconName = name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
        const { [iconName]: ImportedIcon } = await import('lucide-react');

        if (ImportedIcon) {
          setIcon(() => ImportedIcon);
        } else {
          setIcon(() => LineSquiggle); // Fallback icon
        }
      } catch (error) {
        console.error(`Error loading icon: ${name}`, error);
        setIcon(() => LineSquiggle); // Fallback on error
      } finally {
        setIsLoading(false);
      }
    };

    loadIcon();
  }, [name]);

  if (isLoading) {
    return <Loader2 className="animate-spin" {...props} />;
  }

  if (Icon) {
    return <Icon {...props} />;
  }

  return <LineSquiggle {...props} />;
};

export default DynamicIcon; 