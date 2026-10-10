import React from 'react';
import { Drama } from '../types/drama';
import { DramaCard } from './DramaCard';
import { Film, PlusCircle } from 'lucide-react';

interface DramaGridProps {
  dramas: Drama[];
  title?: string;
  subtitle?: string;
  favorites: string[];
  isAdmin?: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenPlayer: (drama: Drama, episodeNumber?: number) => void;
  onOpenUpload: (dramaId?: string) => void;
  onDeleteDrama?: (dramaId: string) => void;
}

export const DramaGrid: React.FC<DramaGridProps> = ({
  dramas,
  title = 'Mini-Dramas en Tendencia',
  subtitle = 'Formato vertical rápido e intenso · Episodios de 1 a 2 minutos',
  favorites,
  isAdmin = false,
  onToggleFavorite,
  onOpenPlayer,
  onOpenUpload,
  onDeleteDrama,
}) => {
  return (
    <section id="populares" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#E50914] rounded-full inline-block"></span>
            <span>{title}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">
            {dramas.length} {dramas.length === 1 ? 'serie' : 'series'}
          </span>
          {isAdmin && (
            <button
              onClick={() => onOpenUpload()}
              className="text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[#FF2E93] hover:text-white rounded-xl flex items-center gap-1.5 transition-colors"
              title="Crear nueva serie (Modo Administrador)"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Crear Serie</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid or Empty State */}
      {dramas.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
          {dramas.map((drama) => (
            <DramaCard
              key={drama.id}
              drama={drama}
              isFavorite={favorites.includes(drama.id)}
              isAdmin={isAdmin}
              onToggleFavorite={onToggleFavorite}
              onOpenPlayer={onOpenPlayer}
              onOpenUpload={() => onOpenUpload(drama.id)}
              onDeleteDrama={onDeleteDrama}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-slate-900/50 rounded-3xl border border-slate-800/80 px-4">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No se encontraron mini-dramas</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Prueba con otro término de búsqueda o sube tu propio mini-drama con capítulos ahora mismo.
          </p>
          {isAdmin && (
            <button
              onClick={() => onOpenUpload()}
              className="px-5 py-2.5 bg-[#E50914] hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 shadow-lg shadow-[#E50914]/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Subir Mi Primer Mini-Drama</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};
