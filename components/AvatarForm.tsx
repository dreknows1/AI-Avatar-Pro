
import React, { useState } from 'react';
import type { AvatarStyle, Features, Gender, BodyType } from '../types';
import { AVATAR_STYLES, GENDERS, BODY_TYPES, BODY_TYPE_VISUALS, DISTINGUISHING_FEATURES, PRICE_PER_AVATAR } from '../constants';
import { FileDropzone } from './FileDropzone';

interface AvatarFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  features: Features;
  setFeatures: (features: Features) => void;
  avatarStyle: AvatarStyle;
  setAvatarStyle: (style: AvatarStyle) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  userReferenceImage: string | null;
  setUserReferenceImage: (image: string | null) => void;
  remainingSlots: number;
  onBuyCredit: () => void;
}

const FeatureInput: React.FC<{
  name: keyof Omit<Features, 'build' | 'gender' | 'distinguishingFeature'>;
  placeholder: string;
  value: string;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ name, placeholder, value, label, onChange }) => (
  <div className="flex flex-col gap-2.5">
    <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">{label}</label>
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-[#0a0f1d] border border-slate-700/80 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1] outline-none transition-all placeholder-slate-600 shadow-inner"
    />
  </div>
);

export const AvatarForm: React.FC<AvatarFormProps> = ({
  prompt, setPrompt, features, setFeatures, avatarStyle, setAvatarStyle,
  onGenerate, isGenerating, userReferenceImage, setUserReferenceImage, remainingSlots, onBuyCredit
}) => {
  const [previewBodyType, setPreviewBodyType] = useState<BodyType | null>(null);

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeatures({ ...features, [e.target.name]: e.target.value });
  };

  const handleFeatureSelect = <T extends keyof Features>(name: T, value: Features[T]) => {
    setFeatures({ ...features, [name]: value });
  };

  const isLimitReached = remainingSlots <= 0;

  return (
    <div className="w-full max-w-3xl bg-[#111827]/90 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
      <div className={`space-y-12 ${isLimitReached ? 'opacity-20 pointer-events-none filter blur-md' : ''}`}>
        
        {/* 1. Reference Image */}
        <section>
          <div className="flex items-center justify-between mb-5">
             <label className="text-sm font-black text-white uppercase tracking-[0.25em]">1. Reference Image</label>
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Optional</span>
          </div>
          <FileDropzone 
            onImageReady={setUserReferenceImage}
            currentImage={userReferenceImage}
            onClear={() => setUserReferenceImage(null)}
            label="Drop Face Reference"
            heightClass="h-44"
          />
        </section>

        {/* 2. Style Selection */}
        <section>
          <label className="block text-sm font-black text-white mb-6 uppercase tracking-[0.25em]">2. Style Engine</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
            {AVATAR_STYLES.map(style => (
              <button
                key={style}
                onClick={() => setAvatarStyle(style)}
                className={`py-4 px-4 rounded-xl border-2 text-xs font-black transition-all uppercase tracking-widest ${
                  avatarStyle === style 
                    ? 'border-[#6366f1] bg-[#6366f1]/10 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                    : 'border-slate-800 bg-[#0a0f1d] text-slate-500 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </section>

        {/* 3. Main Description */}
        <section>
          <label className="block text-sm font-black text-white mb-6 uppercase tracking-[0.25em]">3. Narrative Blueprint</label>
          <textarea
            rows={4}
            className="w-full bg-[#0a0f1d] border border-slate-700/80 rounded-[1.5rem] p-6 text-white text-base focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1] outline-none transition-all resize-none placeholder-slate-600 shadow-inner leading-relaxed"
            placeholder="Describe the overall vibe, setting, and personality... e.g. A high-fashion model posing on a balcony in Milan, cinematic sunset lighting..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </section>

        {/* 4. Character Details */}
        <section className="space-y-10">
          <label className="block text-sm font-black text-[#6366f1] uppercase tracking-[0.25em] border-b border-slate-800 pb-4">4. Forensic Calibration</label>
          
          <div className="grid grid-cols-2 gap-8">
            <FeatureInput label="Subject Age" name="age" placeholder="e.g. 24 (Early 20s)" value={features.age} onChange={handleFeatureChange} />
            <FeatureInput label="Nationality" name="ethnicity" placeholder="e.g. Brazilian / Italian Descent" value={features.ethnicity} onChange={handleFeatureChange} />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 ml-1">Gender Identity</label>
            <div className="grid grid-cols-3 gap-3.5">
              {GENDERS.map(g => (
                <button
                  key={g}
                  onClick={() => handleFeatureSelect('gender', g)}
                  className={`py-4 rounded-xl border-2 text-xs font-black transition-all uppercase tracking-widest ${
                    features.gender === g 
                      ? 'border-[#6366f1] bg-[#6366f1]/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                      : 'border-slate-800 bg-[#0a0f1d] text-slate-500 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-5 ml-1">Anatomical Build</label>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 flex-grow">
                {BODY_TYPES.map(bt => (
                  <button
                    key={bt}
                    onClick={() => handleFeatureSelect('build', bt)}
                    onMouseEnter={() => setPreviewBodyType(bt)}
                    onMouseLeave={() => setPreviewBodyType(null)}
                    className={`py-5 rounded-xl border-2 text-[10px] font-black transition-all uppercase tracking-widest ${
                      features.build === bt 
                        ? 'border-[#6366f1] bg-[#6366f1]/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                        : 'border-slate-800 bg-[#0a0f1d] text-slate-500 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
              <div className="w-full md:w-36 h-52 bg-[#0a0f1d] border border-slate-800 rounded-2xl flex items-center justify-center p-6 text-[#6366f1] shadow-2xl group transition-all">
                <div className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity" 
                  dangerouslySetInnerHTML={{ __html: BODY_TYPE_VISUALS[previewBodyType ?? features.build] }} 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
            <FeatureInput label="Hair Details" name="hair" placeholder="e.g. Waist-length raven black, sleek and glossy" value={features.hair} onChange={handleFeatureChange} />
            <FeatureInput label="Iris Calibration" name="eyes" placeholder="e.g. Piercing hazel with golden flecks" value={features.eyes} onChange={handleFeatureChange} />
            <FeatureInput label="Skin Complexion" name="skin" placeholder="e.g. Sun-kissed olive with natural texture" value={features.skin} onChange={handleFeatureChange} />
            <FeatureInput label="Mandatory Clothing" name="clothing" placeholder="e.g. Minimalist black string bikini" value={features.clothing} onChange={handleFeatureChange} />
          </div>

          <div className="pt-8 border-t border-slate-800">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2.5">
                   <label className="block text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1 ml-1">Distinguishing Feature</label>
                   <select 
                      value={features.distinguishingFeature}
                      onChange={(e) => handleFeatureSelect('distinguishingFeature', e.target.value)}
                      className="w-full bg-[#0a0f1d] border border-slate-700/80 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-[#6366f1]/50 outline-none appearance-none cursor-pointer"
                   >
                      {DISTINGUISHING_FEATURES.map(f => <option key={f} value={f} className="bg-[#111827]">{f}</option>)}
                   </select>
                </div>
                {features.distinguishingFeature !== 'None' && (
                  <FeatureInput 
                    label="Placement Zone" 
                    name="distinguishingFeaturePlacement" 
                    placeholder="e.g. Upper left cheekbone, right collarbone" 
                    value={features.distinguishingFeaturePlacement} 
                    onChange={handleFeatureChange} 
                  />
                )}
             </div>
          </div>
        </section>

        <button
          onClick={onGenerate}
          disabled={isGenerating || !prompt}
          className="w-full py-7 px-4 bg-gradient-to-r from-[#6366f1] to-[#0ea5e9] hover:from-[#4f46e5] hover:to-[#0284c7] text-white rounded-2xl font-black text-xl uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(99,102,241,0.25)] transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-4"
        >
          {isGenerating ? 'Synthesizing...' : 'Start Creation Flow'}
        </button>
      </div>

      {isLimitReached && (
        <div className="absolute inset-0 bg-[#0f172a]/98 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-12 text-center animate-fadeIn">
          <div className="w-24 h-24 bg-[#6366f1]/10 rounded-3xl flex items-center justify-center mb-8 border border-[#6366f1]/20 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
             <svg className="w-12 h-12 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h3 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Quota Locked</h3>
          <p className="text-slate-400 mb-12 max-w-sm text-lg leading-relaxed">Upgrade your account to unlock professional character slots and advanced training modules.</p>
          <button onClick={onBuyCredit} className="bg-gradient-to-r from-[#6366f1] to-[#0ea5e9] text-white font-black py-6 px-14 rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center gap-4 uppercase tracking-widest">
            <span>Unlock Slot</span>
            <span className="bg-black/30 px-4 py-1 rounded-lg text-sm">${PRICE_PER_AVATAR}</span>
          </button>
        </div>
      )}
    </div>
  );
};
