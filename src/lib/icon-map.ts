export const keywordToIconName: { [key: string]: string } = {
  // Food & Drink
  'eat': 'utensils-crossed',
  'food': 'utensils-crossed',
  'lunch': 'utensils-crossed',
  'dinner': 'utensils-crossed',
  'breakfast': 'coffee',
  'brunch': 'croissant',
  'snack': 'cookie',
  'cook': 'chef-hat',
  'cooking': 'chef-hat',
  'bake': 'cake-slice',
  'baking': 'cake-slice',
  'coffee': 'coffee',
  'tea': 'coffee',
  'drink': 'glass-water',
  'drinks': 'martini',
  'beer': 'beer',
  'pub': 'beer',
  'bar': 'martini',
  'wine': 'wine',
  'cocktail': 'martini',
  'party': 'party-popper',
  'celebrate': 'party-popper',
  'cake': 'cake-slice',
  'dessert': 'ice-cream-2',
  'boba': 'cup-soda',
  'pizza': 'pizza',
  'burger': 'hamburger',
  'sushi': 'sushi',

  // Sports & Fitness
  'gym': 'dumbbell',
  'workout': 'dumbbell',
  'lift': 'dumbbell',
  'run': 'footprints',
  'running': 'footprints',
  'cardio': 'heart-pulse',
  'walk': 'footprints',
  'walking': 'footprints',
  'hike': 'mountain',
  'hiking': 'mountain',
  'bike': 'bike',
  'cycle': 'bike',
  'cycling': 'bike',
  'swim': 'waves',
  'swimming': 'waves',
  'surf': 'waves',
  'surfing': 'waves',
  'ski': 'snowflake',
  'skiing': 'snowflake',
  'snowboard': 'mountain-snow',
  'snowboarding': 'mountain-snow',
  'sports': 'trophy',
  'game': 'gamepad-2',
  'gaming': 'gamepad-2',
  'play': 'play-circle',
  'win': 'trophy',
  'yoga': 'heart-handshake',
  'meditate': 'brain-circuit',
  'meditation': 'brain-circuit',
  'football': 'football',
  'soccer': 'football',
  'basketball': 'basketball',
  'baseball': 'baseball',
  'golf': 'golf',
  'volleyball': 'volleyball',
  'tennis': 'racket',
  'hockey': 'hockey',
  'american-football': 'american-football',
  
  // Travel & Transport
  'fly': 'plane',
  'flight': 'plane',
  'travel': 'briefcase',
  'trip': 'briefcase',
  'drive': 'car',
  'driving': 'car',
  'car': 'car',
  'bus': 'bus',
  'train': 'train-front',
  'subway': 'train-front',
  'boat': 'sailboat',
  'sail': 'sailboat',
  'ship': 'ship',
  'cruise': 'ship',

  // Social & Events
  'chat': 'message-square',
  'talk': 'message-square',
  'meet': 'users',
  'meeting': 'users',
  'hangout': 'users',
  'date': 'heart',
  'event': 'calendar-days',
  'festival': 'music-2',
  'concert': 'music-2',
  'movie': 'film',
  'cinema': 'film',
  'theatre': 'drama',
  'wedding': 'church',
  'birthday': 'cake',
  'gift': 'gift',

  // Work & Productivity
  'work': 'briefcase',
  'office': 'briefcase',
  'study': 'book-open',
  'learn': 'book-open',
  'school': 'school',
  'college': 'graduation-cap',
  'university': 'graduation-cap',

  // Home & Chores
  'shop': 'shopping-cart',
  'shopping': 'shopping-cart',
  'buy': 'shopping-cart',
  'groceries': 'shopping-basket',
  'clean': 'sparkles',
  'cleaning': 'sparkles',
  'home': 'home',
  'house': 'home',
  'mail': 'mail',
  'post': 'mail',
  'laundry': 'shirt',
  
  // Nature & Outdoors
  'nature': 'trees',
  'forest': 'trees',
  'park': 'trees',
  'garden': 'flower-2',
  'gardening': 'flower-2',
  'beach': 'sun',
  'camping': 'tent',
  'fish': 'fish',
  'fishing': 'fish',
  'birdwatch': 'bird',
  'pets': 'paw-print',
  'animal': 'paw-print',
  'dog': 'dog',
  'cat': 'cat',

  // Relaxation
  'sleep': 'moon',
  'nap': 'moon',
  'rest': 'sofa',
  'chill': 'sofa',
  'relax': 'sofa',
  'tv': 'tv-2',
  'netflix': 'tv-2',
  'watch': 'tv-2',

  // Arts & Creativity
  'art': 'palette',
  'paint': 'paint-brush',
  'painting': 'paint-brush',
  'draw': 'pencil',
  'drawing': 'pencil',
  'design': 'pen-tool',
  'photo': 'camera',
  'photography': 'camera',
  'dance': 'music-2',
  'dancing': 'music-2',
  'write': 'edit-3',
  'writing': 'edit-3',

  // Health & Wellness
  'health': 'heart-pulse',
  'doctor': 'stethoscope',
  'hospital': 'hospital',
  'dentist': 'tooth',
  'pharmacy': 'pilcrow',
  'medicine': 'pilcrow',
  'therapy': 'brain-circuit',

  // Default
  'person': 'tag',
  'place': 'tag',
  'thing': 'tag',
  'link': 'link-2',
  'fight': 'swords',
  'dice': 'dices',
};

export const getIconName = (text: string): string => {
  const words = text.toLowerCase().split(/[\s,.]+/);

  for (const word of words) {
    // 1. Check for a direct match
    if (keywordToIconName[word]) {
      return keywordToIconName[word];
    }

    // 2. Check for verb forms (e.g., running -> run, baking -> bake)
    if (word.endsWith('ing')) {
      const base = word.slice(0, -3);
      if (keywordToIconName[base]) return keywordToIconName[base];
      if (keywordToIconName[base + 'e']) return keywordToIconName[base + 'e'];
    }

    // 3. Check for plurals
    let singularForm = '';
    if (word.endsWith('ies')) {
      singularForm = word.slice(0, -3) + 'y';
    } else if (word.endsWith('es')) {
      singularForm = word.slice(0, -2);
    } else if (word.endsWith('s')) {
      singularForm = word.slice(0, -1);
    }
    if (singularForm && keywordToIconName[singularForm]) {
      return keywordToIconName[singularForm];
    }
  }
  
  return 'line-squiggle'; // Default icon name
}; 