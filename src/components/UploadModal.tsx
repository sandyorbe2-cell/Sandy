import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Film,
  PlusCircle,
  FileVideo,
  Link,
  Youtube,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Layers,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { Drama, VideoSourceType, DramaGenre, DramaStatus } from '../types/drama';
import heirPoster from '../assets/images/drama_poster_heir_1791541855715.jpg';
import ceoPoster from '../assets/images/drama_poster_ceo_1791541865663.jpg';
import rebornPoster from '../assets/images/drama_poster_reborn_1791541874621.jpg';
import bannerImg from '../assets/images/drama_hero_banner_1791541844375.jpg';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  dramas: Drama[];
  selectedDramaId?: string;
  onAddEpisode: (
    dramaId: string,
    episodeData: {
      episodeNumber?: number;
      title: string;
      duration?: string;
      videoUrl?: string;
      videoType: VideoSourceType;
      videoFile?: File | null;
      thumbnail?: string;
      synopsis?: string;
    }
  ) => Promise<void>;
  onCreateDrama: (
    dramaData: Omit<Drama, 'id' | 'createdAt' | 'updatedAt' | 'episodes' | 'episodesCount' | 'rating' | 'likesCount' | 'viewsCount'>
  ) => Drama;
}

type TabMode = 'single_episode' | 'new_drama' | 'batch_episodes';

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  dramas,
  selectedDramaId,
  onAddEpisode,
  onCreateDrama,
}) => {
  const [tab, setTab] = useState<TabMode>('single_episode');
  const [targetDramaId, setTargetDramaId] = useState<string>(selectedDramaId || (dramas[0]?.id || ''));

  // Single Episode Form state
  const [epNumber, setEpNumber] = useState<number>(1);
  const [epTitle, setEpTitle] = useState('');
  const [epDuration, setEpDuration] = useState('1:30');
  const [videoType, setVideoType] = useState<VideoSourceType>('file');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [videoDirectUrl, setVideoDirectUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [epSynopsis, setEpSynopsis] = useState('');
  const [epThumbnailUrl, setEpThumbnailUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // New Drama Form state
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState<DramaGenre>('Venganza');
  const [newStatus, setNewStatus] = useState<DramaStatus>('EN EMISIÓN');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [newPosterUrl, setNewPosterUrl] = useState(heirPoster);
  const [newBannerUrl, setNewBannerUrl] = useState(bannerImg);

  // Batch files state
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchStartingEp, setBatchStartingEp] = useState<number>(1);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const posterFileInputRef = useRef<HTMLInputElement | null>(null);
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync selected drama from props
  useEffect(() => {
    if (selectedDramaId) {
      setTargetDramaId(selectedDramaId);
    } else if (dramas[0]?.id && !targetDramaId) {
      setTargetDramaId(dramas[0].id);
    }
  }, [selectedDramaId, dramas]);

  // Auto-calculate next episode number when target drama changes
  useEffect(() => {
    const drama = dramas.find((d) => d.id === targetDramaId);
    if (drama) {
      const nextNum = drama.episodes.length > 0
        ? Math.max(...drama.episodes.map((e) => e.episodeNumber)) + 1
        : 1;
      setEpNumber(nextNum);
      setBatchStartingEp(nextNum);
      if (!epTitle) {
        setEpTitle(`Capítulo ${nextNum}`);
      }
    }
  }, [targetDramaId, dramas]);

  if (!isOpen) return null;

  const currentSelectedDrama = dramas.find((d) => d.id === targetDramaId);

  // Handle local video file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);

      // Attempt to inspect video duration
      const tempVideo = document.createElement('video');
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        const dur = Math.round(tempVideo.duration);
        const mins = Math.floor(dur / 60);
        const secs = dur % 60;
        setEpDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      };

      if (!epTitle || epTitle.startsWith('Capítulo')) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setEpTitle(cleanName);
      }
    }
  };

  // Handle custom poster file upload
  const handlePosterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewPosterUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Single Episode
  const handleSubmitSingleEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDramaId) {
      setErrorMessage('Por favor selecciona una serie de mini-drama.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let finalVideoUrl = '';
      if (videoType === 'url') {
        if (!videoDirectUrl.trim()) {
          throw new Error('Ingresa una URL de video válida (.mp4, .webm o streaming).');
        }
        finalVideoUrl = videoDirectUrl.trim();
      } else if (videoType === 'youtube') {
        if (!youtubeUrl.trim()) {
          throw new Error('Ingresa un enlace de video web o streaming válido.');
        }
        finalVideoUrl = youtubeUrl.trim();
      } else if (videoType === 'sample') {
        finalVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      }

      await onAddEpisode(targetDramaId, {
        episodeNumber: Number(epNumber),
        title: epTitle.trim() || `Capítulo ${epNumber}`,
        duration: epDuration || '1:30',
        videoType,
        videoUrl: finalVideoUrl,
        videoFile: videoType === 'file' ? videoFile : null,
        thumbnail: epThumbnailUrl.trim() || undefined,
        synopsis: epSynopsis.trim() || undefined,
      });

      setSuccessMessage(`¡Capítulo ${epNumber} subido con éxito!`);
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al subir el capítulo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit New Drama
  const handleSubmitNewDrama = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMessage('El título de la serie es obligatorio.');
      return;
    }

    try {
      const created = onCreateDrama({
        title: newTitle.trim(),
        genre: newGenre,
        status: newStatus,
        poster: newPosterUrl,
        banner: newBannerUrl || newPosterUrl,
        synopsis: newSynopsis.trim() || `Nueva serie de mini-drama: ${newTitle}`,
        tags: [newGenre, 'Exclusivo', 'Vertical'],
      });

      setTargetDramaId(created.id);
      setTab('single_episode');
      setSuccessMessage(`¡Serie "${created.title}" creada! Ahora sube su primer capítulo.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al crear la serie.');
    }
  };

  // Handle Batch Files Select
  const handleBatchFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBatchFiles(Array.from(e.target.files));
    }
  };

  // Submit Batch Upload
  const handleSubmitBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDramaId) {
      setErrorMessage('Selecciona una serie para los capítulos.');
      return;
    }
    if (batchFiles.length === 0) {
      setErrorMessage('Selecciona al menos un archivo de video.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let currentNumber = Number(batchStartingEp);
      for (let i = 0; i < batchFiles.length; i++) {
        const file = batchFiles[i];
        const title = `Capítulo ${currentNumber}: ${file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')}`;
        
        await onAddEpisode(targetDramaId, {
          episodeNumber: currentNumber,
          title,
          duration: '1:30',
          videoType: 'file',
          videoFile: file,
          synopsis: `Episodio subido en lote (${file.name})`,
        });

        currentNumber++;
      }

      setSuccessMessage(`¡Se subieron ${batchFiles.length} capítulos exitosamente!`);
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error en la subida por lotes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#16161E] rounded-3xl border border-slate-800 shadow-2xl p-5 sm:p-8 my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E50914] to-[#FF2E93] flex items-center justify-center text-white shadow-lg">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Centro de Creador · Subir Capítulos
              </h3>
              <p className="text-xs text-slate-400">
                Gestiona y publica episodios en formato vertical para tus espectadores
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-2xl mb-4 border border-slate-800">
          <button
            onClick={() => setTab('single_episode')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'single_episode'
                ? 'bg-[#E50914] text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileVideo className="w-3.5 h-3.5" />
            <span>Subir Capítulo</span>
          </button>

          <button
            onClick={() => setTab('batch_episodes')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'batch_episodes'
                ? 'bg-[#E50914] text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Subida por Lote</span>
          </button>

          <button
            onClick={() => setTab('new_drama')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'new_drama'
                ? 'bg-[#E50914] text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nueva Serie</span>
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-grow overflow-y-auto pr-1 no-scrollbar space-y-4">
          
          {/* ================= TAB 1: SUBIR CAPÍTULO INDIVIDUAL ================= */}
          {tab === 'single_episode' && (
            <form onSubmit={handleSubmitSingleEpisode} className="space-y-4">
              {/* Select Drama */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  1. Serie de Mini-Drama de destino
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <select
                    value={targetDramaId}
                    onChange={(e) => setTargetDramaId(e.target.value)}
                    className="sm:col-span-3 bg-slate-900 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#E50914]"
                  >
                    {dramas.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} ({d.episodes.length} caps · {d.genre})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setTab('new_drama')}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-xl border border-slate-700 flex items-center justify-center gap-1 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#FF2E93]" />
                    <span>+ Nueva Serie</span>
                  </button>
                </div>
              </div>

              {/* Episode Number & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Número de Capítulo
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={epNumber}
                    onChange={(e) => setEpNumber(Number(e.target.value))}
                    required
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Título del Capítulo
                  </label>
                  <input
                    type="text"
                    value={epTitle}
                    onChange={(e) => setEpTitle(e.target.value)}
                    placeholder="ej. Cap. 12: Revelación de Identidad"
                    required
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              {/* Video Source Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  2. ¿Cómo deseas adjuntar el video del capítulo?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoType('file')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                      videoType === 'file'
                        ? 'bg-[#E50914]/15 border-[#E50914] text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileVideo className="w-4 h-4 text-[#E50914] mb-1" />
                    <span>Subir Archivo (.mp4)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoType('url')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                      videoType === 'url'
                        ? 'bg-[#E50914]/15 border-[#E50914] text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Link className="w-4 h-4 text-sky-400 mb-1" />
                    <span>Enlace / URL Directa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoType('youtube')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                      videoType === 'youtube'
                        ? 'bg-[#E50914]/15 border-[#E50914] text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Film className="w-4 h-4 text-[#FF2E93] mb-1" />
                    <span>Enlace Web / Streaming HD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoType('sample')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                      videoType === 'sample'
                        ? 'bg-[#E50914]/15 border-[#E50914] text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[#FFD700] mb-1" />
                    <span>Video Demo Rápido</span>
                  </button>
                </div>
              </div>

              {/* Source Input Area based on chosen type */}
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
                {videoType === 'file' && (
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-700 hover:border-[#E50914] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40"
                    >
                      <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <span className="text-xs font-bold text-slate-200 block">
                        Haz clic aquí para seleccionar tu video vertical (.mp4, .webm, .mov)
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Soporta videos grabados desde tu celular o cámara. Se guardará de forma persistente.
                      </span>
                    </div>

                    {videoFile && (
                      <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileVideo className="w-5 h-5 text-[#E50914] shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-bold text-white block truncate">
                              {videoFile.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {(videoFile.size / (1024 * 1024)).toFixed(2)} MB · Duración est.: {epDuration}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-400 font-bold shrink-0 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Listo
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {videoType === 'url' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      URL del archivo de video
                    </label>
                    <input
                      type="url"
                      value={videoDirectUrl}
                      onChange={(e) => setVideoDirectUrl(e.target.value)}
                      placeholder="https://ejemplo.com/videos/capitulo-1.mp4"
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#E50914]"
                    />
                    <p className="text-[10px] text-slate-500">
                      Puedes usar enlaces directos de servidores, CDNs, Dropbox, Google Drive (direct link) o Catbox.
                    </p>
                  </div>
                )}

                {videoType === 'youtube' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      Enlace de Video Web / Streaming HD
                    </label>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="Pega el enlace de tu video o shorts..."
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#E50914]"
                    />
                    <p className="text-[10px] text-slate-400">
                      ✓ Reproducción limpia en formato vertical con soporte completo para pantalla completa y sin marcas externas.
                    </p>
                  </div>
                )}

                {videoType === 'sample' && (
                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FFD700]" />
                    <span>
                      Usará una secuencia vertical cinematográfica de alta definición lista para probar de inmediato.
                    </span>
                  </div>
                )}
              </div>

              {/* Extra Optional info: Duration, Synopsis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Duración (min:seg)
                  </label>
                  <input
                    type="text"
                    value={epDuration}
                    onChange={(e) => setEpDuration(e.target.value)}
                    placeholder="1:30"
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Miniatura personalizada (URL opcional)
                  </label>
                  <input
                    type="text"
                    value={epThumbnailUrl}
                    onChange={(e) => setEpThumbnailUrl(e.target.value)}
                    placeholder="Dejar en blanco para usar la portada"
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Sinopsis del capítulo (opcional)
                </label>
                <textarea
                  rows={2}
                  value={epSynopsis}
                  onChange={(e) => setEpSynopsis(e.target.value)}
                  placeholder="Describe brevemente qué ocurre en este capítulo..."
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-[#E50914]"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-[#E50914] to-[#FF2E93] hover:from-red-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#E50914]/25 transition-all text-xs sm:text-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isSubmitting ? 'Guardando Capítulo...' : 'Publicar Capítulo Ahora'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 2: SUBIDA EN LOTE ================= */}
          {tab === 'batch_episodes' && (
            <form onSubmit={handleSubmitBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  1. Seleccionar serie de destino
                </label>
                <select
                  value={targetDramaId}
                  onChange={(e) => setTargetDramaId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#E50914]"
                >
                  {dramas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.episodes.length} caps actuales)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Comenzar a numerar desde el Capítulo #:
                </label>
                <input
                  type="number"
                  min="1"
                  value={batchStartingEp}
                  onChange={(e) => setBatchStartingEp(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  2. Selecciona múltiples archivos de video a la vez
                </label>
                <input
                  type="file"
                  multiple
                  ref={batchFileInputRef}
                  onChange={handleBatchFilesChange}
                  accept="video/mp4,video/webm,video/*"
                  className="hidden"
                />

                <div
                  onClick={() => batchFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-[#E50914] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40"
                >
                  <Layers className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <span className="text-xs font-bold text-slate-200 block">
                    Selecciona 5, 10 o 20 archivos de video a la vez
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    El sistema los ordenará automáticamente como Ep. {batchStartingEp}, Ep. {batchStartingEp + 1}, etc.
                  </span>
                </div>

                {batchFiles.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 max-h-40 overflow-y-auto space-y-1">
                    <span className="text-xs font-bold text-[#FFD700] block mb-1">
                      {batchFiles.length} archivos seleccionados:
                    </span>
                    {batchFiles.map((f, i) => (
                      <div key={i} className="text-[11px] text-slate-300 flex justify-between py-0.5 border-b border-slate-900">
                        <span>Capítulo {batchStartingEp + i}: {f.name}</span>
                        <span className="text-slate-500">{(f.size / (1024 * 1024)).toFixed(1)} MB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || batchFiles.length === 0}
                className="w-full py-3 bg-gradient-to-r from-[#E50914] to-[#FF2E93] hover:from-red-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all text-xs sm:text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Subiendo lote...'
                    : `Subir los ${batchFiles.length} Capítulos`}
                </span>
              </button>
            </form>
          )}

          {/* ================= TAB 3: CREAR NUEVA SERIE ================= */}
          {tab === 'new_drama' && (
            <form onSubmit={handleSubmitNewDrama} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Título del Mini-Drama
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ej. El Secreto del Multimillonario Oculto"
                  required
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Género Principal
                  </label>
                  <select
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value as DramaGenre)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-[#E50914]"
                  >
                    <option value="Venganza">Venganza</option>
                    <option value="Romance">Romance</option>
                    <option value="CEO">CEO Secreto</option>
                    <option value="Urbano">Drama Urbano</option>
                    <option value="Fantasía">Fantasía</option>
                    <option value="Reencarnación">Reencarnación</option>
                    <option value="Suspenso">Suspenso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Estado de Publicación
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as DramaStatus)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-[#E50914]"
                  >
                    <option value="EN EMISIÓN">EN EMISIÓN</option>
                    <option value="NUEVO">NUEVO</option>
                    <option value="COMPLETO">COMPLETO</option>
                    <option value="TENDENCIA">TENDENCIA</option>
                  </select>
                </div>
              </div>

              {/* Poster Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Póster de la Serie (2:3)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                    <img
                      src={newPosterUrl}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={posterFileInputRef}
                      onChange={handlePosterFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => posterFileInputRef.current?.click()}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#FF2E93]" />
                      <span>Subir Imagen desde mi dispositivo</span>
                    </button>
                    <input
                      type="text"
                      value={newPosterUrl}
                      onChange={(e) => setNewPosterUrl(e.target.value)}
                      placeholder="O pega una URL de imagen..."
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-3 py-1.5 rounded-xl focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Sinopsis de la Serie
                </label>
                <textarea
                  rows={3}
                  value={newSynopsis}
                  onChange={(e) => setNewSynopsis(e.target.value)}
                  placeholder="Cuenta de qué trata la historia para atrapar al público..."
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#E50914] to-[#FF2E93] hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all text-xs sm:text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Crear Serie y Empezar a Subir Capítulos</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
