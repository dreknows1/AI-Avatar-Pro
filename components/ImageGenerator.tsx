
import React, { useState, useEffect } from 'react';
import type { SavedAvatar, GenerationStatus, AspectRatio } from '../types';
import { LOADING_MESSAGES } from '../constants';
import * as geminiService from '../services/geminiService';
import { ZoomableImage } from './ZoomableImage';

interface ImageGeneratorProps {
  savedAvatars: SavedAvatar[];
  initialAvatar?: SavedAvatar | null;
  userEmail: string;
}

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '3:4', '4:3', '16:9', '9:16'];

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ savedAvatars, initialAvatar, userEmail }) => {
  const [selectedAvatarIds, setSelectedAvatarIds] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [characterAssets, setCharacterAssets] = useState<Record<string, string | null>>({});
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>({ generating: false, message: '', progress: 0, error: null });
  
  useEffect(() => {
      if (initialAvatar) {
          setSelectedAvatarIds([initialAvatar.id]);
      } else if (savedAvatars.length > 0 && selectedAvatarIds.length === 0) {
          setSelectedAvatarIds([savedAvatars[0].id]);
      }
  }, [initialAvatar, savedAvatars]);

  const toggleAvatarSelection = (id: string) => {
      setSelectedAvatarIds(prev => prev.includes(id) ? (prev.length === 1 ? prev : prev.filter(a => a !== id)) : [...prev, id]);
  };

  const handleAssetUpload = (avatarId: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setCharacterAssets(prev => ({ ...prev, [avatarId]: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const clearAsset = (avatarId: string) => {
      setCharacterAssets(prev => {
          const newState = { ...prev };
          delete newState[avatarId];
          return newState;
      });
  };

  const handleGenerateVisual = async () => {
    if (selectedAvatarIds.length === 0 || !prompt) return;
    const activeAvatars = savedAvatars.filter(a => selectedAvatarIds.includes(a.id));
    if (activeAvatars.length === 0) return;

    setGeneratedImage(null);
    setStatus({ generating: true, message: `Mapping DNA and Asset references...`, progress: 5, error: null });

    try {
        const result = await geminiService.generateMultiCharacterImage(
            activeAvatars,
            prompt,
            activeAvatars[0].avatarStyle,
            userEmail,
            aspectRatio,
            characterAssets
        );
        setGeneratedImage(result);
        setStatus({ generating: false, message: 'Done!', progress: 100, error: null });
    } catch (error: any) {
        setStatus({ generating: false, message: '', progress: 0, error: error.message || "An unexpected error occurred." });
    }
  };

  const activeAvatarsForDisplay = savedAvatars.filter(a => selectedAvatarIds.includes(a.id));
  const currentStyleDisplay = activeAvatarsForDisplay.length > 0 ? activeAvatarsForDisplay[0].avatarStyle : 'None';

  return (
    <div className="w-full max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-[#111827]/80 p-8 rounded-[2rem] border border-slate-800/50 shadow-2xl h-full flex flex-col space-y-8">
            <h2 className="text-3xl font-extrabold text-[#6366f1]">Cast & Scene</h2>
            
            <div className="flex-grow space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                <div>
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Select Characters</label>
                    <div className="grid grid-cols-2 gap-3">
                        {savedAvatars.map(avatar => {
                            const isSelected = selectedAvatarIds.includes(avatar.id);
                            const thumb = avatar.characterSheet['Identity Portrait'];
                            const asset = characterAssets[avatar.id];

                            return (
                                <div 
                                    key={avatar.id} 
                                    className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col gap-3 ${isSelected ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'border-slate-800 bg-[#0f172a] opacity-50 hover:opacity-100 hover:border-slate-700'}`}
                                >
                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleAvatarSelection(avatar.id)}>
                                        <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700 shadow-inner">
                                            {thumb && <img src={`data:image/jpeg;base64,${thumb}`} className="w-full h-full object-cover" alt={avatar.name} />}
                                        </div>
                                        <span className={`text-xs font-black truncate max-w-[60px] ${isSelected ? 'text-white' : 'text-slate-500'}`}>{avatar.name}</span>
                                        {isSelected && <div className="ml-auto w-2 h-2 bg-cyan-500 rounded-full"></div>}
                                    </div>

                                    {isSelected && (
                                        <div className="space-y-2 pt-2 border-t border-slate-700/50">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Outfit/Object Asset</p>
                                            {asset ? (
                                                <div className="relative w-full h-20 rounded-xl border border-slate-700 overflow-hidden bg-black/40 group">
                                                    <img src={asset} className="w-full h-full object-contain" alt="asset" />
                                                    <button 
                                                        onClick={() => clearAsset(avatar.id)}
                                                        className="absolute top-1 right-1 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all scale-75"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="w-full h-20 rounded-xl border-2 border-dashed border-slate-700/50 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group">
                                                    <svg className="w-4 h-4 text-slate-600 group-hover:text-cyan-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                    <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Attach</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleAssetUpload(avatar.id, e)} />
                                                </label>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Style Lock</label>
                    <div className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-4 text-white text-sm flex items-center justify-between">
                        <span className="font-black tracking-wide">{currentStyleDisplay}</span>
                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">LOCKED</span>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Layout</label>
                    <div className="grid grid-cols-5 gap-2">
                        {ASPECT_RATIOS.map(ratio => (
                            <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`py-2 text-[10px] font-black rounded-lg border transition-all ${aspectRatio === ratio ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-900/20' : 'bg-[#0f172a] border-slate-800 text-slate-500 hover:border-slate-700'}`}>{ratio}</button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Scene Description</label>
                    <textarea 
                      value={prompt} 
                      onChange={(e) => setPrompt(e.target.value)} 
                      placeholder="e.g. they are both having lunch at a fancy restaurant..." 
                      className="w-full h-32 bg-[#0f172a] border border-slate-800 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-[#6366f1] outline-none resize-none shadow-inner placeholder-slate-700" 
                    />
                </div>
            </div>
            
            <button onClick={handleGenerateVisual} disabled={status.generating || !prompt || selectedAvatarIds.length === 0} className="w-full py-5 bg-gradient-to-r from-cyan-600 to-[#6366f1] hover:from-cyan-500 hover:to-[#4f46e5] text-white font-black rounded-xl disabled:opacity-50 transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] uppercase tracking-[0.1em]">
                {status.generating ? 'Generating Scene...' : 'Create Image'}
            </button>
        </div>
      </div>

      <div className="lg:col-span-2">
         <div className="bg-[#0f172a]/50 rounded-[2.5rem] border border-slate-800/50 flex flex-col items-center justify-center min-h-[700px] relative overflow-hidden p-6 h-full shadow-inner">
            {status.generating ? (
                 <div className="text-center space-y-8 animate-fadeIn">
                     <div className="w-20 h-20 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin mx-auto shadow-[0_0_30px_rgba(6,182,212,0.2)]"></div>
                     <p className="text-cyan-400 font-black tracking-widest uppercase animate-pulse">{status.message}</p>
                 </div>
             ) : status.error ? (
                 <div className="text-center max-w-md p-10 bg-red-900/10 border border-red-500/20 rounded-[2rem] shadow-2xl">
                    <h3 className="text-2xl font-black text-red-400 mb-4 uppercase">Generation Blocked</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{status.error}</p>
                 </div>
             ) : generatedImage ? (
                 <div className="relative w-full h-full flex items-center justify-center animate-fadeIn group">
                     <ZoomableImage src={`data:image/jpeg;base64,${generatedImage}`} className="w-full h-full max-h-[85vh] rounded-2xl shadow-2xl" />
                     <button onClick={() => {
                        const link = document.createElement('a');
                        link.href = `data:image/jpeg;base64,${generatedImage}`;
                        link.download = `avatar_studio_${Date.now()}.jpg`;
                        link.click();
                     }} className="absolute bottom-6 right-6 bg-slate-800/90 hover:bg-slate-700 text-white p-4 rounded-full backdrop-blur-sm z-10 shadow-2xl transition-all scale-0 group-hover:scale-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                     </button>
                 </div>
             ) : (
                 <div className="text-center space-y-6 max-w-sm">
                     <div className="w-24 h-24 bg-slate-800/30 rounded-full flex items-center justify-center mx-auto border border-slate-700/50 shadow-inner">
                        <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     </div>
                     <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Image Studio Ready</p>
                     <p className="text-slate-600 text-[10px] font-bold leading-relaxed uppercase tracking-wider">Select your cast from My Profile, attach outfits/assets, and describe your scenario to synthesize a scene.</p>
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};
