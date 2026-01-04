
import React, { useState, useEffect } from 'react';
import { StyleSelection } from './components/StyleSelection';
import { AvatarForm } from './components/AvatarForm';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Navigation } from './components/Navigation';
import { Profile } from './components/Profile';
import { ImageGenerator } from './components/ImageGenerator';
import { Login } from './components/Login';
import { MAX_FREE_AVATARS } from './constants';
import * as geminiService from './services/geminiService';
import * as storageService from './services/storageService';
import type {
  AvatarStyle,
  Features,
  GenerationStatus,
  SavedAvatar,
} from './types';

type View = 'create' | 'profile' | 'generator';
type Step = 'style' | 'dna' | 'results';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('biam_user_email') !== null);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('biam_user_email') || '');
  
  const [apiKeySelected, setApiKeySelected] = useState(true);
  
  const [currentView, setCurrentView] = useState<View>('create');
  const [currentStep, setCurrentStep] = useState<Step>('style');
  const [savedAvatars, setSavedAvatars] = useState<SavedAvatar[]>([]);
  const [activeAvatarForGenerator, setActiveAvatarForGenerator] = useState<SavedAvatar | null>(null);
  const [purchasedSlots, setPurchasedSlots] = useState<number>(0);
  
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('Realistic');
  const [features, setFeatures] = useState<Features>({
    description: '', age: 'Select Age Range', gender: '', build: 'Average', culture: '', eyes: '', hair: '', complexion: '', distinguishingFeatures: '', clothing: ''
  });
  const [userReferenceImage, setUserReferenceImage] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    generating: false, message: '', progress: 0, error: null, phase: 'idle'
  });
  
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [finalDescription, setFinalDescription] = useState<string>('');

  const loadAvatars = async () => {
    const allAvatars = await storageService.getSavedAvatars();
    const userAvatars = allAvatars.filter(avatar => !avatar.userEmail || avatar.userEmail === userEmail);
    setSavedAvatars(userAvatars);
  };

  const checkApiKey = async () => {
      if ((window as any).aistudio) {
          try {
              const hasKey = await (window as any).aistudio.hasSelectedApiKey();
              if (!hasKey && !process.env.API_KEY) setApiKeySelected(false);
          } catch (e) { console.error(e); }
      }
  };

  useEffect(() => {
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
    setCurrentStep('style');
  };

  const handleSelectStyle = (style: AvatarStyle) => {
    setAvatarStyle(style);
    setCurrentStep('dna');
  };

  const isAdmin = userEmail.toLowerCase() === 'dreknows@gmail.com';
  const remainingSlots = isAdmin ? 9999 : Math.max(0, (MAX_FREE_AVATARS + purchasedSlots) - savedAvatars.length);

  const handleGenerate = async () => {
    if (remainingSlots <= 0) return;
    setResultVideoUrl(null);
    setResultImageUrl(null);
    
    setGenerationStatus({ 
        generating: true, 
        message: 'Synthesizing Narrative Blueprint...', 
        progress: 5, 
        error: null,
        phase: 'video'
    });

    try {
        const desc = await geminiService.generateCharacterDescription(features, avatarStyle);
        setFinalDescription(desc);

        setGenerationStatus(prev => ({ ...prev, message: 'Veo is rendering cinematic motion...', progress: 15 }));
        const videoUrl = await geminiService.generateAvatarVideo(desc, (msg) => {
            setGenerationStatus(prev => ({ ...prev, message: msg }));
        });
        setResultVideoUrl(videoUrl);

        setGenerationStatus({ 
            generating: true, 
            message: 'Synthesizing Master waist-up portrait (2K)...', 
            progress: 80, 
            error: null,
            phase: 'image'
        });
        const imageBase64 = await geminiService.generateAvatarImage(desc, avatarStyle, features, userReferenceImage);
        setResultImageUrl(imageBase64);

        setGenerationStatus({ generating: false, message: 'Identity Locked.', progress: 100, error: null, phase: 'idle' });
        setCurrentStep('results');
    } catch (error: any) {
        if (error.message.includes("Requested entity was not found") || error.message.includes("API Key")) {
           setApiKeySelected(false);
        }
        setGenerationStatus({ generating: false, message: '', progress: 0, error: error.message || "An unexpected error occurred.", phase: 'idle' });
    }
  };

  const handleSaveToProfile = async (name: string) => {
      if (!resultImageUrl || !resultVideoUrl) return;
      try {
        const newAvatar: SavedAvatar = {
            id: Date.now().toString(),
            userEmail, name, createdAt: Date.now(),
            description: finalDescription,
            features, avatarStyle, 
            image: resultImageUrl,
            videoUrl: resultVideoUrl,
            prompt: features.description,
        };
        await storageService.saveAvatar(newAvatar);
        setSavedAvatars(prev => [newAvatar, ...prev]);
        setCurrentView('profile');
      } catch (error: any) { 
          alert(error.message);
      }
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#050810] text-gray-100 font-sans pb-20 selection:bg-indigo-500/30">
       <Navigation 
         currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout}
         userEmail={userEmail} purchasedSlots={purchasedSlots} avatarsCreated={savedAvatars.length}
       />
       <main className="container mx-auto">
          {!apiKeySelected && (
            <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-xl">
               <div className="bg-[#111827] p-12 rounded-[3rem] border border-indigo-500/30 text-center max-w-md">
                 <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">API Access Required</h2>
                 <p className="text-slate-400 mb-10 text-sm leading-relaxed">To use Gemini 3 Pro and Veo models, you must select your own paid API key from AI Studio.</p>
                 <button 
                  onClick={() => window.aistudio.openSelectKey().then(() => setApiKeySelected(true))}
                  className="w-full bg-[#008080] py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#006666] transition-all"
                 >
                   Select API Key
                 </button>
               </div>
            </div>
          )}

          {currentView === 'create' && (
              <div className="flex flex-col items-center">
                  {generationStatus.generating ? (
                    <div className="pt-32 w-full flex justify-center">
                      <LoadingIndicator status={generationStatus} />
                    </div>
                  ) : currentStep === 'style' ? (
                    <StyleSelection onSelectStyle={handleSelectStyle} />
                  ) : currentStep === 'dna' ? (
                    <AvatarForm 
                      features={features} 
                      setFeatures={setFeatures} 
                      avatarStyle={avatarStyle}
                      setAvatarStyle={setAvatarStyle}
                      onGenerate={handleGenerate} 
                      onBack={() => setCurrentStep('style')}
                      isGenerating={generationStatus.generating}
                      userReferenceImage={userReferenceImage} 
                      setUserReferenceImage={setUserReferenceImage}
                    />
                  ) : (
                    <ResultsDisplay 
                      videoUrl={resultVideoUrl!}
                      imageUrl={resultImageUrl!}
                      onReset={() => {
                        setCurrentStep('style');
                        setResultVideoUrl(null);
                        setResultImageUrl(null);
                      }}
                      onSaveToProfile={handleSaveToProfile}
                    />
                  )}
              </div>
          )}
          {currentView === 'profile' && (
            <div className="pt-8">
              <Profile 
                savedAvatars={savedAvatars} 
                onEdit={(a) => { 
                    setFeatures(a.features); 
                    setAvatarStyle(a.avatarStyle); 
                    setCurrentStep('dna'); 
                    setCurrentView('create'); 
                }} 
                onUseInGenerator={(a) => { 
                    setActiveAvatarForGenerator(a); 
                    setCurrentView('generator'); 
                }} 
                refreshAvatars={loadAvatars} 
              />
            </div>
          )}
          {currentView === 'generator' && (
            <div className="pt-8">
              <ImageGenerator savedAvatars={savedAvatars} initialAvatar={activeAvatarForGenerator} userEmail={userEmail} />
            </div>
          )}
       </main>
    </div>
  );
}

export default App;
