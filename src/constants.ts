
import type { AvatarStyle, BodyType } from './types';

export const MAX_FREE_AVATARS = 2;
export const PRICE_PER_AVATAR = 25.00;

export const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_...replace_with_your_link"; 

export interface StyleOption {
  id: AvatarStyle;
  name: string;
  description: string;
  image: string;
}

export const AVATAR_STYLES: StyleOption[] = [
  { 
    id: 'Realistic', 
    name: 'Realistic', 
    description: 'Hyper-realistic photo quality', 
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: 'Animated', 
    name: 'Animated', 
    description: '3D animated feature film style', 
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: 'Anime', 
    name: 'Anime', 
    description: 'Japanese animation style', 
    image: 'https://images.unsplash.com/photo-1578632738908-4521c726fbf4?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: 'Fantasy', 
    name: 'Fantasy', 
    description: 'Ethereal and magical', 
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: 'Comic Book', 
    name: 'Comic Book', 
    description: 'Bold lines and vibrant colors', 
    image: 'https://images.unsplash.com/photo-1588497859490-85d1c17db96d?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: 'Cyberpunk', 
    name: 'Cyberpunk', 
    description: 'Futuristic and neon', 
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=800&auto=format&fit=crop' 
  }
];

export const BODY_TYPES: BodyType[] = ['Slender', 'Athletic', 'Average', 'Curvy', 'Muscular', 'Stocky'];

export const AGE_RANGES = [
  'Select Age Range',
  'Toddler (1-3)',
  'Child (4-12)',
  'Teenager (13-19)',
  'Young Adult (20-35)',
  'Middle Aged (36-55)',
  'Elderly (56+)'
];

export const AGGRESSIVE_NEGATIVE_PROMPT = `
**STRICT NEGATIVE PROMPT (MANDATORY):** 
DO NOT GENERATE GRIDS. DO NOT GENERATE COLLAGES. DO NOT GENERATE MULTIPLE PANELS. 
DO NOT GENERATE SPLIT SCREENS. DO NOT GENERATE TURNAROUNDS. 
THE OUTPUT MUST BE ONE SINGLE, CONTINUOUS, HIGH-FIDELITY IMAGE OF A SINGLE PERSON.
NO TEXT BOXES. NO BORDERS. NO PANELS.
`;
