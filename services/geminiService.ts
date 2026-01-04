
import { GoogleGenAI, Type } from "@google/genai";
import { PROMPT_REALISM_BASE, PROMPT_CONTACT_SHEET_BASE, RAW_PHOTOGRAPHY_BOOST } from '../constants';
import type { Features, AvatarStyle, BodyType, AvatarDNA, AspectRatio } from '../types';

/**
 * Creates a fresh GoogleGenAI instance for every call.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    throw new Error("API Key is missing. Please select one in the dialog.");
  }
  return new GoogleGenAI({ apiKey });
};

const getStyleDescription = (style: AvatarStyle): string => {
  switch (style) {
    case 'Realistic': return 'Modern high-end photography, raw photo aesthetic, unretouched, realistic skin texture.';
    case 'Animated': return '3D animated feature film style. Sharp details, vibrant colors.';
    case 'Pixar': return 'Signature Pixar animation style. Soft shapes, cinematic lighting.';
    case 'Anime': return 'Classic cel-shaded Japanese Anime style, sharp lines.';
    case 'Fantasy Art': return 'High fantasy digital painting, ethereal lighting.';
    case 'Comic Book': return 'Modern American comic book style, bold inks, dynamic shading.';
    default: return style;
  }
};

const getBodyTypeDescriptor = (build: BodyType): string => {
    switch (build) {
        case 'Slender': return 'MANDATORY BUILD: Extreme ectomorph, very narrow bone structure, minimal body fat, lean and lithe.';
        case 'Athletic': return 'MANDATORY BUILD: Toned mesomorph, fit athletic shoulders, firm muscles, defined physique.';
        case 'Average': return 'MANDATORY BUILD: Natural human proportions, balanced build, realistic soft tissue distribution.';
        case 'Curvy': return 'MANDATORY BUILD: EXTREME HOURGLASS. Very wide hips, thick thighs, significant hip-to-waist ratio, pronounced feminine curves, narrow waist.';
        case 'Muscular': return 'MANDATORY BUILD: High hypertrophy bodybuilder physique, broad heavy shoulders, visible muscle separation, powerful frame.';
        case 'Stocky': return 'MANDATORY BUILD: Robust sturdy frame, thick trunk, powerful core, heavy set bone structure.';
        default: return 'Average build';
    }
};

const getIdentityLockString = (features: Features): string => {
    return [
        `**STRICT PHYSICAL LOCK (DO NOT DEVIATE):**`,
        `- BODY BUILD: ${getBodyTypeDescriptor(features.build)}`,
        `- MANDATORY WARDROBE: Subject MUST be wearing ${features.clothing || 'minimal black bikini'}. DO NOT use default athletic wear or generic clothing.`,
        `**IDENTITY DNA:**`,
        `- Nationality/Ethnicity: ${features.ethnicity}`,
        `- Hair Detail: ${features.hair}`,
        `- Eye Detail: ${features.eyes}`,
        `- Age Context: ${features.age}`,
        `- Gender Identity: ${features.gender}`,
        `- Features: ${features.distinguishingFeature} located at ${features.distinguishingFeaturePlacement}`,
    ].join('\n');
};

const extractImageFromResponse = (response: any): string => {
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) return part.inlineData.data;
    }
    throw new Error('Image generation failed.');
};

const cleanBase64 = (data: string) => data.includes(',') ? data.split(',')[1] : data;

const getMimeType = (data: string): string => {
  if (data.startsWith('data:')) {
      const match = data.match(/data:([^;]+);base64,/);
      if (match && match[1]) return match[1];
  }
  return 'image/jpeg';
};

export const generateIdentityDNA = async (
  basePrompt: string,
  features: Features,
  portraitBase64: string,
  userEmail: string
): Promise<AvatarDNA> => {
    const ai = getAiClient();
    const prompt = `Forensic analysis of face/body structures. Return JSON.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                { inlineData: { mimeType: getMimeType(portraitBase64), data: cleanBase64(portraitBase64) } },
                { text: prompt }
            ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    facialStructure: {
                        type: Type.OBJECT,
                        properties: { faceShape: { type: Type.STRING }, jawline: { type: Type.STRING }, cheekbones: { type: Type.STRING } },
                        required: ['faceShape', 'jawline', 'cheekbones']
                    },
                    features: {
                        type: Type.OBJECT,
                        properties: { eyes: { type: Type.STRING }, nose: { type: Type.STRING }, lips: { type: Type.STRING }, brows: { type: Type.STRING } },
                        required: ['eyes', 'nose', 'lips', 'brows']
                    },
                    textures: {
                        type: Type.OBJECT,
                        properties: { skin: { type: Type.STRING }, pores: { type: Type.STRING }, hairSheen: { type: Type.STRING } },
                        required: ['skin', 'pores', 'hairSheen']
                    },
                    globalSignature: { type: Type.STRING }
                },
                required: ['facialStructure', 'features', 'textures', 'globalSignature']
            }
        }
    });
    return JSON.parse(response.text.trim());
};

export const generateCharacterDescription = async (
  basePrompt: string,
  features: Features,
  avatarStyle: AvatarStyle,
  userEmail: string,
): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Create character blueprint. Style: ${getStyleDescription(avatarStyle)}. Prompt: ${basePrompt}. Features: ${JSON.stringify(features)}.`;
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
  return response.text.trim();
};

export const generateTurnaroundSheet = async (
  characterDescription: string,
  avatarStyle: AvatarStyle,
  userEmail: string,
  features: Features, 
  referenceImage?: string | null, 
  adjustmentPrompt?: string,
): Promise<string> => {
  const ai = getAiClient();
  let prompt = `${avatarStyle === 'Realistic' ? PROMPT_REALISM_BASE + RAW_PHOTOGRAPHY_BOOST : 'Portrait shot.'} Style: ${getStyleDescription(avatarStyle)}. Description: ${characterDescription}. ${getIdentityLockString(features)} ${adjustmentPrompt ? `Adjust: ${adjustmentPrompt}` : ''}`;
  const parts: any[] = [{ text: prompt }];
  if (referenceImage) parts.unshift({ inlineData: { mimeType: getMimeType(referenceImage), data: cleanBase64(referenceImage) } });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview', 
    contents: { parts },
    config: { imageConfig: { aspectRatio: "9:16", imageSize: "2K" } }
  });
  return extractImageFromResponse(response);
};

export const generateContactSheet = async (
    userEmail: string,
    referenceImage: string,
    features: Features,
    avatarStyle: AvatarStyle,
    characterDescription: string,
): Promise<string> => {
    const ai = getAiClient();
    // Stronger warning for the grid generation to ensure wardrobe and body type consistency
    const prompt = `**STRICT STRUCTURAL REFERENCE TASK.** ${PROMPT_CONTACT_SHEET_BASE} 
    Style: ${getStyleDescription(avatarStyle)}. 
    ${getIdentityLockString(features)}. 
    **WARNING:** EVERY SINGLE PANEL MUST SHOW THE SUBJECT IN THE EXACT SAME ${features.clothing || 'BIKINI'}. 
    **WARNING:** THE ${features.build} BODY TYPE MUST BE CLEARLY VISIBLE AND CONSISTENT IN EVERY FULL-BODY VIEW. 
    DO NOT DEFAULT TO BLACK ATHLETIC WEAR IF ANOTHER OUTFIT IS SPECIFIED.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ inlineData: { mimeType: getMimeType(referenceImage), data: cleanBase64(referenceImage) } }, { text: prompt }] },
        config: { imageConfig: { aspectRatio: "16:9", imageSize: "2K" } }
    });
    return extractImageFromResponse(response);
};

export const generateMultiCharacterImage = async (
  characters: any[],
  scenarioPrompt: string,
  baseAvatarStyle: AvatarStyle,
  userEmail: string,
  aspectRatio: AspectRatio = '1:1',
  characterAssets?: Record<string, string | null>
): Promise<string> => {
  const ai = getAiClient();
  const parts: any[] = [{ text: `Identity scene. Style: ${getStyleDescription(baseAvatarStyle)}. Scenario: ${scenarioPrompt}.` }];
  
  characters.forEach((char, idx) => {
      const assetBase64 = characterAssets?.[char.id];
      const identityImage = char.characterSheet['Identity Portrait'];

      let charPrompt = `CHARACTER ${idx + 1}: ${char.name}. Identity DNA: ${char.description}. Build: ${getBodyTypeDescriptor(char.features.build)}.`;
      
      if (identityImage) {
          parts.push({ inlineData: { mimeType: getMimeType(identityImage), data: cleanBase64(identityImage) } });
          charPrompt += ` Facial reference: Image ${parts.length}.`;
      }

      if (assetBase64) {
          parts.push({ inlineData: { mimeType: getMimeType(assetBase64), data: cleanBase64(assetBase64) } });
          charPrompt += ` Asset Reference: Image ${parts.length}. Apply this EXACT outfit/object to ${char.name}. If the asset image is an outfit, ${char.name} MUST be wearing it.`;
      }

      parts.push({ text: charPrompt });
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts },
    config: { imageConfig: { aspectRatio, imageSize: "2K" } },
  });
  return extractImageFromResponse(response);
};

export const upscaleImage = async (base64Image: string, userEmail: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ inlineData: { mimeType: getMimeType(base64Image), data: cleanBase64(base64Image) } }, { text: "Forensic Upscale 4K" }] },
    config: { imageConfig: { imageSize: '4K', aspectRatio: '16:9' } }
  });
  return extractImageFromResponse(response);
};
