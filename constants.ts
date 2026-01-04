
import React from 'react';
import type { PoseName, AvatarStyle, Gender, BodyType } from './types';

// LIMITS & PRICING
export const MAX_FREE_AVATARS = 2;
export const PRICE_PER_AVATAR = 25.00;

export const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_...replace_with_your_link"; 

export const POSES: PoseName[] = [
  'Identity Portrait',
  'Contact Sheet'
];

export const AVATAR_STYLES: AvatarStyle[] = [
  'Realistic',
  'Animated',
  'Pixar',
  'Anime',
  'Fantasy Art',
  'Comic Book',
];

export const GENDERS: Gender[] = ['Female', 'Male', 'Unspecified'];

export const BODY_TYPES: BodyType[] = ['Slender', 'Athletic', 'Average', 'Curvy', 'Muscular', 'Stocky'];

export const DISTINGUISHING_FEATURES = [
  'None',
  'Freckles',
  'Mole',
  'Scar',
  'Birthmark',
  'Tattoo',
  'Piercing'
];

export const BODY_TYPE_VISUALS: Record<BodyType, string> = {
  'Slender': `<svg viewBox="0 0 100 250" xmlns="http://www.w3.org/2000/svg"><path d="M50 20C44.4772 20 40 24.4772 40 30C40 35.5228 44.4772 40 50 40C55.5228 40 60 35.5228 60 30C60 24.4772 55.5228 20 50 20Z" fill="currentColor"/><path d="M48 45C48 42.7909 49.7909 41 52 41H48V45Z" fill="currentColor"/><path d="M48 45L48 95L42 95C42 120 40 140 40 160L40 230L48 230L48 160C48 140 48 120 48 95Z" fill="currentColor"/><path d="M52 45L52 95C52 120 54 140 54 160L54 230L60 230L60 160C60 140 58 120 58 95L52 95Z" fill="currentColor"/></svg>`,
  'Athletic': `<svg viewBox="0 0 100 250" xmlns="http://www.w3.org/2000/svg"><path d="M50 20C44.4772 20 40 24.4772 40 30C40 35.5228 44.4772 40 50 40C55.5228 40 60 35.5228 60 30C60 24.4772 55.5228 20 50 20Z" fill="currentColor"/><path d="M45 45C45 42.7909 47.7909 41 50 41H45V45Z" fill="currentColor"/><path d="M45 45L35 60L42 95C42 120 40 140 40 160L35 230L45 230L45 160C45 140 45 120 48 95L50 60L45 45Z" fill="currentColor"/><path d="M55 45L65 60L58 95C58 120 60 140 60 160L65 230L55 230L55 160C55 140 55 120 52 95L50 60L55 45Z" fill="currentColor"/></svg>`,
  'Average': `<svg viewBox="0 0 100 250" xmlns="http://www.w3.org/2000/svg"><path d="M50 20C44.4772 20 40 24.4772 40 30C40 35.5228 44.4772 40 50 40C55.5228 40 60 35.5228 60 30C60 24.4772 55.5228 20 50 20Z" fill="currentColor"/><path d="M46 45C46 42.7909 47.7909 41 50 41H46V45Z" fill="currentColor"/><path d="M46 45L40 95C40 120 38 140 38 160L38 230L48 230L48 160C48 140 48 120 48 95L46 45Z" fill="currentColor"/><path d="M54 45L60 95C60 120 62 140 62 160L62 230L52 230L52 160C52 140 52 120 52 95L54 45Z" fill="currentColor"/></svg>`,
  'Curvy': `<svg viewBox="0 0 100 250" xmlns="http://www.w3.org/2000/svg"><path d="M50 20C44.4772 20 40 24.4772 40 30C40 35.5228 44.4772 40 50 40C55.5228 40 60 35.5228 60 30C60 24.4772 55.5228 20 50 20Z" fill="currentColor"/><path d="M46 45C46 42.7909 47.7909 41 50 41H46V45Z" fill="currentColor"/><path d="M46 45L42 90C35 120 30 145 35 165L40 230L50 230L50 165C50 145 48 120 48 90L46 45Z" fill="currentColor"/><path d="M54 45L58 90C65 120 70 145 65 165L60 230L50 230L50 165C50 145 52 120 52 90L54 45Z" fill="currentColor"/></svg>`,
  'Muscular': `<svg viewBox="0 0 100 250" xmlns="http://www.w3.org/2000/svg"><path d="M50 20C44.4772 20 40 24.4772 40 30C40 35.5228 44.4772 40 50 40C55.5228 40 60 35.5228 60 30C60 24.4772 55.5228 20 50 20Z" fill="currentColor"/><path d="M42 45C42 42.7909 45.7909 41 50 41H42V45Z" fill="currentColor"/><path d="M42 45L30 65L38 100C38 120 35 140 35 160L30 230L45 230L45 160C45 140 45 120 48 100L50 65L42 45Z" fill="currentColor"/><path d="M58 45L70 65L62 100C62 120 65 140 65 160L70 230L55 230L55 160C55 140 55 120 52 100L50 65L58 45Z" fill="currentColor"/></svg>`,
  'Stocky': `<svg viewBox="0 0 100 250" xmlns="http://www.w3.org/2000/svg"><path d="M50 20C44.4772 20 40 24.4772 40 30C40 35.5228 44.4772 40 50 40C55.5228 40 60 35.5228 60 30C60 24.4772 55.5228 20 50 20Z" fill="currentColor"/><path d="M44 45C44 42.7909 46.7909 41 50 41H44V45Z" fill="currentColor"/><path d="M44 45L35 95C35 120 32 140 32 160L32 230L48 230L48 160C48 140 48 120 48 95L44 45Z" fill="currentColor"/><path d="M56 45L65 95C65 120 68 140 68 160L68 230L52 230L52 160C52 140 52 120 52 95L56 45Z" fill="currentColor"/></svg>`,
};

