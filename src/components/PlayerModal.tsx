import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Heart,
  Bookmark,
  Share2,
  ChevronUp,
  ChevronDown,
  Upload,
  Sparkles,
  Check,
  Trash2,
  ShieldAlert,
  Film,
  Lock,
  Unlock,
  ExternalLink,
  DollarSign,
  Coins
} from 'lucide-react';
import { Drama, Episode, MonetizationSettings } from '../types/drama';
import { getVideoBlob } from '../services/db';

interface PlayerModalProps {
  drama: Drama;
  initialEpisodeNumber?: number;
  isOpen: boolean;
  isAdmin: boolean;
  monetizationSettings: MonetizationSettings;
  coins?: number;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onRecordWatch: (dramaId: string, episodeNumber: number) => void;
  onOpenUploadForDrama: (dramaId: string) => void;
  onDeleteEpisode?: (dramaId: string, episodeId: string) => void;
  onDeleteDrama?: (dramaId: string) => void;
  onOpenMonetization?: () => void;
  onOpenCoinsModal?: () => void;
  isUnlocked: (dramaId: string, episodeNumber: number) => boolean;
  onUnlockEpisode: (dramaId: string, episodeNumber: number) => void;
  onUnlockWithCoins?: (dramaId: string, episodeNumber: number, cost: number) => boolean;
  onEarnCoinsFromAd?: (amount: number) => void;
  onSmartlinkClick: () => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  drama,
  initialEpisodeNumber = 1,
  isOpen,
  isAdmin,
  monetizationSettings,
  coins = 0,
  onClose,
  isFavorite,
  onToggleFavorite,
  onRecordWatch,
  onOpenUploadForDrama,
  onDeleteEpisode,
  onDeleteDrama,
  onOpenMonetization,
  onOpenCoinsModal,
  isUnlocked,
  onUnlockEpisode,
  onUnlockWithCoins,
  onEarnCoinsFromAd,
  onSmartlinkClick,
}) => {
  const [currentEpNumber, setCurrentEpNumber] = useState(initialEpisodeNumber);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(12400);
  const [hasLiked, setHasLiked] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [episodeSearch, setEpisodeSearch] = useState('');
  
  // Rewarded Ad state
  const [adCountdown, setAdCountdown] = useState<number | null>(null);
  const [isAdWatching, setIsAdWatching] = useState(false);

  // Dual-mode fullscreen
  const [isTheatreFullscreen, setIsTheatreFullscreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync initial episode number
  useEffect(() => {
    setCurrentEpNumber(initialEpisodeNumber);
  }, [initialEpisodeNumber, drama.id]);

  // Find active episode or fallback to first
  const currentEpisode =
    drama.episodes.find((e) => e.episodeNumber === currentEpNumber) ||
    drama.episodes[0] ||
    null;

  // Check if current episode is locked by Rewarded Ad
  const isEpisodeLocked =
    monetizationSettings.enabled &&
    (currentEpisode?.episodeNumber || 1) > (monetizationSettings.freeEpisodesCount || 3) &&
    !isUnlocked(drama.id, currentEpisode?.episodeNumber || 1);

  // Manage IndexedDB video blob if episode has uploaded file
  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    async function loadBlob() {
      if (currentEpisode?.fileBlobId) {
        const blob = await getVideoBlob(currentEpisode.fileBlobId);
        if (blob && active) {
          createdUrl = URL.createObjectURL(blob);
          setBlobUrl(createdUrl);
          return;
        }
      }
      if (active) {
        setBlobUrl(null);
      }
    }

    loadBlob();

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [currentEpisode]);

  // Record watch history
  useEffect(() => {
    if (currentEpisode && !isEpisodeLocked) {
      onRecordWatch(drama.id, currentEpisode.episodeNumber);
      setLikesCount(currentEpisode.likes || 12400);
      setHasLiked(false);
    }
  }, [currentEpisode, drama.id, onRecordWatch, isEpisodeLocked]);

  // Sync native fullscreen exit
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsTheatreFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Video element play control
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      if (isPlaying && !isEpisodeLocked) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentEpisode, blobUrl, playbackSpeed, isEpisodeLocked]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleNextEpisode();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        handlePrevEpisode();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.code === 'Escape') {
        if (isTheatreFullscreen) {
          setIsTheatreFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentEpNumber, drama.episodes, isTheatreFullscreen]);

  if (!isOpen || !currentEpisode) return null;

  const handleTogglePlay = () => {
    if (isEpisodeLocked) return;
    setIsPlaying((prev) => !prev);
  };

  const handleNextEpisode = () => {
    const currentIndex = drama.episodes.findIndex((e) => e.episodeNumber === currentEpNumber);
    if (currentIndex < drama.episodes.length - 1) {
      setCurrentEpNumber(drama.episodes[currentIndex + 1].episodeNumber);
      setIsPlaying(true);
    }
  };

  const handlePrevEpisode = () => {
    const currentIndex = drama.episodes.findIndex((e) => e.episodeNumber === currentEpNumber);
    if (currentIndex > 0) {
      setCurrentEpNumber(drama.episodes[currentIndex - 1].episodeNumber);
      setIsPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    if (autoNext) {
      handleNextEpisode();
    } else {
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTo;
      setCurrentTime(seekTo);
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Robust Fullscreen: Toggles CSS Theatre Fullscreen + Native Browser API
  const handleToggleFullscreen = () => {
    const newFs = !isTheatreFullscreen;
    setIsTheatreFullscreen(newFs);

    const container = containerRef.current;
    if (newFs && container) {
      try {
        if (container.requestFullscreen) {
          container.requestFullscreen().catch(() => {});
        } else if ((container as any).webkitRequestFullscreen) {
          (container as any).webkitRequestFullscreen();
        }
      } catch {
        // Handled
      }
    } else {
      if (document.fullscreenElement) {
        try {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
          }
        } catch {
          // Handled
        }
      }
    }
  };

  const handleLike = () => {
    if (!hasLiked) {
      setHasLiked(true);
      setLikesCount((prev) => prev + 1);
    } else {
      setHasLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/#drama=${drama.id}&ep=${currentEpNumber}`;
    navigator.clipboard?.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  // Trigger Rewarded Ad / Adsterra Smartlink (15 seconds, earns 2 coins or directly unlocks)
  const handleTriggerRewardedAd = () => {
    onSmartlinkClick();
    setIsAdWatching(true);
    let timeLeft = monetizationSettings.rewardCountdownSeconds || 15;
    setAdCountdown(timeLeft);

    const interval = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        clearInterval(interval);
        setAdCountdown(null);
        setIsAdWatching(false);
        const coinsEarned = monetizationSettings.coinsPerAd || 2;
        onEarnCoinsFromAd?.(coinsEarned);
        // Automatically unlock current episode upon watching ad
        onUnlockEpisode(drama.id, currentEpisode.episodeNumber);
        setIsPlaying(true);
      } else {
        setAdCountdown(timeLeft);
      }
    }, 1000);
  };

  // Direct unlock with coins (costs 5 coins)
  const handleUnlockWithCoins = () => {
    const cost = monetizationSettings.coinsToUnlockEpisode || 5;
    if (onUnlockWithCoins) {
      const success = onUnlockWithCoins(drama.id, currentEpisode.episodeNumber, cost);
      if (success) {
        setIsPlaying(true);
      }
    } else {
      onUnlockEpisode(drama.id, currentEpisode.episodeNumber);
      setIsPlaying(true);
    }
  };

  // Admin bypass lock
  const handleAdminBypassUnlock = () => {
    onUnlockEpisode(drama.id, currentEpisode.episodeNumber);
    setIsPlaying(true);
  };

  // Delete current episode
  const handleDeleteCurrentEpisode = () => {
    if (!onDeleteEpisode) return;
    onDeleteEpisode(drama.id, currentEpisode.id);
  };

  // Delete whole drama
  const handleDeleteCurrentDrama = () => {
    if (!onDeleteDrama) return;
    onDeleteDrama(drama.id);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Check if current video is a streaming cloud / web video
  const isWebVideoUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Concealed Embed URL: Strips external branding, modest branding, rel=0, controls disguised
  const getConcealedEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('/shorts/')) {
      videoId = url.split('/shorts/')[1]?.split(/[?&#]/)[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split(/[?&#]/)[0] || '';
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split(/[?&#]/)[0] || '';
    } else if (url.includes('/embed/')) {
      videoId = url.split('/embed/')[1]?.split(/[?&#]/)[0] || '';
    } else {
      videoId = url;
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3&fs=1&color=white&disablekb=0`;
  };

  // Determine active video source
  const videoSrc = blobUrl || currentEpisode.videoUrl;
  const isEmbedVideo = currentEpisode.videoType === 'youtube' || isWebVideoUrl(videoSrc);

  const filteredEpisodes = drama.episodes.filter((ep) =>
    ep.title.toLowerCase().includes(episodeSearch.toLowerCase()) ||
    ep.episodeNumber.toString().includes(episodeSearch)
  );

  return (
    <div className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center ${
      isTheatreFullscreen ? 'p-0' : 'p-0 sm:p-4'
    }`}>
      
      {/* Modal Container */}
      <div className={`relative bg-[#0D0D11] border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 ${
        isTheatreFullscreen
          ? 'w-full h-full sm:rounded-0 border-0'
          : 'w-full max-w-5xl h-full sm:h-[92vh] sm:rounded-3xl'
      }`}>
        
        {/* Close Button */}
        {!isTheatreFullscreen && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-40 w-10 h-10 rounded-full bg-black/70 hover:bg-[#E50914] text-white flex items-center justify-center transition-colors border border-slate-700"
            aria-label="Cerrar reproductor"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ================= 9:16 VERTICAL REEL PLAYER ================= */}
        <div
          ref={containerRef}
          className={`bg-black relative flex items-center justify-center shrink-0 group select-none overflow-hidden transition-all duration-300 ${
            isTheatreFullscreen
              ? 'w-full h-full flex-grow'
              : 'w-full md:w-[420px] h-[62vh] md:h-full'
          }`}
        >
          
          {/* ================= REWARDED AD LOCK SCREEN ================= */}
          {isEpisodeLocked ? (
            <div className="absolute inset-0 z-30 bg-gradient-to-b from-[#0D0D11]/95 via-[#16161E]/95 to-black/95 backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center">
              
              {/* Blurred poster background */}
              <img
                src={currentEpisode.thumbnail || drama.poster}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-20 pointer-events-none"
              />

              {/* Glowing Lock Icon */}
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/30 transform animate-pulse">
                  <Lock className="w-10 h-10 stroke-[2.5]" />
                </div>
              </div>

              {/* Tag & Episode Title */}
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  Contenido Exclusivo
                </span>
                <span className="bg-slate-900 text-amber-400 border border-amber-500/40 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Coins className="w-3 h-3 fill-current" />
                  <span>{monetizationSettings.coinsToUnlockEpisode || 5} Monedas</span>
                </span>
              </div>

              <h3 className="text-xl font-black text-white max-w-xs leading-tight mb-2">
                {currentEpisode.title}
              </h3>

              <p className="text-xs text-slate-300 max-w-xs leading-relaxed mb-4">
                Desbloquea con <strong className="text-amber-400 font-bold">{monetizationSettings.coinsToUnlockEpisode || 5} monedas</strong> o mira un anuncio de <strong className="text-amber-400 font-bold">{monetizationSettings.rewardCountdownSeconds || 15}s</strong> para ganar <strong className="text-amber-400 font-bold">+{monetizationSettings.coinsPerAd || 2} monedas</strong> y desbloquearlo.
              </p>

              {/* User Coins Status Pill */}
              <div className="mb-4 px-3.5 py-1.5 bg-slate-900/90 border border-amber-500/30 rounded-xl flex items-center gap-2 text-xs">
                <Coins className="w-4 h-4 text-amber-400 fill-current" />
                <span className="text-slate-300">Tu saldo:</span>
                <span className="font-black text-amber-300">{coins} monedas</span>
              </div>

              {/* Rewarded Ad & Coins Action Buttons */}
              {!isAdWatching ? (
                <div className="w-full max-w-xs space-y-2.5">
                  {/* Option A: Unlock with Coins if user has enough */}
                  {coins >= (monetizationSettings.coinsToUnlockEpisode || 5) ? (
                    <button
                      onClick={handleUnlockWithCoins}
                      className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all text-xs sm:text-sm active:scale-95"
                    >
                      <Coins className="w-4 h-4 fill-current shrink-0" />
                      <span>Desbloquear con {monetizationSettings.coinsToUnlockEpisode || 5} Monedas</span>
                    </button>
                  ) : null}

                  {/* Option B: Watch Smartlink Ad to earn 2 coins and unlock */}
                  <a
                    href={monetizationSettings.adsterraSmartlinkUrl || 'https://asiafilm.org/4/d7b5b0245e4c479a08fb56712e7ba62d'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleTriggerRewardedAd}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all text-xs sm:text-sm active:scale-95 transform hover:scale-[1.02]"
                  >
                    <Sparkles className="w-4 h-4 fill-current shrink-0" />
                    <span>Ver Anuncio ({monetizationSettings.rewardCountdownSeconds || 15}s) y Desbloquear</span>
                    <ExternalLink className="w-4 h-4 shrink-0" />
                  </a>

                  {/* Option C: Open wallet to get more coins */}
                  {onOpenCoinsModal && (
                    <button
                      onClick={onOpenCoinsModal}
                      className="w-full py-2 bg-slate-900/80 hover:bg-slate-800 text-amber-300 hover:text-amber-200 text-xs font-bold rounded-xl border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Coins className="w-3.5 h-3.5 fill-current" />
                      <span>Conseguir Más Monedas (+{monetizationSettings.coinsPerAd || 2} por anuncio)</span>
                    </button>
                  )}

                  {isAdmin && (
                    <div className="flex flex-col gap-2 w-full pt-1">
                      <button
                        onClick={handleAdminBypassUnlock}
                        className="w-full py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] font-semibold rounded-xl border border-slate-800 transition-colors"
                      >
                        Omitir (Modo Administrador)
                      </button>
                      {onOpenMonetization && (
                        <button
                          onClick={onOpenMonetization}
                          className="w-full py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[11px] font-bold rounded-xl border border-amber-500/40 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Configurar Smartlinks de Adsterra</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Active Ad Countdown Screen */
                <div className="w-full max-w-xs p-4 bg-slate-900/95 border border-amber-500/40 rounded-2xl space-y-3 animate-fade-in shadow-2xl">
                  <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                    <span>Viendo anuncio del patrocinador...</span>
                  </div>

                  <div className="text-4xl font-black text-white font-mono tabular-nums">
                    {adCountdown}s
                  </div>

                  <p className="text-[11px] text-slate-300">
                    Mantén abierto el anuncio durante los {monetizationSettings.rewardCountdownSeconds || 15} segundos para ganar +{monetizationSettings.coinsPerAd || 2} monedas y desbloquear tu capítulo.
                  </p>

                  <button
                    onClick={() => {
                      const coinsEarned = monetizationSettings.coinsPerAd || 2;
                      onEarnCoinsFromAd?.(coinsEarned);
                      onUnlockEpisode(drama.id, currentEpisode.episodeNumber);
                      setAdCountdown(null);
                      setIsAdWatching(false);
                      setIsPlaying(true);
                    }}
                    className="text-[11px] text-amber-400 hover:underline font-bold"
                  >
                    ¿Ya lo viste? Haz clic aquí para entrar
                  </button>
                </div>
              )}

            </div>
          ) : isEmbedVideo ? (
            /* Concealed Web Video: Scaled and Vignetted to crop out any external logo / title */
            <div className="relative w-full h-full max-w-[500px] flex items-center justify-center bg-black overflow-hidden select-none">
              
              {/* Scaled iframe container that pushes outside top & bottom external watermarks */}
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <iframe
                  src={getConcealedEmbedUrl(videoSrc)}
                  title={currentEpisode.title}
                  className="w-[108%] h-[112%] max-w-none object-cover border-0 scale-[1.04] pointer-events-auto"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>

              {/* Mask 1: Top Vignette Scrim - Conceals external video title and share icons */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-20"></div>

              {/* Mask 2: Bottom Right Scrim - Conceals external watermark corner */}
              <div className="absolute bottom-0 right-0 w-32 h-12 bg-gradient-to-tl from-black via-black/80 to-transparent pointer-events-none z-20"></div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoSrc}
                poster={currentEpisode.thumbnail || drama.poster}
                playsInline
                loop={false}
                autoPlay
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                onClick={handleTogglePlay}
                className="w-full h-full object-cover cursor-pointer"
              />

              {/* Big Play overlay icon on pause */}
              {!isPlaying && !isEpisodeLocked && (
                <div
                  onClick={handleTogglePlay}
                  className="cursor-pointer absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
                >
                  <div className="w-16 h-16 rounded-full bg-[#E50914] text-white flex items-center justify-center text-2xl shadow-2xl transform scale-100 hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Top Video Overlay: Clean Branding */}
          {!isEpisodeLocked && (
            <div className="absolute top-3.5 left-3.5 right-14 z-30 pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="bg-[#E50914] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow">
                  EPISODIO {currentEpNumber}
                </span>
                <span className="bg-black/75 backdrop-blur-md text-[#FFD700] text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-700/60">
                  HD OFICIAL
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white drop-shadow-md truncate mt-1">
                {currentEpisode.title}
              </h3>
            </div>
          )}

          {/* Dedicated Fullscreen Toggle Button in top-right of player */}
          <button
            onClick={handleToggleFullscreen}
            className="absolute top-3.5 right-3.5 z-30 w-10 h-10 rounded-full bg-black/80 hover:bg-[#E50914] text-white flex items-center justify-center border border-slate-700 transition-all shadow-xl active:scale-90"
            title={isTheatreFullscreen ? 'Salir de pantalla completa (ESC)' : 'Pantalla Completa (F)'}
          >
            {isTheatreFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Reel Vertical Action Bar (TikTok / ReelShort style) */}
          <div className="absolute right-3.5 bottom-20 flex flex-col items-center gap-3.5 text-white z-30">
            {/* Like */}
            <button
              onClick={handleLike}
              className="flex flex-col items-center group/btn active:scale-90 transition-transform"
              title="Me gusta"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-lg backdrop-blur-md border border-slate-700 transition-colors ${
                  hasLiked ? 'bg-[#FF2E93] text-white' : 'bg-slate-900/80 text-white hover:text-[#FF2E93]'
                }`}
              >
                <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[10px] font-bold mt-1 tabular-nums">
                {likesCount.toLocaleString()}
              </span>
            </button>

            {/* Favorite / Bookmark */}
            <button
              onClick={() => onToggleFavorite(drama.id)}
              className="flex flex-col items-center group/btn active:scale-90 transition-transform"
              title="Guardar serie"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-lg backdrop-blur-md border border-slate-700 transition-colors ${
                  isFavorite ? 'bg-[#FFD700] text-black font-bold' : 'bg-slate-900/80 text-white hover:text-[#FFD700]'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[10px] font-bold mt-1">Guardar</span>
            </button>

            {/* Share / Copy Link */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center group/btn active:scale-90 transition-transform"
              title="Compartir enlace"
            >
              <div className="w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md flex items-center justify-center text-lg border border-slate-700 hover:text-sky-400 transition-colors">
                {shareCopied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
              </div>
              <span className="text-[10px] font-bold mt-1">
                {shareCopied ? '¡Copiado!' : 'Compartir'}
              </span>
            </button>

            {/* Fullscreen Button in Reel Bar */}
            <button
              onClick={handleToggleFullscreen}
              className="flex flex-col items-center group/btn active:scale-90 transition-transform"
              title="Pantalla Completa"
            >
              <div className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center text-lg border transition-colors ${
                isTheatreFullscreen
                  ? 'bg-[#E50914] text-white border-[#E50914]'
                  : 'bg-slate-900/80 hover:bg-[#E50914] border-slate-700 text-white'
              }`}>
                {isTheatreFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </div>
              <span className="text-[10px] font-bold mt-1">
                {isTheatreFullscreen ? 'Salir' : 'Full'}
              </span>
            </button>

            {/* Next / Prev vertical episode navigator */}
            <div className="flex flex-col gap-1 pt-1">
              <button
                onClick={handlePrevEpisode}
                disabled={currentEpNumber <= 1}
                className="w-9 h-9 rounded-full bg-black/60 hover:bg-[#E50914] disabled:opacity-30 disabled:hover:bg-black/60 text-white flex items-center justify-center border border-slate-700 transition-colors"
                title="Capítulo anterior (Flecha Arriba)"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextEpisode}
                disabled={currentEpNumber >= drama.episodes.length}
                className="w-9 h-9 rounded-full bg-black/60 hover:bg-[#E50914] disabled:opacity-30 disabled:hover:bg-black/60 text-white flex items-center justify-center border border-slate-700 transition-colors"
                title="Capítulo siguiente (Flecha Abajo)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Scrubber & Controls (for native videos) */}
          {!isEmbedVideo && !isEpisodeLocked && (
            <div className="absolute left-3 right-3 bottom-3 z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2.5 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#E50914]"
                />
                <span className="text-[10px] text-slate-300 font-mono tabular-nums whitespace-nowrap">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTogglePlay}
                    className="p-1 hover:text-[#E50914] transition-colors"
                    aria-label={isPlaying ? 'Pausa' : 'Reproducir'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    onClick={handleToggleMute}
                    className="p-1 hover:text-[#E50914] transition-colors"
                    aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {/* Speed selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold border border-slate-700 flex items-center gap-1"
                    >
                      <span>{playbackSpeed}x</span>
                    </button>

                    {showSpeedMenu && (
                      <div className="absolute bottom-full left-0 mb-1 bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-2xl flex flex-col gap-0.5 z-40">
                        {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => {
                              setPlaybackSpeed(speed);
                              setShowSpeedMenu(false);
                            }}
                            className={`px-3 py-1 text-[10px] rounded text-left transition-colors ${
                              playbackSpeed === speed
                                ? 'bg-[#E50914] text-white font-bold'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-[10px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoNext}
                      onChange={(e) => setAutoNext(e.target.checked)}
                      className="rounded text-[#E50914] focus:ring-0"
                    />
                    <span>Auto-sig</span>
                  </label>

                  <button
                    onClick={handleToggleFullscreen}
                    className="p-1 hover:text-[#E50914] transition-colors"
                    aria-label="Pantalla completa"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT SIDE: EPISODES & DETAILS PANEL (Hidden in Theatre Fullscreen) ================= */}
        {!isTheatreFullscreen && (
          <div className="flex-grow flex flex-col justify-between p-4 sm:p-6 bg-[#16161E] overflow-y-auto">
            <div>
              {/* Header info */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-xs text-slate-300 mb-2">
                  <span className="text-[#FF2E93] font-bold uppercase tracking-wider">
                    {drama.genre}
                  </span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="text-[#FFD700] font-bold">★ {drama.rating.toFixed(1)}</span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="text-slate-400">{drama.status}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {drama.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed line-clamp-3">
                  {drama.synopsis}
                </p>
              </div>

              {/* Admin Controls Toolbar (Visible ONLY to Admin) */}
              {isAdmin && (
                <div className="mt-3 p-3 bg-red-950/30 border border-red-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-bold text-red-200">
                      Opciones de Administrador:
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenMonetization && (
                      <button
                        onClick={onOpenMonetization}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow"
                        title="Configurar Adsterra Smartlinks y Rewarded Ads"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Smartlinks & Rewarded Ads</span>
                      </button>
                    )}

                    <button
                      onClick={handleDeleteCurrentEpisode}
                      className="px-3 py-1.5 bg-red-900/80 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow"
                      title="Eliminar este capítulo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar Capítulo {currentEpisode.episodeNumber}</span>
                    </button>

                    <button
                      onClick={handleDeleteCurrentDrama}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-red-950 text-red-300 hover:text-red-200 border border-red-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                      title="Eliminar toda la serie"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar Serie</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Episode selector header with search and upload button */}
              <div className="mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-200">
                      Episodios ({drama.episodes.length})
                    </h4>
                    {monetizationSettings.enabled && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Contenido Exclusivo</span>
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => onOpenUploadForDrama(drama.id)}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#E50914] to-[#FF2E93] hover:from-red-600 hover:to-pink-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all self-start sm:self-auto"
                      title="Subir nuevo capítulo a esta serie (Modo Administrador)"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Capítulo a esta Serie</span>
                    </button>
                  )}
                </div>

                {/* Episode Search */}
                {drama.episodes.length > 8 && (
                  <div className="mb-3">
                    <input
                      type="text"
                      value={episodeSearch}
                      onChange={(e) => setEpisodeSearch(e.target.value)}
                      placeholder="Filtrar por número o título..."
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                )}

                {/* Episode buttons grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-52 sm:max-h-64 overflow-y-auto pr-1 no-scrollbar">
                  {filteredEpisodes.map((ep) => {
                    const isActive = ep.episodeNumber === currentEpNumber;
                    const isLocked =
                      monetizationSettings.enabled &&
                      ep.episodeNumber > monetizationSettings.freeEpisodesCount &&
                      !isUnlocked(drama.id, ep.episodeNumber);

                    return (
                      <div key={ep.id} className="relative group/ep">
                        <button
                          onClick={() => {
                            setCurrentEpNumber(ep.episodeNumber);
                            setIsPlaying(true);
                          }}
                          className={`w-full py-2.5 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                            isActive
                              ? 'bg-[#E50914] text-white border-[#E50914] shadow-lg shadow-[#E50914]/25 scale-[1.02]'
                              : isLocked
                              ? 'bg-slate-900/90 text-amber-300/90 border-amber-500/30 hover:border-amber-500'
                              : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {isLocked ? (
                              <Lock className="w-3 h-3 text-amber-400" />
                            ) : isActive ? (
                              <Play className="w-3 h-3 fill-current" />
                            ) : null}
                            <span>Ep. {ep.episodeNumber}</span>
                          </div>
                          <div className="text-[9px] text-slate-400 font-normal truncate mt-0.5">
                            {isLocked ? 'Desbloquear' : ep.duration || '1:30'}
                          </div>
                        </button>

                        {/* Admin inline episode deletion button */}
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEpisode?.(drama.id, ep.id);
                            }}
                            className="opacity-0 group-hover/ep:opacity-100 absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-[10px] shadow transition-opacity"
                            title="Eliminar este capítulo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Current episode detail synopsis */}
                {currentEpisode.synopsis && (
                  <div className="mt-4 p-3 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs text-slate-400">
                    <span className="font-bold text-slate-300 block mb-0.5">
                      {currentEpisode.title}
                    </span>
                    <span>{currentEpisode.synopsis}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 mt-4">
              <button
                onClick={handleShare}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{shareCopied ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#E50914] hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
