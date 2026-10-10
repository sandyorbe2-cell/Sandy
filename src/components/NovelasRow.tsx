import React from 'react';
import { Drama } from '../types/drama';
import { Play, Sparkles } from 'lucide-react';

interface NovelasRowProps {
  dramas: Drama[];
  onOpenPlayer: (drama: Drama, episodeNumber?: number) => void;
  onNavigateCatalog: () => void;
}

export const NovelasRow: React.FC<NovelasRowProps> = ({
  dramas,
  onOpenPlayer,
  onNavigateCatalog,
}) => {
  const featured = dramas.slice(0, 4);

  return (
    <section id="mininovelas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-[#16161E] via-[#1a1429] to-[#0D0D11] p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-[#FF2E93] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Especiales SanShort</span>
            </span>
            <h2 className="text-2xl font-black text-white mt-1">
              Mini-Novelas Exclusivas
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Maratonea las historias completas de romance, CEOs y venganza sin pausas.
            </p>
          </div>

          <button
            onClick={onNavigateCatalog}
            className="px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-xs sm:text-sm font-semibold text-white rounded-xl border border-slate-700 transition-colors whitespace-nowrap"
          >
            Ver Catálogo Completo
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((drama) => (
            <div
              key={drama.id}
              onClick={() => onOpenPlayer(drama, 1)}
              className="cursor-pointer group relative rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-[3/4] shadow-md hover:border-[#FF2E93]/60 transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={drama.poster}
                alt={drama.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <div className="w-10 h-10 rounded-full bg-[#E50914] text-white flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-[10px] bg-[#FFD700] text-black font-extrabold px-1.5 py-0.5 rounded">
                  {drama.status}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white mt-1 line-clamp-1">
                  {drama.title}
                </h4>
                <p className="text-[10px] text-slate-300">
                  {drama.episodes.length} Episodios · {drama.genre}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
