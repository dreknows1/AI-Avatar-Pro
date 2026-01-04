
import React, { useState, useCallback } from 'react';
import { transcodeToJpeg } from '../utils/imageUtils';

interface FileDropzoneProps {
  onImageReady: (base64: string) => void;
  currentImage?: string | null;
  onClear?: () => void;
  label?: string;
  heightClass?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ 
  onImageReady, 
  currentImage, 
  onClear, 
  label = "Upload Reference Image",
  heightClass = "h-32"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const jpegData = await transcodeToJpeg(reader.result as string);
          onImageReady(jpegData);
        } catch (err) {
          console.error("Transcoding failed:", err);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onImageReady]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  if (currentImage) {
    return (
      <div className={`relative w-full ${heightClass} bg-gray-900/50 rounded-lg overflow-hidden border border-gray-600 flex items-center justify-center group`}>
        <img src={currentImage} alt="Preview" className="h-full object-contain" />
        {onClear && (
          <button 
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <label 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center w-full ${heightClass} border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
          : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-500'
        }`}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
        {isProcessing ? (
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        ) : (
          <svg className={`w-8 h-8 mb-3 ${isDragging ? 'text-indigo-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        )}
        <p className="text-sm text-slate-400"><span className="font-semibold">{isProcessing ? 'Optimizing...' : label}</span></p>
      </div>
      <input type="file" className="hidden" accept="image/*" onChange={handleInputChange} />
    </label>
  );
};
