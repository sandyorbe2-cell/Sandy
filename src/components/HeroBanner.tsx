import React, { useState } from 'react';
import { Play, Bookmark, ChevronLeft, ChevronRight, Upload, Trash2 } from 'lucide-react';
import { Drama } from '../types/drama';

interface HeroBannerProps {
  dramas: Drama[];
  isAdmin?: boolean;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onPlayDrama: (drama: Drama, episodeNumber?: number) => void;
  onOpenUploadForDrama: (dramaId: string) => void;
  onDeleteDrama?: (dramaId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  dramas,
  isAdmin = false,
  isFavorite,
  onToggleFavorite,
  onPlayDrama,
  onOpenUploadForDrama,
  onDeleteDrama,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!dramas.length) return null;

  const currentDrama = dramas[currentIndex % dramas.length];
  const isFav = isFavorite(currentDrama.id);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % dramas.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + dramas.length) % dramas.length);
  };

  return (
    <section id="hero" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl min-h-[420px] sm:min-h-[490px] flex items-end">
        {/* Background Banner Image */}
        <img
          src={currentDrama.banner || currentDrama.poster}
          alt={currentDrama.title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center brightness-75 transition-all duration-700"
        />

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11] via-[#0D0D11]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D11] via-[#0D0D11]/50 to-transparent hidden md:block"></div>

        {/* Hero Content Information */}
        <div className="relative z-10 p-6 sm:p-10 max-w-2xl space-y-4">
          
          {/* Unboxed Metadata Line with typographic separators */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="font-bold text-[#FF2E93] uppercase tracking-wider">
              {currentDrama.genre}
            </span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span>{currentDrama.status}</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-[#FFD700] font-semibold">★ {currentDrama.rating.toFixed(1)}</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-400">{currentDrama.episodes.length} Capítulos disponibles</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
            {currentDrama.title}
          </h1>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed">
            {currentDrama.synopsis}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onPlayDrama(currentDrama, 1)}
              className="px-6 py-3 bg-gradient-to-r from-[#E50914] to-[#FF2E93] hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-[#E50914]/30 active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Ver Ahora (Cap. 1)</span>
            </button>

            <button
              onClick={() => onToggleFavorite(currentDrama.id)}
              className="px-5 py-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white font-semibold rounded-2xl flex items-center gap-2 backdrop-blur-md transition-all active:scale-95"
            >
              <Bookmark className={`w-4 h-4 ${isFav ? 'text-[#FFD700] fill-current' : 'text-slate-400'}`} />
              <span>{isFav ? 'En Mi Lista' : 'Guardar'}</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => onOpenUploadForDrama(currentDrama.id)}
                className="px-4 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2 transition-all active:scale-95"
                title="Subir nuevo capítulo a esta serie (Modo Administrador)"
              >
                <Upload className="w-4 h-4 text-[#FF2E93]" />
                <span>+ Subir Cap.</span>
              </button>
            )}

            {/* Admin Delete button in Hero */}
            {isAdmin && onDeleteDrama && (
              <button
                onClick={() => onDeleteDrama(currentDrama.id)}
                className="px-4 py-3 bg-red-950/70 hover:bg-red-700 text-red-200 hover:text-white border border-red-800 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2 transition-all active:scale-95"
                title="Eliminar este mini-drama (Solo Administrador)"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Serie</span>
              </button>
            )}
          </div>
        </div>

        {/* Carousel indicators & slide navigation */}
        <div className="absolute right-4 bottom-4 z-20 flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-[#E50914] text-white flex items-center justify-center border border-slate-700 transition-colors"
            aria-label="Anterior drama"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-[#E50914] text-white flex items-center justify-center border border-slate-700 transition-colors"
            aria-label="Siguiente drama"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
