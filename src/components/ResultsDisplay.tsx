
import React, { useState } from 'react';
import { ZoomableImage } from './ZoomableImage';

interface ResultsDisplayProps {
  videoUrl: string;
  imageUrl: string;
  onReset: () => void;
  onSaveToProfile: (name: string) => Promise<void>;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  videoUrl,
  imageUrl,
  onReset,
  onSaveToProfile
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [avatarName, setAvatarName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 animate-fadeIn pb-32 pt-8">
        <div className="bg-[#0a0f1d] p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-800 backdrop-blur-3xl">
            <div className="text-center mb-12">
               <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Sequence Synthesis Complete</h2>
               <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Cinematic Veo Motion & 2K Portrait Output</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
                {/* CINEMATIC VIDEO DISPLAY */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2 justify-center">
                       <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Veo Motion Capture</h3>
                    </div>
                    <div className="aspect-video rounded-[2rem] overflow-hidden border border-slate-800 bg-black shadow-2xl relative ring-1 ring-slate-700/50">
                        <video 
                            src={videoUrl} 
                            controls 
                            autoPlay 
                            loop 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* MASTER PORTRAIT DISPLAY */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2 justify-center">
                       <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Master Identity Portrait</h3>
                    </div>
                    <div className="aspect-[9/16] max-h-[600px] mx-auto rounded-[2rem] overflow-hidden border border-slate-800 bg-black shadow-2xl relative ring-1 ring-slate-700/50">
                        <ZoomableImage src={`data:image/jpeg;base64,${imageUrl}`} className="w-full h-full" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8 border-t border-slate-800">
                <button 
                    onClick={onReset} 
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-black py-6 px-12 rounded-2xl uppercase tracking-widest text-[10px]"
                >
                    Discard & Retry
                </button>
                <button 
                    onClick={() => setShowSaveModal(true)} 
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black py-6 px-16 rounded-2xl shadow-2xl uppercase tracking-widest text-xs transition-transform hover:scale-105"
                >
                    Secure Identity to Vault
                </button>
            </div>
        </div>

        {showSaveModal && (
            <div className="fixed inset-0 bg-black/98 flex items-center justify-center z-50 p-6 backdrop-blur-2xl animate-fadeIn">
                <div className="bg-[#0a0f1d] rounded-[3.5rem] p-12 w-full max-w-md border border-slate-800 shadow-2xl">
                    <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter">Seal Identity</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-10">Archiving motion DNA and master portrait sequence.</p>
                    <input 
                        type="text" 
                        placeholder="Assign Identity Tag..." 
                        className="w-full bg-black border border-slate-800 rounded-2xl p-6 text-white outline-none mb-12 transition-all placeholder-slate-800" 
                        value={avatarName} 
                        onChange={e => setAvatarName(e.target.value)} 
                        autoFocus 
                    />
                    <div className="flex gap-4">
                        <button onClick={() => setShowSaveModal(false)} className="flex-1 py-6 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[9px]">Abort</button>
                        <button onClick={async () => {
                            setIsSaving(true);
                            await onSaveToProfile(avatarName);
                            setIsSaving(false);
                            setShowSaveModal(false);
                        }} disabled={!avatarName.trim() || isSaving} className="flex-[2] py-6 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[9px]">
                            {isSaving ? 'Sealing...' : 'Confirm Sealing'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
