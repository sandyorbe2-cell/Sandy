import React from 'react';
import { X, Bookmark, Play, Trash2, Film } from 'lucide-react';
import { Drama } from '../types/drama';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  dramas: Drama[];
  onToggleFavorite: (id: string) => void;
  onOpenPlayer: (drama: Drama, episodeNumber?: number) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  dramas,
  onToggleFavorite,
  onOpenPlayer,
}) => {
  if (!isOpen) return null;

  const favoriteDramas = dramas.filter((d) => favorites.includes(d.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#16161E] rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-2xl relative max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#FFD700] fill-current" />
            <span>Mi Lista de Mini-Dramas Guardados ({favoriteDramas.length})</span>
          </h3>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items container */}
        <div className="flex-grow overflow-y-auto space-y-3 pr-1 no-scrollbar">
          {favoriteDramas.length > 0 ? (
            favoriteDramas.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={d.poster}
                    alt={d.title}
                    className="w-12 h-16 object-cover rounded-xl shrink-0 bg-slate-800"
                  />
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-white truncate">{d.title}</h4>
                    <span className="text-xs text-[#FF2E93] font-semibold">
                      {d.genre} · {d.episodes.length} Capítulos
                    </span>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {d.synopsis}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPlayer(d, 1);
                    }}
                    className="px-3.5 py-2 bg-[#E50914] hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Ver</span>
                  </button>

                  <button
                    onClick={() => onToggleFavorite(d.id)}
                    className="p-2 text-slate-400 hover:text-red-400 bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors"
                    title="Quitar de mi lista"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              <Film className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-slate-400 text-sm">Aún no has guardado ningún drama</p>
              <p className="mt-1">
                Explora el catálogo y presiona el ícono de marcador para tener tus series a mano.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
