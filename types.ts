
export type AspectRatio = '1:1' | '3:4' | '4:3' | '16:9' | '9:16';

export type AvatarStyle =
  | 'Realistic'
  | 'Animated'
  | 'Pixar'
  | 'Anime'
  | 'Fantasy Art'
  | 'Comic Book';

export type PoseName = 'Identity Portrait' | 'Contact Sheet';

export type CharacterSheet = {
  [key in PoseName]?: string;
};

export interface GenerationStatus {
  generating: boolean;
  message: string;
  progress: number;
  error: string | null;
}

export type Gender = 'Female' | 'Male' | 'Unspecified';

export type BodyType = 'Slender' | 'Athletic' | 'Average' | 'Curvy' | 'Muscular' | 'Stocky';

export interface Features {
  hair: string;
  eyes: string;
  skin: string;
  build: BodyType;
  clothing: string;
  age: string;
  ethnicity: string;
  gender: Gender;
  distinguishingFeature: string;
  distinguishingFeaturePlacement: string;
}

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
  characterSheet: CharacterSheet; 
  trainingImages: string[]; 
  prompt: string;
  identityDNA?: AvatarDNA;
}
