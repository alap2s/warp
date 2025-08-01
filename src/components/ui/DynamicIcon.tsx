'use client';

import React, { useState, useEffect } from 'react';
import { LucideProps, Loader2, LineSquiggle } from 'lucide-react';

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
        const lucideIcons = await import('lucide-react');
        const ImportedIcon = (lucideIcons as any)[iconName] as React.ComponentType<LucideProps>;

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