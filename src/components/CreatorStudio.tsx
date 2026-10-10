import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Film,
  Trash2,
  Play,
  Upload,
  Download,
  FileCode,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Eye,
  Check
} from 'lucide-react';
import { Drama, Episode } from '../types/drama';

interface CreatorStudioProps {
  isOpen: boolean;
  onClose: () => void;
  dramas: Drama[];
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onOpenUpload: (dramaId?: string) => void;
  onOpenPlayer: (drama: Drama, episodeNumber?: number) => void;
  onDeleteDrama: (dramaId: string) => void;
  onDeleteEpisode: (dramaId: string, episodeId: string) => void;
  onExportJson: () => void;
  onImportJson: (json: string) => boolean;
  onOpenBloggerModal: () => void;
  onOpenMonetization?: () => void;
  onResetDefaults: () => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({
  isOpen,
  onClose,
  dramas,
  isAdmin = false,
  onOpenAdminLogin,
  onOpenUpload,
  onOpenPlayer,
  onDeleteDrama,
  onDeleteEpisode,
  onExportJson,
  onImportJson,
  onOpenBloggerModal,
  onOpenMonetization,
  onResetDefaults,
}) => {
  const [selectedDramaId, setSelectedDramaId] = useState<string>(dramas[0]?.id || '');
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentDrama = dramas.find((d) => d.id === selectedDramaId) || dramas[0];

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const ok = onImportJson(importJsonText);
    if (ok) {
      setFeedback('¡Catálogo importado exitosamente!');
      setShowImportBox(false);
      setImportJsonText('');
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback('Error al importar: formato JSON no válido.');
    }
  };

  const handleReset = () => {
    onResetDefaults();
    setFeedback('Catálogo restaurado a los valores iniciales.');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-6xl h-full sm:h-[92vh] bg-[#0D0D11] sm:rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Studio Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-[#16161E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E50914] via-[#FF2E93] to-[#FFD700] flex items-center justify-center text-white font-bold shadow-lg">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Estudio de Mini-Dramas y Capítulos</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {dramas.length} series
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gestiona tus series, agrega nuevos capítulos, exporta para Blogger y realiza copias de seguridad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => onOpenUpload()}
                className="px-4 py-2 bg-[#E50914] hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all whitespace-nowrap"
                title="Subir nuevo capítulo (Modo Administrador)"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Subir Capítulo</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onExportJson}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Copia (JSON)</span>
            </button>