export const LOADING_MESSAGES = [
  "Analyzing facial structure...",
  "Calibrating skin texture...",
  "Setting up studio lighting...",
  "Generating character sheet...",
  "Constructing full body model...",
  "Refining body proportions...",
  "Synthesizing training data...",
  "Rendering turnaround views...",
  "Checking for consistency...",
  "Applying fashion details...",
  "Finalizing character model...",
];

export const APPROVED_EMAILS = [
  'testuser@example.com',
  'admin@biam.pro',
  'developer@google.com',
];

// SHARED PHOTOGRAPHY BOOST FOR REALISM
export const RAW_PHOTOGRAPHY_BOOST = `
**PHOTOGRAPHY STYLE:** Raw DSLR or high-end Mirrorless Photo. 
**CAMERA PERSPECTIVE:** Third-person shot, standard camera height. No selfie framing unless explicitly requested for Image 1.
**QUALITY:** Unretouched, high frequency skin texture, visible pores, natural lighting irregularities, realistic depth of field.
**STRICT NEGATIVE PROMPT:** No porcelain skin, no airbrushing, no 3D render look, no plastic skin, no beauty filters.
`;

// PART 1: IDENTITY & TEXTURE DETAILS
export const PROMPT_IDENTITY_DETAILS = `
Subject Type: Human
Identity Summary: High-fidelity character with distinct, consistent features.
Skin Texture: Natural skin texture, high-frequency details, visible pores, no heavy smoothing, realistic tonal variation.
`;

// PART 2: PORTRAIT SETUP (Used only for Image 1 - THE MASTER WAIST-UP SELFIE)
export const PROMPT_PORTRAIT_SETUP = `
**THE IMAGE 1 RULE (MASTER):** This image MUST be a **waist-up selfie**.
Orientation: Portrait (9:16)
Shot Size: **Waist-up framing**. The camera should see the head, shoulders, chest, and down to the waist.
Composition: The subject is holding the phone in one hand (extended) to take a selfie.
Wardrobe: Follow character description strictly. Use clothing provided in details.
Expression: Calm, soft natural expression.
Gaze Direction: Direct eye contact with the camera.
Camera Characteristics: High-end smartphone camera feel. Standard eye-level angle.
`;

// The Full Prompt for Image 1
export const PROMPT_REALISM_BASE = PROMPT_IDENTITY_DETAILS + PROMPT_PORTRAIT_SETUP;

// PART 3: TRAINING GRID (Used only for Image 2 - 360 Degree Training)
export const PROMPT_CONTACT_SHEET_BASE = `
**TASK:** Generate a 9-panel 360-degree identity training grid (16:9). 
**CORE GOAL:** Provide a complete structural and textural reference of this person's anatomy, skin, and build.
**STRICT IDENTITY LOCK:** You must maintain the exact facial structure, eye shape, lip fullness, nose bridge, and skin tone of the attached reference image in every panel.
**GRID CONTENT:**
1. Panel 1: Eye-level front portrait (Neutral pose, no selfie).
2. Panel 2: 45-degree angle profile (Left side).
3. Panel 3: 45-degree angle profile (Right side).
4. Panel 4: Close-up macro of facial skin texture and iris detail.
5. Panel 5: Full body shot (Front view, standing naturally).
6. Panel 6: Full body shot (Side view).
7. Panel 7: Full body shot (Back view, showing hair texture).
8. Panel 8: Medium shot from a high camera angle (Looking down).
9. Panel 9: Medium shot from a low camera angle (Looking up).

**TECHNICAL RULES:**
- **STRICT BUILD LOCK:** You MUST adhere to the specified anatomy/build in every panel.
- **STRICT IDENTITY LOCK:** Face, eyes, hair, and build must be 100% consistent across all panels and match the source image exactly.
- **NO SELFIES:** Every frame is a third-person camera shot.
- **CONTRAST BACKGROUND:** Plain mid-gray studio background for all panels.
- **UNIFORM LIGHTING:** Neutral white studio lighting.
- **CLOTHING:** Minimal form-fitting black athletic wear or bikini for all panels to maximize anatomical clarity.
`;
