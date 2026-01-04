
import React, { useState, useRef } from 'react';
import type { CharacterSheet } from '../types';
import { ZoomableImage } from './ZoomableImage';

interface ResultsDisplayProps {
  characterSheet: CharacterSheet;
  onReset: () => void;
  isAdjusting: boolean;
  setIsAdjusting: (isAdjusting: boolean) => void;
  adjustmentPrompt: string;
  setAdjustmentPrompt: (prompt: string) => void;
  onAdjust: () => void;
  isAdjustingLoading: boolean;
  onSaveToProfile: (name: string) => Promise<void>;
  onGenerateTrainingData: () => void;
  isTraining: boolean;
}

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  characterSheet,
  onReset,
  isAdjusting,
  setIsAdjusting,
  adjustmentPrompt,
  setAdjustmentPrompt,
  onAdjust,
  isAdjustingLoading,
  onSaveToProfile,
  onGenerateTrainingData,
  isTraining
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [avatarName, setAvatarName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSaveClick = async () => {
      if (!avatarName.trim()) return;
      setIsSaving(true);
      try {
          await onSaveToProfile(avatarName);
          setShowSaveModal(false);
          setAvatarName('');
      } catch (e) { alert("Save failed."); }
      finally { setIsSaving(false); }
  };

  const extractPanels = () => {
    const contactSheet = characterSheet['Contact Sheet'];
    if (!contactSheet) return;
    
    setIsExtracting(true);
    const img = new Image();
    img.src = `data:image/jpeg;base64,${contactSheet}`;
    
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // 9 panels in a 3x3 grid
        const panelWidth = img.width / 3;
        const panelHeight = img.height / 3;
        
        canvas.width = panelWidth;
        canvas.height = panelHeight;
        
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                ctx.clearRect(0, 0, panelWidth, panelHeight);
                ctx.drawImage(
                    img, 
                    col * panelWidth, row * panelHeight, panelWidth, panelHeight,
                    0, 0, panelWidth, panelHeight
                );
                
                const panelData = canvas.toDataURL('image/jpeg', 0.95);
                const link = document.createElement('a');
                link.href = panelData;
                link.download = `persona_panel_${row}_${col}.jpg`;
                link.click();
            }
        }
        setIsExtracting(false);
    };
  };

  const portrait = characterSheet['Identity Portrait'];
  const contactSheet = characterSheet['Contact Sheet'];

  // Initial View (Master Portrait only)
  if (!contactSheet) {
      return (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="bg-[#111827]/80 p-10 rounded-[2.5rem] shadow-2xl border border-slate-800/50 backdrop-blur-xl">
                <div className="mb-10 text-center">
                   <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">Digital Persona Synthesized</h2>
                   <p className="text-slate-400">High-fidelity waist-up master portrait generated.</p>
                </div>
                
                <div className="flex flex-col items-center mb-12">
                     <div className="w-full max-w-md space-y-4">
                        <div className="flex items-center gap-3 mb-2 justify-center">
                           <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Master Waist-Up Portrait</h3>
                        </div>
                        <div className="w-full rounded-[2rem] overflow-hidden border border-slate-700 bg-[#0f172a] shadow-2xl relative group">
                            {portrait ? (
                                <div className="aspect-[9/16] relative">
                                    <ZoomableImage src={`data:image/jpeg;base64,${portrait}`} alt="Portrait" className="w-full h-full" />
                                </div>
                            ) : (
                                <div className="aspect-[9/16] flex items-center justify-center text-slate-700">Synthesizing...</div>
                            )}
                        </div>
                     </div>
                </div>

                {isAdjusting ? (
                    <div className="p-8 bg-[#0f172a] rounded-[2rem] border border-cyan-500/20 shadow-2xl animate-slideUp">
                        <h4 className="text-2xl font-bold mb-6 text-cyan-300">Adjust Identity</h4>
                        <textarea 
                            rows={3} 
                            className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-5 text-white focus:ring-2 focus:ring-cyan-500 outline-none mb-8 transition-all" 
                            placeholder="e.g., Change eye color to emerald, soften jawline..." 
                            value={adjustmentPrompt} 
                            onChange={(e) => setAdjustmentPrompt(e.target.value)} 
                        />
                        <div className="flex gap-4">
                            <button onClick={onAdjust} disabled={isAdjustingLoading || !adjustmentPrompt} className="flex-[2] bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-5 px-8 rounded-xl shadow-lg flex items-center justify-center gap-3">
                                {isAdjustingLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Update Master'}
                            </button>
                            <button onClick={() => setIsAdjusting(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-5 px-8 rounded-xl">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                        <button onClick={onReset} className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold py-5 px-10 rounded-2xl">Discard</button>
                        <button onClick={() => setIsAdjusting(true)} className="w-full sm:w-auto border border-cyan-500/30 text-cyan-400 font-bold py-5 px-10 rounded-2xl">Adjust Master</button>
                        <button onClick={onGenerateTrainingData} disabled={isTraining} className="w-full sm:w-auto flex-grow max-w-md bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-5 px-12 rounded-2xl shadow-xl flex items-center justify-center gap-3">
                            {isTraining ? 'Building Grid...' : 'Create 360° Structural Reference'}
                        </button>
                    </div>
                )}
            </div>
        </div>
      );
  }

  // Contact Sheet View (The "DNA Reference")
  return (
    <div className="w-full max-w-7xl mx-auto animate-fadeIn">
      <div className="bg-[#111827]/80 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-800/50 backdrop-blur-xl">
        <div className="text-center mb-16">
           <h2 className="text-5xl font-extrabold text-[#6366f1] tracking-tight mb-4 text-glow">Identity DNA Reference</h2>
           <p className="text-slate-400 text-lg">Complete architectural map for multi-scene consistency</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-4">
                 <h3 className="text-[11px] font-black text-slate-500 mb-5 uppercase tracking-[0.3em] text-center">MASTER</h3>
                 <div className="rounded-[2rem] overflow-hidden border border-slate-700 aspect-[9/16] relative shadow-2xl bg-[#0f172a]">
                    <ZoomableImage src={`data:image/jpeg;base64,${portrait}`} className="w-full h-full object-cover" />
                 </div>
            </div>
            
            <div className="lg:col-span-8">
                 <h3 className="text-[11px] font-black text-slate-500 mb-5 uppercase tracking-[0.3em] text-center">STRUCTURAL GRID</h3>
                 <div className="rounded-[2rem] overflow-hidden border border-slate-700 relative group w-full shadow-2xl bg-[#0f172a]">
                    <ZoomableImage src={`data:image/jpeg;base64,${contactSheet}`} className="w-full h-auto" />
                    <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={extractPanels}
                            disabled={isExtracting}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-black text-[10px] uppercase tracking-widest py-3 px-6 rounded-full backdrop-blur-md shadow-2xl flex items-center gap-2"
                            title="Split into individual panels"
                        >
                            {isExtracting ? 'Extracting...' : 'Extract All Panels'}
                        </button>
                        <button 
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = `data:image/jpeg;base64,${contactSheet}`;
                                link.download = `identity_grid_${Date.now()}.jpg`;
                                link.click();
                            }}
                            className="bg-slate-800/80 hover:bg-slate-700 text-white p-4 rounded-full backdrop-blur-md shadow-2xl flex items-center justify-center"
                            title="Download Full Sheet"
                        >
                            <SaveIcon />
                        </button>
                    </div>
                 </div>
                 <p className="mt-6 text-[10px] text-slate-500 text-center uppercase tracking-widest italic animate-pulse">Zoom in to inspect individual panels or use Extractor above</p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button onClick={onReset} className="w-full sm:w-auto bg-[#334155] hover:bg-[#475569] text-white font-bold py-5 px-12 rounded-2xl transition-all">Start Over</button>
            <button onClick={() => setShowSaveModal(true)} className="w-full sm:w-auto flex-grow max-w-lg bg-[#10b981] hover:bg-[#059669] text-white font-black py-5 px-14 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.02]">
                <SaveIcon />
                Save Blueprint to Profile
            </button>
        </div>
      </div>

      {showSaveModal && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-6 backdrop-blur-md animate-fadeIn">
              <div className="bg-[#1e293b] rounded-[2.5rem] p-10 w-full max-w-md border border-slate-700 shadow-2xl animate-scaleIn">
                  <h3 className="text-3xl font-extrabold text-white mb-2">Finalize Persona</h3>
                  <p className="text-slate-400 mb-8">Lock this identity DNA to your permanent collection.</p>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Identity Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Brazilian Bombshell" 
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-5 text-white focus:ring-2 focus:ring-[#6366f1] mb-10 outline-none transition-all" 
                    value={avatarName} 
                    onChange={e => setAvatarName(e.target.value)} 
                    autoFocus 
                  />
                  <div className="flex gap-4">
                      <button onClick={() => setShowSaveModal(false)} className="flex-1 py-5 rounded-2xl bg-slate-800 hover:bg-slate-700 transition-colors">Cancel</button>
                      <button onClick={handleSaveClick} disabled={!avatarName.trim() || isSaving} className="flex-[2] py-5 rounded-2xl bg-[#6366f1] hover:bg-[#4f46e5] font-black text-white shadow-lg transition-all">
                         {isSaving ? 'Saving...' : 'Save & Lock'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
