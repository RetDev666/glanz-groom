import { useState, useRef, useEffect } from 'react';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  title?: string;
}

export default function BeforeAfterSlider({ beforeUrl, afterUrl, title }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setPosition(percent);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleDrag(e.clientX);
  };

  const handleTouchDown = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleDrag(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleDrag(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) handleDrag(e.touches[0].clientX);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col gap-3">
      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden select-none cursor-ew-resize bg-surface-container"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchDown}
      >
        {/* AFTER IMAGE (Background) */}
        <img 
          src={afterUrl} 
          alt="Nachher" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        
        {/* BEFORE IMAGE (Clipped foreground) */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img 
            src={beforeUrl} 
            alt="Vorher" 
            className="absolute inset-0 w-full h-full object-cover max-w-none pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* SLIDER LINE & HANDLE */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md transform -translate-x-1/2">
            <span className="material-symbols-outlined text-black text-[18px]">sync_alt</span>
          </div>
        </div>
        
        <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-sans uppercase tracking-wider backdrop-blur-sm pointer-events-none">Vorher</div>
        <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-sans uppercase tracking-wider backdrop-blur-sm pointer-events-none">Nachher</div>
      </div>
      
      {title && (
        <h4 className="font-display font-bold text-center text-on-surface text-lg">{title}</h4>
      )}
    </div>
  );
}