            <button
              onClick={() => setShowImportBox(!showImportBox)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>Importar Respaldo</span>
            </button>

            <button
              onClick={onOpenBloggerModal}
              className="px-3 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:opacity-90 text-white rounded-lg flex items-center gap-1.5 transition-opacity font-bold shadow"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Código para Blogger</span>
            </button>

            {isAdmin && onOpenMonetization && (
              <button
                onClick={onOpenMonetization}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-lg flex items-center gap-1.5 shadow transition-all"
                title="Configurar Adsterra Smartlinks y Rewarded Ads"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smartlinks Adsterra & Rewarded Ads</span>
              </button>
            )}
          </div>

          <button
            onClick={handleReset}
            className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar demo original</span>
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs">
            {feedback}
          </div>
        )}

        {/* Import Box */}
        {showImportBox && (
          <div className="m-4 sm:m-6 p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-white block">
              Pega tu respaldo JSON para restaurar tus series y capítulos:
            </span>
            <textarea
              rows={3}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[{"id": "...", "title": "..."}]'
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-xl font-mono"
            />
            <div className="flex gap-2">
              <button
                onClick={handleImport}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
              >
                Cargar Datos
              </button>
              <button
                onClick={() => setShowImportBox(false)}
                className="px-4 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Main 2-Column Studio Layout */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Column: Drama series list */}
          <div className="w-full md:w-80 border-r border-slate-800 bg-[#0D0D11] overflow-y-auto p-4 space-y-2 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Mis Series ({dramas.length})
              </span>
              {isAdmin && (
                <button
                  onClick={() => onOpenUpload()}
                  className="text-xs text-[#FF2E93] hover:underline flex items-center gap-1"
                  title="Crear nueva serie (Modo Administrador)"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Nueva</span>
                </button>
              )}
            </div>

            {dramas.map((d) => {
              const isSelected = d.id === currentDrama?.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDramaId(d.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-[#E50914] shadow-md'
                      : 'bg-[#16161E] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={d.poster}
                      alt={d.title}
                      className="w-10 h-14 object-cover rounded-lg shrink-0 bg-slate-800"
                    />
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-white truncate">
                        {d.title}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {d.episodes.length} capítulos · {d.genre}
                      </p>
                      {d.isCustom && (
                        <span className="text-[9px] text-[#FF2E93] font-semibold">
                          Creado por ti
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#E50914]' : 'text-slate-600'}`} />
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Drama Episode Management */}
          {currentDrama ? (
            <div className="flex-grow bg-[#16161E] overflow-y-auto p-4 sm:p-6 flex flex-col justify-between">
              <div>
                {/* Drama banner overview */}
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={currentDrama.poster}
                      alt={currentDrama.title}
                      className="w-16 h-24 object-cover rounded-xl shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <span className="text-[#FF2E93] font-bold uppercase">{currentDrama.genre}</span>
                        <span>·</span>
                        <span>{currentDrama.status}</span>
                        <span>·</span>
                        <span className="text-[#FFD700]">★ {currentDrama.rating.toFixed(1)}</span>
                      </div>
                      <h3 className="text-lg font-black text-white">
                        {currentDrama.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 max-w-xl mt-1">
                        {currentDrama.synopsis}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => onOpenPlayer(currentDrama, 1)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-[#E50914] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver en Player</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => onOpenUpload(currentDrama.id)}
                        className="px-3.5 py-2 bg-[#E50914] hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition-all"
                        title="Subir nuevo capítulo (Modo Administrador)"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Subir Capítulo</span>
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => onDeleteDrama(currentDrama.id)}
                        className="p-2 bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-xl border border-slate-800 transition-colors"
                        title="Eliminar serie (Solo Administrador)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Episode Table / List */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Lista de Capítulos ({currentDrama.episodes.length})</span>
                  </h4>
                  <span className="text-xs text-slate-500">
                    {isAdmin ? 'Modo Administrador Activo' : 'Modo Espectador (Solo lectura)'}
                  </span>
                </div>

                {currentDrama.episodes.length > 0 ? (
                  <div className="space-y-2">
                    {currentDrama.episodes.map((ep) => (
                      <div
                        key={ep.id}
                        className="p-3 bg-slate-900/80 hover:bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="w-8 h-8 rounded-xl bg-slate-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {ep.episodeNumber}
                          </span>

                          <div className="truncate">
                            <span className="text-xs font-bold text-white block truncate">
                              {ep.title}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-2">
                              <span>Duración: {ep.duration}</span>
                              <span>·</span>
                              <span className="capitalize">Tipo: {ep.videoType}</span>
                              {ep.fileBlobId && (
                                <span className="text-emerald-400 font-bold">
                                  (Archivo local guardado)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onOpenPlayer(currentDrama, ep.episodeNumber)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-[#E50914] text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Probar</span>
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => onDeleteEpisode(currentDrama.id, ep.id)}
                              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                              title="Eliminar capítulo (Solo Administrador)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 p-4">
                    <p className="text-xs text-slate-400 mb-3">
                      Esta serie todavía no tiene capítulos subidos.
                    </p>
                    {isAdmin && (
                      <button
                        onClick={() => onOpenUpload(currentDrama.id)}
                        className="px-4 py-2 bg-[#E50914] text-white text-xs font-bold rounded-xl"
                      >
                        Subir Capítulo 1 Ahora
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom footer */}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 mt-6">
                <span>SanShort Creator Engine v2.4</span>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
                >
                  Cerrar Estudio
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Selecciona una serie para comenzar.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
