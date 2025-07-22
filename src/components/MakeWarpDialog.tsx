'use client';

import React, { useRef, useEffect, useState } from 'react';
import { IconButton } from './ui/IconButton';
import { Input } from './ui/Input';
import {
  X, Check, Clock, MapPin, LineSquiggle, Coffee, MessageSquare, Code, Plane,
  Book, Mic, Film, Music, ShoppingCart, Utensils, Beer, Dumbbell, Sun, Moon,
  Wine, Sofa, Tv2, Home, PartyPopper, Palette, CakeSlice, CupSoda, Trophy,
  Gamepad2, Bike, HeartPulse, Swords, Play, Sailboat, Ship, Dices, Trash2, Share, Tag, Link2
} from 'lucide-react';
import Dialog from './ui/Dialog';
import DialogHeader from './ui/DialogHeader';

interface IconProps {
  className?: string;
  strokeWidth?: number;
  size?: number;
}

export const iconMap: { [key: string]: React.ComponentType<IconProps> } = {
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
  'person': Tag,
  'place': Tag,
  'thing': Tag,
  'link': Link2,
};

export const getIcon = (text: string): React.ComponentType<IconProps> => {
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

export type FormData = {
  what: string;
  when: Date;
  where: string;
  icon: string;
};

export const MakeWarpDialog = ({
  onClose,
  onPost,
  onUpdate,
  initialData,
  onDelete,
  onSizeChange,
}: {
  onClose: () => void,
  onPost: (data: FormData) => void,
  onUpdate: (data: FormData) => void,
  initialData?: {
    what: string;
    when: Date;
    where: string;
    icon: string;
  } | null,
  onDelete?: () => void,
  onSizeChange?: (size: { width: number, height: number }) => void,
}) => {
  const whatInputRef = useRef<HTMLInputElement>(null);
  const [whatValue, setWhatValue] = useState<string>(initialData?.what || '');
  const [whenValue, setWhenValue] = useState<Date>(initialData?.when ? new Date(initialData.when) : getInitialWhenDate());
  const [whereValue, setWhereValue] = useState<string>(initialData?.where || '');
  const [currentIconName, setCurrentIconName] = useState<string>(initialData?.icon || 'LineSquiggle');

  useEffect(() => {
    if (!initialData) {
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
    }
  }, [initialData]);

  useEffect(() => {
    const iconComponent = getIcon(whatValue);
    const iconName = Object.keys(iconMap).find(key => iconMap[key] === iconComponent) || 'LineSquiggle';
    setCurrentIconName(iconName);
  }, [whatValue]);

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, month, day] = e.target.value.split('-');
    const newDate = new Date(whenValue);
    newDate.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
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

  const handlePost = () => {
    const data = {
      what: whatValue,
      when: whenValue,
      where: whereValue,
      icon: currentIconName,
    };
    if (initialData) {
      onUpdate(data);
    } else {
      onPost(data);
    }
  };

  const dayOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const CurrentIcon = iconMap[currentIconName] || LineSquiggle;

  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange}>
      <DialogHeader title={initialData ? ['Edit'] : ['Make', 'Warp']}>
        {onDelete && (
          <IconButton variant="outline" onClick={onDelete}>
            <Trash2 size={16} strokeWidth={2.25} />
          </IconButton>
        )}
        {initialData ? (
          <IconButton variant="outline" onClick={() => console.log('Share clicked')}>
            <Share size={16} strokeWidth={2.25} />
          </IconButton>
        ) : (
          <IconButton variant="outline" onClick={onClose}>
            <X size={16} strokeWidth={2.25} />
          </IconButton>
        )}
        <IconButton variant="default" onClick={handlePost}>
          <Check size={16} strokeWidth={2.25} />
        </IconButton>
      </DialogHeader>

        <div className="relative">
          <Input
            ref={whatInputRef}
            placeholder="What?"
            className="pl-10"
            value={whatValue}
            onChange={(e) => setWhatValue(e.target.value)}
          />
          <CurrentIcon className={`absolute left-3 top-1/2 -translate-y-1/2 ${whatValue ? 'text-white' : 'text-gray-400'}`} size={16} strokeWidth={2.25} />
        </div>

        <div className="relative">
          <div className="flex items-center w-full h-12 rounded-lg border border-transparent bg-[#2D2D2D] px-3 text-base font-medium text-white">
            <Clock className="text-white" size={16} strokeWidth={2.25} />
            <div className="flex-grow flex items-center justify-between pl-2">
              <select
                  value={formatDateForSelect(whenValue)}
                  onChange={handleDateChange}
                  className="bg-transparent focus:outline-none appearance-none"
              >
                  {dayOptions.map(date => (
                      <option key={formatDateForSelect(date)} value={formatDateForSelect(date)} className="bg-black text-white">
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
                        <option key={hour} value={hour.toString()} className="bg-black text-white">{hour.toString().padStart(2, '0')}</option>
                    ))}
                </select>
                <span className="mx-1">:</span>
                <select
                    value={whenValue.getMinutes()}
                    onChange={(e) => handleTimeChange('minutes', e.target.value)}
                    className="bg-transparent focus:outline-none appearance-none"
                >
                    <option value={0} className="bg-black text-white">00</option>
                    <option value={30} className="bg-black text-white">30</option>
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
          <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 ${whereValue && whereValue !== 'Fetching location...' ? 'text-white' : 'text-gray-400'}`} size={16} strokeWidth={2.25} />
        </div>
    </Dialog>
  );
};