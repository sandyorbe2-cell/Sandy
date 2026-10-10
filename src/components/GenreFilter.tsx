import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { DramaGenre } from '../types/drama';

interface GenreFilterProps {
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  showCustomOnly: boolean;
  onToggleCustomOnly: () => void;
  customCount: number;
}

const GENRES: { id: DramaGenre; label: string }[] = [
  { id: 'Todos', label: 'Todos' },
  { id: 'Romance', label: 'Romance' },
  { id: 'Venganza', label: 'Venganza' },
  { id: 'CEO', label: 'CEO Secreto' },
  { id: 'Fantasía', label: 'Fantasía' },
  { id: 'Urbano', label: 'Drama Urbano' },
  { id: 'Reencarnación', label: 'Reencarnación' },
];

export const GenreFilter: React.FC<GenreFilterProps> = ({
  selectedGenre,
  onSelectGenre,
  showCustomOnly,
  onToggleCustomOnly,
  customCount,
}) => {
  return (
    <section id="generos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
          <SlidersHorizontal className="w-4 h-4 text-[#E50914]" />
          <span>Explorar por Categoría</span>
        </div>

        {customCount > 0 && (
          <button
            onClick={onToggleCustomOnly}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all self-start sm:self-auto ${
              showCustomOnly
                ? 'bg-[#FF2E93]/20 border-[#FF2E93] text-white font-semibold'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            Mis Subidas ({customCount})
          </button>
        )}
      </div>

      {/* Horizontal genre tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 text-xs font-semibold">
        {GENRES.map((g) => {
          const isActive = selectedGenre === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onSelectGenre(g.id)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-[#E50914] text-white shadow-md shadow-[#E50914]/20 font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>
    </section>
  );
};
