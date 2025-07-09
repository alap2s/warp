'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { 
  X, Check, Clock, MapPin, LineSquiggle, Coffee, MessageSquare, Code, Plane,
  Book, Mic, Film, Music, ShoppingCart, Utensils, Beer, Dumbbell, Sun, Moon,
  Wine, Sofa, Tv2, Home, PartyPopper, Palette, CakeSlice, CupSoda, Trophy,
  Gamepad2, Bike, HeartPulse, Swords, Play, Sailboat, Ship, Dices
} from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  // Existing items
  'coffee': Coffee,
  'tea': Coffee,
  'chat': MessageSquare,
  'meeting': MessageSquare,
  'code': Code,
  'programming': Code,
  'fly': Plane,
  'flight': Plane,
  'read': Book,
  'book': Book,
  'podcast': Mic,
  'movie': Film,
  'music': Music,
  'shop': ShoppingCart,
  'buy': ShoppingCart,
  'eat': Utensils,
  'food': Utensils,
  'lunch': Utensils,
  'dinner': Utensils,
  'drink': Beer,
  'beer': Beer,
  'gym': Dumbbell,
  'workout': Dumbbell,
  'sun': Sun,
  'beach': Sun,
  'sleep': Moon,
  'nap': Moon,
  'wine': Wine,
  'drinking': Wine,
  'chilling': Sofa,
  'couching': Sofa,
  'tv': Tv2,
  'netflix': Tv2,
  'home': Home,
  'festival': PartyPopper,
  'event': PartyPopper,
  'art': Palette,
  'gallery': Palette,
  'museum': Palette,
  'cake': CakeSlice,
  'dessert': CakeSlice,
  'boba': CupSoda,
  'cold-drink': CupSoda,
  'sports': Trophy,
  'game': Gamepad2,
  'win': Trophy,
  'bike': Bike,
  'cycle': Bike,
  'run': HeartPulse,
  'cardio': HeartPulse,
  'fight': Swords,
  'play': Play,
  'boat': Sailboat,
  'sail': Sailboat,
  'ship': Ship,
  'dice': Dices,
  'boardgame': Dices,
};

const getIconForInput = (text: string): React.ElementType => {
  const words = text.toLowerCase().split(/[\s,.]+/); // split by space, comma, or period
  for (const word of words) {
    if (iconMap[word]) {
      return iconMap[word];
    }
    let singularForm = '';
    if (word.endsWith('ies')) {
      singularForm = word.slice(0, -3) + 'y';
    } else if (word.endsWith('es')) {
      singularForm = word.slice(0, -2);
    } else if (word.endsWith('s')) {
      singularForm = word.slice(0, -1);
    }
    if (singularForm && iconMap[singularForm]) {
      return iconMap[singularForm];
    }
  }
  return LineSquiggle;
};

const getInitialWhenDate = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 30) * 30;
  now.setMinutes(roundedMinutes);
  now.setSeconds(0);
  now.setMilliseconds(0);
  if (roundedMinutes === 60) {
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
  }
  return now;
};

const formatDateForSelect = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDayOption = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (formatDateForSelect(date) === formatDateForSelect(today)) return "Today";
    if (formatDateForSelect(date) === formatDateForSelect(tomorrow)) return "Tomorrow";
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

export const MakeWarpDialog = ({ onClose }: { onClose: () => void }) => {
  const whatInputRef = useRef<HTMLInputElement>(null);
  const [whatValue, setWhatValue] = useState('');
  const [whenValue, setWhenValue] = useState<Date>(getInitialWhenDate());
  const [whereValue, setWhereValue] = useState('');
  const [CurrentIcon, setCurrentIcon] = useState<React.ElementType>(() => LineSquiggle);

  useEffect(() => {
    whatInputRef.current?.focus();
    
    setWhereValue('Fetching location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setWhereValue(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        },
        () => {
          setWhereValue(''); // Clear on error
        }
      );
    } else {
      setWhereValue(''); // Clear if not supported
    }
  }, []);

  useEffect(() => {
    const NewIcon = getIconForInput(whatValue);
    setCurrentIcon(() => NewIcon);
  }, [whatValue]);

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, month, day] = e.target.value.split('-').map(Number);
    const newDate = new Date(whenValue);
    newDate.setFullYear(year, month - 1, day);
    setWhenValue(newDate);
  };

  const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
    const numericValue = parseInt(value, 10);
    const newDate = new Date(whenValue);
    if (type === 'hours') {
      newDate.setHours(numericValue);
    } else {
      newDate.setMinutes(numericValue);
    }
    setWhenValue(newDate);
  };

  const dayOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <motion.div 
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white rounded-2xl shadow-xl w-[350px] p-4 flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-start">
          <div className="font-black text-5xl leading-none text-[#1F1F1F]">
            <p>Make</p>
            <p>Warp</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" strokeWidth={2} />
            </Button>
            <Button variant="default" size="icon" onClick={onClose}>
              <Check className="h-4 w-4" strokeWidth={2} />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Input 
            ref={whatInputRef} 
            placeholder="What?" 
            className="pl-10"
            value={whatValue}
            onChange={(e) => setWhatValue(e.target.value)}
          />
          <CurrentIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${whatValue ? 'text-[#1F1F1F]' : 'text-gray-500'}`} strokeWidth={2} />
        </div>
        
        <div className="relative">
          <div className="flex items-center w-full h-12 rounded-lg border border-transparent bg-[#1F1F1F]/[.06] px-3 text-base font-medium">
            <Clock className="h-5 w-5 text-[#1F1F1F]" strokeWidth={2} />
            <div className="flex-grow flex items-center justify-between pl-2">
              <select 
                  value={formatDateForSelect(whenValue)}
                  onChange={handleDateChange}
                  className="bg-transparent focus:outline-none appearance-none"
              >
                  {dayOptions.map(date => (
                      <option key={formatDateForSelect(date)} value={formatDateForSelect(date)}>
                          {formatDayOption(date)}
                      </option>
                  ))}
              </select>
              <div className="flex items-center">
                <select 
                    value={whenValue.getHours().toString()}
                    onChange={(e) => handleTimeChange('hours', e.target.value)}
                    className="bg-transparent focus:outline-none appearance-none"
                >
                    {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                        <option key={hour} value={hour.toString()}>{hour.toString().padStart(2, '0')}</option>
                    ))}
                </select>
                <span className="mx-1">:</span>
                <select
                    value={whenValue.getMinutes().toString()}
                    onChange={(e) => handleTimeChange('minutes', e.target.value)}
                    className="bg-transparent focus:outline-none appearance-none"
                >
                    <option value="0">00</option>
                    <option value="30">30</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <Input 
            placeholder="Where?" 
            value={whereValue}
            onChange={(e) => setWhereValue(e.target.value)}
            className="pl-10" 
          />
          <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${whereValue && whereValue !== 'Fetching location...' ? 'text-[#1F1F1F]' : 'text-gray-500'}`} strokeWidth={2} />
        </div>
      </motion.div>
    </motion.div>
  );
}; 