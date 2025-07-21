import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateConcentricRingPositions = (
  count: number,
  screenWidth: number,
  screenHeight: number,
  tileWidth: number,
  tileHeight: number
) => {
  if (count === 0) return [];

  const center = { x: screenWidth / 2, y: screenHeight / 2 };
  const positions: { x: number; y: number }[] = [];
  
  // Base radius for the first ring
  let radius = Math.min(screenWidth, screenHeight) * 0.2;
  const radiusIncrement = Math.min(screenWidth, screenHeight) * 0.12;
  const padding = 1.2; // Multiplier for spacing between tiles

  let placedCount = 0;
  let ringIndex = 0;

  while (placedCount < count) {
    const circumference = 2 * Math.PI * radius;
    const itemsInRing = Math.floor(circumference / (tileWidth * padding));
    
    if (itemsInRing === 0) {
      // If the ring is too small to fit any items, we just move to the next one.
      // This is a fallback and shouldn't happen with the current logic.
      radius += radiusIncrement;
      ringIndex++;
      continue;
    }

    const angleStep = (2 * Math.PI) / itemsInRing;

    for (let i = 0; i < itemsInRing && placedCount < count; i++) {
      const angle = i * angleStep + (ringIndex % 2 === 0 ? 0 : angleStep / 2); // Offset every other ring
      const x = center.x + radius * Math.cos(angle) - tileWidth / 2;
      const y = center.y + radius * Math.sin(angle) - tileHeight / 2;
      
      positions.push({ x, y });
      placedCount++;
    }

    radius += radiusIncrement;
    ringIndex++;
  }

  return positions;
}; 