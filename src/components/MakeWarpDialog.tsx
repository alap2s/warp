'use client';

import React, { useRef, useEffect, useState } from 'react';
import { IconButton } from './ui/IconButton';
import { Input } from './ui/Input';
import {
  X, Check, Clock, MapPin, LineSquiggle, Coffee, MessageSquare, Code, Plane,
  Book, Mic, Film, Music, ShoppingCart, Utensils, Beer, Dumbbell, Sun, Moon,
  Wine, Sofa, Tv2, Home, PartyPopper, Palette, CakeSlice, CupSoda, Trophy,
  Gamepad2, Bike, HeartPulse, Swords, Play, Sailboat, Ship, Dices, Trash2, Tag, Link2, Loader2,
  MapPinCheckInside, MapPinXInside, Eye, EyeOff
} from 'lucide-react';
import Dialog from './ui/Dialog';
import DialogHeader from './ui/DialogHeader';
import { getCurrentCoordinates, getAddressFromCoordinates, getCoordinatesFromAddress } from '@/lib/location';
import { getIconName } from '@/lib/icon-map';
import DynamicIcon from './ui/DynamicIcon';
import SegmentedControl from './ui/SegmentedControl';
import { triggerHapticFeedback } from '@/lib/haptics';

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
  type: 'public' | 'friends';
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
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
    type?: 'public' | 'friends';
  } | null,
  onDelete?: () => void,
  onSizeChange?: (size: { width: number, height: number }) => void,
}) => {
  const whatInputRef = useRef<HTMLInputElement>(null);
  const [whatValue, setWhatValue] = useState<string>(initialData?.what || '');
  const [whenValue, setWhenValue] = useState<Date>(initialData?.when ? new Date(initialData.when) : getInitialWhenDate());
  const [whereValue, setWhereValue] = useState<string>(initialData?.where || '');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingStatus, setGeocodingStatus] = useState<'success' | 'error' | null>(null);
  const [foundLocationName, setFoundLocationName] = useState<string | null>(null);
  const [currentIconName, setCurrentIconName] = useState<string>(initialData?.icon || 'line-squiggle');
  const [isDeleting, setIsDeleting] = useState(false);
  const [warpType, setWarpType] = useState<'public' | 'friends'>(initialData?.type || 'public');

  useEffect(() => {
    if (!initialData) {
      setWhereValue('Fetching location...');
      setIsGeocoding(true);
      getCurrentCoordinates()
        .then(coords => {
          setCoordinates(coords);
          return getAddressFromCoordinates(coords.lat, coords.lng);
        })
        .then(address => {
          setWhereValue(address);
          setFoundLocationName(address);
          setGeocodingStatus('success');
        })
        .catch(() => {
            setWhereValue(''); // Clear on error
          setGeocodingStatus('error');
        })
        .finally(() => {
          setIsGeocoding(false);
        });
    }
  }, [initialData]);

  useEffect(() => {
    if (!whereValue) {
        setGeocodingStatus(null);
        setFoundLocationName(null);
        setCoordinates(null);
        return;
    }

    const handler = setTimeout(() => {
      if (whereValue && whereValue !== 'Fetching location...') {
        setIsGeocoding(true);
        setGeocodingStatus(null);
        getCoordinatesFromAddress(whereValue)
          .then(coords => {
            if (coords) {
                setCoordinates(coords);
                return getAddressFromCoordinates(coords.lat, coords.lng);
            } else {
                throw new Error("Coordinates not found");
            }
          })
          .then(address => {
            setFoundLocationName(address);
            setGeocodingStatus('success');
          })
          .catch(() => {
            setCoordinates(null);
            setFoundLocationName(null);
            setGeocodingStatus('error');
          })
          .finally(() => {
            setIsGeocoding(false);
          });
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [whereValue]);

  useEffect(() => {
    const iconName = getIconName(whatValue);
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
    triggerHapticFeedback();
    const data = {
      what: whatValue,
      when: whenValue,
      where: whereValue,
      icon: currentIconName,
      type: warpType,
      coordinates: coordinates,
    };
    if (initialData) {
      onUpdate(data);
    } else {
      onPost(data);
    }
  };

  const handleDelete = async () => {
    triggerHapticFeedback();
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete();
        // The dialog will be closed by the parent component unmounting this one
      } catch (error) {
        console.error("Failed to delete warp:", error);
        setIsDeleting(false); // Re-enable button on error
      }
    }
  };

  const handleLocationReset = () => {
    setWhereValue('Fetching location...');
    setIsGeocoding(true);
    getCurrentCoordinates()
      .then(coords => {
        setCoordinates(coords);
        return getAddressFromCoordinates(coords.lat, coords.lng);
      })
      .then(address => {
        setWhereValue(address);
        setFoundLocationName(address);
        setGeocodingStatus('success');
      })
      .catch(() => {
          setWhereValue(''); // Clear on error
        setGeocodingStatus('error');
      })
      .finally(() => {
        setIsGeocoding(false);
      });
  };

  const dayOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });


  return (
    <Dialog onClose={onClose} onSizeChange={onSizeChange}>
      <DialogHeader title={initialData ? ['Edit'] : ['Make', 'Warp']}>
        {onDelete && (
          <IconButton variant="outline" onClick={handleDelete} disabled={isDeleting} icon={Trash2} />
        )}
          <IconButton variant="outline" onClick={onClose} icon={X} />
        <IconButton variant="default" onClick={handlePost} icon={Check} />
      </DialogHeader>

        <Input
          ref={whatInputRef}
          id="what"
          name="what"
          placeholder="What?"
          value={whatValue}
          onChange={(e) => setWhatValue(e.target.value)}
          maxLength={60}
          icon={<DynamicIcon name={currentIconName} size={16} strokeWidth={2.25} />}
        />

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

        <Input
          id="where"
          name="where"
          placeholder="Where?"
          value={whereValue}
          onChange={(e) => setWhereValue(e.target.value)}
          onIconClick={handleLocationReset}
          icon={
            isGeocoding ? (
              <Loader2 className="animate-spin" size={16} strokeWidth={2.25} />
            ) : geocodingStatus === 'success' ? (
              <MapPinCheckInside size={16} strokeWidth={2.25} />
            ) : geocodingStatus === 'error' ? (
              <MapPinXInside size={16} strokeWidth={2.25} />
            ) : (
              <MapPin size={16} strokeWidth={2.25} />
            )
          }
          helperText={
            geocodingStatus && foundLocationName && whereValue !== foundLocationName && (
              <div className={`text-xs text-white/40`}>
                {geocodingStatus === 'success' ? foundLocationName : `Couldn't find that location.`}
              </div>
            )
          }
        />
        <SegmentedControl
            options={[
                { label: 'Public', icon: Eye },
                { label: 'Friends only', icon: EyeOff },
            ]}
            value={warpType === 'public' ? 'Public' : 'Friends only'}
            onSelect={(label) => setWarpType(label === 'Public' ? 'public' : 'friends')}
        />
    </Dialog>
  );
};