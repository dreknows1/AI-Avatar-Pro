
import React, { useState, useEffect, useRef } from 'react';
import { AvatarForm } from './components/AvatarForm';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Navigation } from './components/Navigation';
import { Profile } from './components/Profile';
import { ImageGenerator } from './components/ImageGenerator';
import { ApiKeySelector } from './components/ApiKeySelector';
import { Login } from './components/Login';
import { MAX_FREE_AVATARS } from './constants';
import * as geminiService from './services/geminiService';
import * as storageService from './services/storageService';
import type {
  AvatarStyle,
  CharacterSheet,
  Features,
  GenerationStatus,
  SavedAvatar,
  AvatarDNA,
} from './types';

type View = 'create' | 'profile' | 'generator';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [currentView, setCurrentView] = useState<View>('create');
  const [savedAvatars, setSavedAvatars] = useState<SavedAvatar[]>([]);
  const [activeAvatarForGenerator, setActiveAvatarForGenerator] = useState<SavedAvatar | null>(null);
  const [purchasedSlots, setPurchasedSlots] = useState<number>(0);
  const [prompt, setPrompt] = useState('');
  const [features, setFeatures] = useState<Features>({
    hair: '', eyes: '', skin: '', build: 'Average', clothing: '', age: '', ethnicity: '', gender: 'Female',
    distinguishingFeature: 'None', distinguishingFeaturePlacement: ''
  });
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('Realistic');
  const [userReferenceImage, setUserReferenceImage] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    generating: false, message: '', progress: 0, error: null,
  });
  const [characterSheet, setCharacterSheet] = useState<CharacterSheet>({});
  
  const characterSheetRef = useRef<CharacterSheet>(characterSheet);
  useEffect(() => { characterSheetRef.current = characterSheet; }, [characterSheet]);
  
  const [characterDescription, setCharacterDescription] = useState<string>('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustmentPrompt, setAdjustmentPrompt] = useState('');
  const [isAdjustingLoading, setIsAdjustingLoading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  const loadAvatars = async () => {
    const allAvatars = await storageService.getSavedAvatars();
    const userAvatars = allAvatars.filter(avatar => !avatar.userEmail || avatar.userEmail === userEmail);
    setSavedAvatars(userAvatars);
  };

  const checkApiKey = async () => {
      if ((window as any).aistudio) {
          try {
              const hasKey = await (window as any).aistudio.hasSelectedApiKey();
              setApiKeySelected(hasKey);
          } catch (e) { console.error(e); }
      } else if (process.env.API_KEY) {
          setApiKeySelected(true);
      }
  };

  const handleOpenKeySelector = async () => {
    if ((window as any).aistudio) {
        try {
            await (window as any).aistudio.openSelectKey();
            setApiKeySelected(true);
        } catch (e) { console.error(e); }
    }
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem('biam_user_email');
    if (storedEmail) {
      setUserEmail(storedEmail);
      setIsAuthenticated(true);
    }
    const storedSlots = localStorage.getItem('biam_purchased_slots');
    if (storedSlots) setPurchasedSlots(parseInt(storedSlots, 10));
    checkApiKey();
  }, []);

  useEffect(() => {
    if (userEmail && isAuthenticated) loadAvatars();
  }, [userEmail, isAuthenticated]);

  const handleLogin = (email: string) => {
    localStorage.setItem('biam_user_email', email);
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('biam_user_email');
    setIsAuthenticated(false);
    setUserEmail('');
    setSavedAvatars([]);
  };

  const isAdmin = userEmail.toLowerCase() === 'dreknows@gmail.com';
  const remainingSlots = isAdmin ? 9999 : Math.max(0, (MAX_FREE_AVATARS + purchasedSlots) - savedAvatars.length);

  const handleGenerate = async () => {
    if (remainingSlots <= 0) return;
    setGenerationStatus({ generating: true, message: 'Constructing Blueprint...', progress: 10, error: null });
    setCharacterSheet({});
    try {
        const desc = await geminiService.generateCharacterDescription(prompt, features, avatarStyle, userEmail);
        setCharacterDescription(desc);
        setGenerationStatus(prev => ({ ...prev, message: 'Synthesizing Master Waist-Up Portrait (2K)...', progress: 50 }));
        const imageBase64 = await geminiService.generateTurnaroundSheet(desc, avatarStyle, userEmail, features, userReferenceImage);
        setCharacterSheet({ 'Identity Portrait': imageBase64 });
        setGenerationStatus({ generating: false, message: 'Identity Core Ready!', progress: 100, error: null });
    } catch (error: any) {
        setGenerationStatus({ generating: false, message: '', progress: 0, error: error.message || "Generation failed." });
    }
  };

  const handleGenerateTrainingData = async () => {
      const portrait = characterSheet['Identity Portrait'];
      if (!portrait) return;
      setIsTraining(true);
      try {
          const contactSheet = await geminiService.generateContactSheet(userEmail, portrait, features, avatarStyle, characterDescription);
          setCharacterSheet(prev => ({ ...prev, 'Contact Sheet': contactSheet }));
      } catch (e: any) { alert(e.message); }
      finally { setIsTraining(false); }
  };

  const handleSaveToProfile = async (name: string) => {
      try {
        const portrait = characterSheet['Identity Portrait'];
        let dna: AvatarDNA | undefined;
        if (portrait) dna = await geminiService.generateIdentityDNA(characterDescription, features, portrait, userEmail);
        const newAvatar: SavedAvatar = {
            id: Date.now().toString(),
            userEmail, name, createdAt: Date.now(),
            description: characterDescription,
            features, avatarStyle, characterSheet,
            trainingImages: portrait ? [portrait] : [],
            prompt, identityDNA: dna
        };
        await storageService.saveAvatar(newAvatar);
        setSavedAvatars(prev => [newAvatar, ...prev]);
        setCurrentView('profile');
      } catch (error: any) { alert(error.message); }
  };

  const handleAdjust = async () => {
      setIsAdjustingLoading(true);
      try {
           const currentImg = characterSheetRef.current['Identity Portrait']!;
           const newImg = await geminiService.generateTurnaroundSheet(characterDescription, avatarStyle, userEmail, features, currentImg, adjustmentPrompt);
           setCharacterSheet({ 'Identity Portrait': newImg });
           setIsAdjusting(false);
           setAdjustmentPrompt('');
      } catch (e: any) { alert(e.message); }
      finally { setIsAdjustingLoading(false); }
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans pb-20">
       <Navigation 
         currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout}
         userEmail={userEmail} purchasedSlots={purchasedSlots} avatarsCreated={savedAvatars.length}
       />
       <main className="container mx-auto px-4 py-8">
          {!apiKeySelected && <ApiKeySelector onKeySelect={handleOpenKeySelector} />}
          {currentView === 'create' && (
              <div className="flex flex-col items-center gap-8">
                  {generationStatus.generating ? <LoadingIndicator status={generationStatus} /> : 
                   Object.keys(characterSheet).length > 0 ? (
                      <ResultsDisplay 
                          characterSheet={characterSheet}
                          onReset={() => setCharacterSheet({})}
                          isAdjusting={isAdjusting}
                          setIsAdjusting={setIsAdjusting}
                          adjustmentPrompt={adjustmentPrompt}
                          setAdjustmentPrompt={setAdjustmentPrompt}
                          onAdjust={handleAdjust}
                          isAdjustingLoading={isAdjustingLoading}
                          onSaveToProfile={handleSaveToProfile}
                          onGenerateTrainingData={handleGenerateTrainingData}
                          isTraining={isTraining}
                      />
                  ) : (
                      <AvatarForm 
                          prompt={prompt} setPrompt={setPrompt}
                          features={features} setFeatures={setFeatures}
                          avatarStyle={avatarStyle} setAvatarStyle={setAvatarStyle}
                          onGenerate={handleGenerate} isGenerating={generationStatus.generating}
                          userReferenceImage={userReferenceImage} setUserReferenceImage={setUserReferenceImage}
                          remainingSlots={remainingSlots} onBuyCredit={() => {}}
                      />
                  )}
              </div>
          )}
          {currentView === 'profile' && <Profile savedAvatars={savedAvatars} onEdit={(a) => { setPrompt(a.prompt); setFeatures(a.features); setAvatarStyle(a.avatarStyle); setCharacterSheet(a.characterSheet); setCharacterDescription(a.description); setCurrentView('create'); }} onUseInGenerator={(a) => { setActiveAvatarForGenerator(a); setCurrentView('generator'); }} refreshAvatars={loadAvatars} />}
          {currentView === 'generator' && <ImageGenerator savedAvatars={savedAvatars} initialAvatar={activeAvatarForGenerator} userEmail={userEmail} />}
       </main>
    </div>
  );
}

export default App;
