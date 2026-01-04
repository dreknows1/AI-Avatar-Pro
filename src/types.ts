
export type AspectRatio = '1:1' | '3:4' | '4:3' | '16:9' | '9:16';

export type AvatarStyle =
  | 'Realistic'
  | 'Animated'
  | 'Anime'
  | 'Fantasy'
  | 'Comic Book'
  | 'Cyberpunk';

export interface GenerationStatus {
  generating: boolean;
  message: string;
  progress: number;
  error: string | null;
  phase: 'idle' | 'video' | 'image';
}

export type BodyType = 'Slender' | 'Athletic' | 'Average' | 'Curvy' | 'Muscular' | 'Stocky';

export interface Features {
  description: string;
  age: string;
  gender: string;
  build: BodyType;
  culture: string;
  eyes: string;
  hair: string;
  complexion: string;
  distinguishingFeatures: string;
  clothing: string;
}

// Added AvatarDNA interface to resolve type errors in components accessing identityDNA
export interface AvatarDNA {
  facialStructure: {
    faceShape: string;
    jawline: string;
    cheekbones: string;
  };
  features: {
    eyes: string;
    nose: string;
    lips: string;
    brows: string;
  };
  textures: {
    skin: string;
    pores: string;
    hairSheen: string;
  };
  globalSignature: string;
}

export interface SavedAvatar {
  id: string;
  userEmail?: string;
  name: string;
  createdAt: number;
  description: string;
  features: Features;
  avatarStyle: AvatarStyle;
  image: string; // Base64 Master Portrait
  videoUrl?: string; // Veo MP4 URL
  prompt: string;
  // Fix: Added identityDNA property to resolve errors in Profile.tsx
  identityDNA?: AvatarDNA;
}
