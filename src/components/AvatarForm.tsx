
import React from 'react';
import type { Features, AvatarStyle } from '../types';
import { AVATAR_STYLES, BODY_TYPES, AGE_RANGES } from '../constants';
import { FileDropzone } from './FileDropzone';

interface AvatarFormProps {
  features: Features;
  setFeatures: (features: Features) => void;
  avatarStyle: AvatarStyle;
  setAvatarStyle: (style: AvatarStyle) => void;
  onGenerate: () => void;
  onBack: () => void;
  isGenerating: boolean;
  userReferenceImage: string | null;
  setUserReferenceImage: (image: string | null) => void;
}

const FeatureInput: React.FC<{
  name: keyof Features;
  placeholder: string;
  value: string;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ name, placeholder, value, label, onChange }) => (
  <div className="flex flex-col gap-3">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{label}</label>
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-[#0d1117] border border-slate-800 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-700"
    />
  </div>
);

export const AvatarForm: React.FC<AvatarFormProps> = ({
  features, setFeatures, avatarStyle, setAvatarStyle, onGenerate, onBack, isGenerating, userReferenceImage, setUserReferenceImage
}) => {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFeatures({ ...features, [name as keyof Features]: value });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-black text-white mb-2 uppercase tracking-tight">Character DNA</h1>
      </div>

      <div className="bg-[#111827]/60 p-10 md:p-14 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-3xl space-y-16">
        
        {/* 1. REFERENCE IMAGE */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white uppercase tracking-[0.2em]">1. Reference Image</h2>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Optional</span>
          </div>
          <FileDropzone 
            onImageReady={setUserReferenceImage}
            currentImage={userReferenceImage}
            onClear={() => setUserReferenceImage(null)}
            label="Drop Face Reference"
            heightClass="h-48"
          />
        </section>

        {/* 2. STYLE ENGINE */}
        <section className="space-y-6">
          <h2 className="text-lg font-black text-white uppercase tracking-[0.2em]">2. Style Engine</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {AVATAR_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => setAvatarStyle(style.id)}
                className={`py-5 px-6 rounded-2xl border-2 text-xs font-black transition-all uppercase tracking-widest ${
                  avatarStyle === style.id 
                    ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-[0_0_25px_rgba(99,102,241,0.2)]' 
                    : 'border-slate-800 bg-[#0d1117] text-slate-500 hover:border-slate-700'
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>
        </section>

        {/* 3. NARRATIVE BLUEPRINT */}
        <section className="space-y-6">
          <h2 className="text-lg font-black text-white uppercase tracking-[0.2em]">3. Narrative Blueprint</h2>
          <textarea
            name="description"
            rows={5}
            value={features.description}
            onChange={handleInputChange}
            className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl p-6 text-white text-base focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-700 resize-none leading-relaxed"
            placeholder="Describe the overall vibe, setting, and personality... e.g. A high-fashion model posing on a balcony in Milan, cinematic sunset lighting..."
          />
        </section>

        {/* 4. FORENSIC CALIBRATION */}
        <section className="space-y-10">
          <h2 className="text-lg font-black text-[#6366f1] uppercase tracking-[0.2em] border-b border-white/5 pb-4">4. Forensic Calibration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Subject Age Range</label>
              <select
                name="age"
                value={features.age}
                onChange={handleInputChange}
                className="w-full bg-[#0d1117] border border-slate-800 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
              >
                {AGE_RANGES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <FeatureInput 
              label="Gender Identity" 
              name="gender" 
              placeholder="e.g. Female, Male, Non-binary" 
              value={features.gender} 
              onChange={handleInputChange} 
            />

            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Body Build</label>
              <select
                name="build"
                value={features.build}
                onChange={handleInputChange}
                className="w-full bg-[#0d1117] border border-slate-800 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
              >
                {BODY_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </div>

            <FeatureInput 
              label="Cultural Background & Heritage" 
              name="culture" 
              placeholder="e.g. Yoruba Nigerian, Afro-Brazilian" 
              value={features.culture} 
              onChange={handleInputChange} 
            />

            <FeatureInput 
              label="Eye Color / Detail" 
              name="eyes" 
              placeholder="e.g. Hazel, Dark Brown, Green" 
              value={features.eyes} 
              onChange={handleInputChange} 
            />

            <FeatureInput 
              label="Hair Type & Style" 
              name="hair" 
              placeholder="e.g. Long wavy brown, Short Fade" 
              value={features.hair} 
              onChange={handleInputChange} 
            />

            <FeatureInput 
              label="Complexion" 
              name="complexion" 
              placeholder="e.g. Deep mahogany, Fair with freckles" 
              value={features.complexion} 
              onChange={handleInputChange} 
            />

            <FeatureInput 
              label="Distinguishing Features" 
              name="distinguishingFeatures" 
              placeholder="e.g. Mole on cheek, Scar over eye" 
              value={features.distinguishingFeatures} 
              onChange={handleInputChange} 
            />
          </div>

          <FeatureInput 
            label="Clothing & Accessories" 
            name="clothing" 
            placeholder="e.g. White hoodie, Golden hoop earrings, Cyberpunk armor" 
            value={features.clothing} 
            onChange={handleInputChange} 
          />
        </section>

        <div className="flex items-center justify-center gap-6 pt-10">
          <button 
            onClick={onBack}
            className="py-5 px-10 border border-slate-700 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
          >
            Back
          </button>
          <button 
            onClick={onGenerate}
            disabled={isGenerating || !features.description}
            className="flex-grow py-5 px-10 bg-[#008080] hover:bg-[#006666] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all disabled:opacity-50"
          >
            {isGenerating ? 'Synthesizing DNA...' : 'Generate Preview'}
          </button>
        </div>
        
        <div className="text-center">
          <button 
            onClick={() => window.aistudio.openSelectKey()} 
            className="text-[10px] text-slate-500 hover:text-white transition-colors underline uppercase tracking-widest font-black"
          >
            Change API Key
          </button>
        </div>
      </div>
    </div>
  );
};
