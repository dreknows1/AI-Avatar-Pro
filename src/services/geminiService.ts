
import { GoogleGenAI } from "@google/genai";
import { AGGRESSIVE_NEGATIVE_PROMPT } from '../constants';
import type { Features, AvatarStyle, SavedAvatar, AspectRatio } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) throw new Error("API Key missing. Select one in the dialog.");
  return new GoogleGenAI({ apiKey });
};

const getStyleDescription = (style: AvatarStyle): string => {
  switch (style) {
    case 'Realistic': return 'Hyper-realistic raw photography, high-end 8K look.';
    case 'Animated': return 'Signature Pixar/Disney 3D animation style.';
    case 'Anime': return 'Classic high-detail Japanese Anime style.';
    case 'Fantasy': return 'Ethereal high-fantasy digital masterpiece.';
    case 'Comic Book': return 'Bold dynamic comic book inks and colors.';
    case 'Cyberpunk': return 'Neon-lit futuristic cyberpunk aesthetic.';
    default: return style;
  }
};

const cleanBase64 = (data: string) => data.includes(',') ? data.split(',')[1] : data;

export const generateCharacterDescription = async (
  features: Features,
  avatarStyle: AvatarStyle,
): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Create a professional detailed character blueprint for an AI avatar based on these DNA attributes:
  - Base Narrative: ${features.description}
  - Style: ${getStyleDescription(avatarStyle)}
  - Age: ${features.age}
  - Gender: ${features.gender}
  - Build: ${features.build}
  - Heritage: ${features.culture}
  - Eyes: ${features.eyes}
  - Hair: ${features.hair}
  - Complexion: ${features.complexion}
  - Special Features: ${features.distinguishingFeatures}
  - Clothing: ${features.clothing}
  
  Synthesize a concise yet rich description for generation models.`;
  
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
  return response.text.trim();
};

export const generateAvatarVideo = async (
  description: string,
  onProgress?: (msg: string) => void
): Promise<string> => {
  const ai = getAiClient();
  if (onProgress) onProgress("Initializing Veo 3.1 motion core...");

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `A cinematic video portrait of: ${description}. Stable camera, cinematic lighting, 4K quality. Single person only. No grids.`,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    if (onProgress) onProgress("Veo is rendering motion sequence (1-3 mins)...");
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed.");
  
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const generateAvatarImage = async (
  description: string,
  avatarStyle: AvatarStyle,
  features: Features,
  referenceImage?: string | null
): Promise<string> => {
  const ai = getAiClient();
  const prompt = `
  ${AGGRESSIVE_NEGATIVE_PROMPT}
  Generate ONE single high-detail master portrait. No grids or sheets.
  Style: ${getStyleDescription(avatarStyle)}. 
  Character DNA Description: ${description}. 
  Specifically: ${features.build} build, ${features.clothing} clothing, ${features.complexion} skin.
  RAW photography boost for Realistic style. High-end rendering for others.`;
  
  const parts: any[] = [{ text: prompt }];
  if (referenceImage) {
      parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: cleanBase64(referenceImage) } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview', 
    contents: { parts },
    config: { imageConfig: { aspectRatio: "9:16", imageSize: "2K" } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) return part.inlineData.data;
  }
  throw new Error('Image generation failed.');
};

export const generateMultiCharacterImage = async (
  characters: SavedAvatar[],
  scenarioPrompt: string,
  baseAvatarStyle: AvatarStyle,
  userEmail: string,
  aspectRatio: AspectRatio = '1:1',
  characterAssets?: Record<string, string | null>
): Promise<string> => {
  const ai = getAiClient();
  const promptText = `
  ${AGGRESSIVE_NEGATIVE_PROMPT}
  Create a cohesive scene. No grids.
  Style: ${getStyleDescription(baseAvatarStyle)}. 
  Scenario: ${scenarioPrompt}.
  `;
  
  const parts: any[] = [{ text: promptText }];
  
  characters.forEach((char, idx) => {
      const assetBase64 = characterAssets?.[char.id];
      const identityImage = char.image;
      let charPrompt = `CHARACTER ${idx + 1}: ${char.name}. ${char.description}.`;
      if (identityImage) {
          parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanBase64(identityImage) } });
          charPrompt += ` Facial reference: Image ${parts.length}.`;
      }
      if (assetBase64) {
          parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanBase64(assetBase64) } });
          charPrompt += ` Asset Reference: Image ${parts.length}.`;
      }
      parts.push({ text: charPrompt });
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts },
    config: { imageConfig: { aspectRatio, imageSize: "2K" } },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) return part.inlineData.data;
  }
  throw new Error('Image generation failed.');
};
