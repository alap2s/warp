'use client';

import React, { forwardRef, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Globe, Users, Settings } from 'lucide-react';

interface IconProps {
  size?: number;
}

const iconMap: { [key: string]: React.ComponentType<IconProps> } = {
  World: Globe,
  Friends: Users,
  Settings: Settings,
};

interface NavOption {
  label: string;
  icon: React.ComponentType<IconProps>;
}

interface NavBarProps {
  options: { label: string }[];
  onSelect: (option: string) => void;
  value: string;
}

const NavBar = forwardRef<HTMLDivElement, NavBarProps>(({ options, onSelect, value }, ref) => {
  const isInitialRender = useRef(true);

  useEffect(() => {
    isInitialRender.current = false;
  }, []);

  const navOptions: NavOption[] = options.map(option => ({
    ...option,
    icon: iconMap[option.label],
  }));

  return (
    <motion.div
      ref={ref}
      layout
      transition={isInitialRender.current ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 35 }}
      className="absolute bottom-[40px] left-1/2 -translate-x-1/2 z-50 flex items-center justify-center p-1 bg-[#1f1f1f] rounded-xl border-2 border-white"
    >
      {navOptions.map(({ label, icon: Icon }) => {
        const isSelected = value === label;
        return (
          <button
            key={label}
            onClick={() => onSelect(label)}
            className="relative px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 focus:outline-none"
          >
            {isSelected && (
              <motion.div
                layoutId="navbar-highlight"
                className="absolute inset-0 bg-white rounded-lg"
                transition={isInitialRender.current ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 35 }}
              />
            )}
            <div className={`relative flex items-center gap-2 transition-colors duration-150 ${isSelected ? 'text-black' : 'text-white'}`}>
              <Icon size={20} />
              {isSelected && <span>{label}</span>}
            </div>
          </button>
        );
      })}
    </motion.div>
  );
});

NavBar.displayName = 'NavBar';

export default NavBar; 