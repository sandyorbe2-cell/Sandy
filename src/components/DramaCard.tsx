import React, { useState } from 'react';
import { Play, Bookmark, Film, Upload, Star, Trash2 } from 'lucide-react';
import { Drama } from '../types/drama';

interface DramaCardProps {
  drama: Drama;
  isFavorite: boolean;
  isAdmin?: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenPlayer: (drama: Drama, episodeNumber?: number) => void;
  onOpenUpload: (dramaId: string) => void;
  onDeleteDrama?: (dramaId: string) => void;
}

export const DramaCard: React.FC<DramaCardProps> = ({
  drama,
  isFavorite,
  isAdmin = false,
  onToggleFavorite,
  onOpenPlayer,
  onOpenUpload,
  onDeleteDrama,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteDrama) {
      onDeleteDrama(drama.id);
    }
  };

  return (
    <div className="group relative bg-[#16161E] rounded-2xl overflow-hidden border border-slate-800/80 hover:border-[#E50914]/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg flex flex-col justify-between">
      
      {/* Poster Image Container */}
      <div
        className="relative aspect-[2/3] overflow-hidden cursor-pointer bg-slate-900"
        onClick={() => onOpenPlayer(drama, 1)}
      >
        {!imageError ? (
          <img
            src={drama.poster}
            alt={drama.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-black text-center">
            <Film className="w-8 h-8 text-slate-600 mb-2" />
            <span className="text-xs font-bold text-slate-300">{drama.title}</span>
          </div>
        )}

        {/* Ambient Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11] via-transparent to-black/40 opacity-80 group-hover:opacity-60 transition-opacity"></div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="bg-[#E50914]/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shadow">
            {drama.status}
          </span>
          {drama.isCustom && (
            <span className="bg-[#FF2E93]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              Tuyo
            </span>
          )}
        </div>

        {/* Top Right Action: Delete Button (ONLY when isAdmin) & Bookmark */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
          {isAdmin && onDeleteDrama && (
            <button
              onClick={handleDelete}
              className="w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all border shadow bg-red-600/90 hover:bg-red-700 text-white border-red-500 active:scale-90"
              title="Eliminar este mini-drama (Modo Administrador)"
              aria-label="Eliminar mini-drama"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(drama.id);
            }}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:text-[#FFD700] transition-colors border border-slate-700"
            aria-label="Guardar drama"
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'text-[#FFD700] fill-current' : 'text-slate-300'}`} />
          </button>
        </div>

        {/* Bottom Poster Info: Episodes and Rating */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-bold text-white z-10">
          <span className="bg-black/75 px-2 py-0.5 rounded border border-slate-700/60 backdrop-blur-sm flex items-center gap-1">
            <Film className="w-3 h-3 text-[#E50914]" />
            <span>{drama.episodes.length} Cap.</span>
          </span>
          <span className="text-[#FFD700] bg-black/75 px-1.5 py-0.5 rounded border border-slate-700/60 backdrop-blur-sm flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-current" />
            <span>{drama.rating.toFixed(1)}</span>
          </span>
        </div>

        {/* Play Icon hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/35 z-0">
          <div className="w-12 h-12 rounded-full bg-[#E50914] text-white flex items-center justify-center text-xl shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Body & Info */}
      <div className="p-3.5 flex-grow flex flex-col justify-between">
        <div>
          {/* Unboxed category metadata text */}
          <div className="text-[10px] text-[#FF2E93] font-bold uppercase tracking-wider mb-1">
            {drama.genre}
          </div>

          <h3
            onClick={() => onOpenPlayer(drama, 1)}
            className="text-sm font-bold text-white line-clamp-1 hover:text-[#E50914] transition-colors cursor-pointer"
            title={drama.title}
          >
            {drama.title}
          </h3>

          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
            {drama.synopsis}
          </p>
        </div>

        {/* Card action controls */}
        <div className="mt-3.5 flex items-center gap-2">
          <button
            onClick={() => onOpenPlayer(drama, 1)}
            className="flex-1 py-2 bg-slate-800 hover:bg-[#E50914] text-white text-xs font-bold rounded-xl border border-slate-700 hover:border-[#E50914] transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Ver Serie</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => onOpenUpload(drama.id)}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors"
              title="Subir nuevo capítulo a este drama (Modo Administrador)"
            >
              <Upload className="w-3.5 h-3.5 text-[#FF2E93]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
