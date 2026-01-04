
import React from 'react';
import type { SavedAvatar } from '../types';
import { deleteAvatar } from '../services/storageService';

interface ProfileProps {
  savedAvatars: SavedAvatar[];
  onEdit: (avatar: SavedAvatar) => void;
  onUseInGenerator: (avatar: SavedAvatar) => void;
  refreshAvatars: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ savedAvatars, onEdit, onUseInGenerator, refreshAvatars }) => {

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this avatar?")) {
        try {
            await deleteAvatar(id);
            refreshAvatars();
        } catch (error) {
            console.error("Failed to delete avatar:", error);
            alert("Could not delete avatar.");
        }
    }
  };

  const downloadDNA = (avatar: SavedAvatar) => {
      // Fix: identityDNA is now correctly typed in src/types.ts
      if (!avatar.identityDNA) {
          alert("No DNA data available for this model.");
          return;
      }
      const dataStr = JSON.stringify(avatar.identityDNA, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `${avatar.name.replace(/\s+/g, '_')}_dna.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
  };

  if (savedAvatars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-300 mb-2">No Models Saved Yet</h2>
        <p className="text-gray-500 max-w-md">
            Go to the Creator tab, generate a character, and save to start your collection.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl p-4 sm:p-6">
      <h2 className="text-3xl font-bold text-white mb-8 border-b border-gray-700 pb-4">My Trained Models</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {savedAvatars.map((avatar) => {
          // Fix: Use avatar.image directly instead of characterSheet to match the updated src structure.
          const mainImage = avatar.image;

          return (
            <div key={avatar.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg flex flex-col hover:border-purple-500/50 transition-colors duration-300">
                <div className="relative aspect-[9/16] bg-gray-900 group">
                    {mainImage ? (
                         <img 
                            src={`data:image/jpeg;base64,${mainImage}`} 
                            alt={avatar.name} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                    )}
                   
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                        <button 
                            onClick={() => onUseInGenerator(avatar)}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg"
                        >
                            Generate Images
                        </button>
                        <button 
                            onClick={() => downloadDNA(avatar)}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Export DNA
                        </button>
                        <button 
                            onClick={() => onEdit(avatar)}
                            className="w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            Retrain / Edit
                        </button>
                    </div>
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white truncate pr-2">{avatar.name}</h3>
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-600">{avatar.avatarStyle}</span>
                    </div>
                    
                    <div className="mb-2">
                         <span className="text-[10px] text-green-400 flex items-center gap-1 uppercase tracking-wide font-bold">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Trained Model
                         </span>
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-2 mb-4 flex-grow" title={avatar.prompt}>
                        {avatar.prompt}
                    </p>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-700/50 mt-auto">
                        <span className="text-xs text-gray-500">
                            {new Date(avatar.createdAt).toLocaleDateString()}
                        </span>
                        <button 
                            onClick={() => handleDelete(avatar.id)}
                            className="text-red-400 hover:text-red-300 text-xs hover:underline"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
