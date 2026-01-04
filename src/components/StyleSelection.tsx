
import React from 'react';
import { AVATAR_STYLES } from '../constants';
import { AvatarStyle } from '../types';

interface StyleSelectionProps {
  onSelectStyle: (style: AvatarStyle) => void;
}

export const StyleSelection: React.FC<StyleSelectionProps> = ({ onSelectStyle }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-16 animate-fadeIn">
      <div className="text-center mb-20">
        <h1 className="text-6xl font-black text-white mb-6 uppercase tracking-tight">Select Your Avatar Style</h1>
        <p className="text-2xl text-slate-400 font-medium opacity-80">Choose the aesthetic for your digital twin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {AVATAR_STYLES.map((style) => (
          <div 
            key={style.id}
            onClick={() => onSelectStyle(style.id)}
            className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-white/5 bg-[#1a1a1a] transition-all duration-500 hover:border-indigo-500/50 hover:scale-[1.03] hover:shadow-[0_0_80px_rgba(99,102,241,0.15)]"
          >
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img 
                src={style.image} 
                alt={style.name} 
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="p-10 text-center bg-gradient-to-t from-black/90 to-[#1a1a1a]">
              <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                {style.name}
              </h3>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">
                {style.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
