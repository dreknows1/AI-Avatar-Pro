
import React, { useState, useRef, useEffect } from 'react';

interface ZoomableImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt, className = '' }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setScale(prevScale => {
            const scaleFactor = -e.deltaY * 0.002; 
            let newScale = prevScale + scaleFactor;
            if (newScale < 1.05 && scaleFactor < 0) newScale = 1;
            // Increased max scale to 8x for forensic inspection
            return Math.min(Math.max(1, newScale), 8); 
        });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => { container.removeEventListener('wheel', onWheel); };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault(); 
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => { setIsDragging(false); };

  useEffect(() => {
      if (scale === 1) { setPosition({ x: 0, y: 0 }); }
  }, [scale]);

  useEffect(() => {
      setScale(1);
      setPosition({ x: 0, y: 0 });
  }, [src]);

  return (
    <div 
        ref={containerRef}
        className={`relative overflow-hidden ${className} ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ touchAction: 'none' }}
    >
      <img 
        src={src} 
        alt={alt}
        className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-75 ease-out will-change-transform"
        style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center'
        }}
        draggable={false}
      />
      
      {scale > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
             <div className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-2xl flex items-center gap-4">
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">{Math.round(scale)}X ZOOM</span>
                 <button 
                    onClick={(e) => { e.stopPropagation(); setScale(1); }}
                    className="text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                 >
                    RESET
                 </button>
             </div>
        </div>
      )}
      
      {scale === 1 && (
          <div className="absolute inset-0 flex items-end justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="bg-black/50 text-white text-[10px] font-black px-4 py-2 rounded-full backdrop-blur-md border border-white/10 uppercase tracking-widest">
                  Scroll to Inspect
              </span>
          </div>
      )}
    </div>
  );
};
