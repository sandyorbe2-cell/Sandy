import React, { useState, useEffect } from 'react';
import { Drama, VideoSourceType, MonetizationSettings } from './types/drama';
import {
  getDramas,
  saveDramas,
  createDrama,
  addEpisodeToDrama,
  deleteDrama,
  deleteEpisode,
  getFavorites,
  toggleFavorite,
  recordWatch,
  exportCatalogJson,
  importCatalogJson,
  resetToDefaults,
  isAdminLoggedIn,
  getMonetizationSettings,
  saveMonetizationSettings,
  isEpisodeUnlocked,
  unlockEpisode,
  recordSmartlinkClick,
  getUserCoins,
  addCoins,
  spendCoins,
} from './services/storage';

import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { GenreFilter } from './components/GenreFilter';
import { DramaGrid } from './components/DramaGrid';
import { NovelasRow } from './components/NovelasRow';
import { PlayerModal } from './components/PlayerModal';
import { UploadModal } from './components/UploadModal';
import { CreatorStudio } from './components/CreatorStudio';
import { FavoritesModal } from './components/FavoritesModal';
import { BloggerExportModal } from './components/BloggerExportModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { MonetizationSettingsModal } from './components/MonetizationSettingsModal';
import { CoinsModal } from './components/CoinsModal';
import { Footer } from './components/Footer';
import { Sparkles, ExternalLink } from 'lucide-react';

interface PendingDelete {
  type: 'drama' | 'episode';
  dramaId: string;
  episodeId?: string;
  title: string;
  itemName: string;
  description: string;
}

export default function App() {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Todos');
  const [showCustomOnly, setShowCustomOnly] = useState(false);

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Pending deletion state
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  // Modals state
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activePlayerDrama, setActivePlayerDrama] = useState<Drama | null>(null);
  const [activePlayerEpisode, setActivePlayerEpisode] = useState(1);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTargetDramaId, setUploadTargetDramaId] = useState<string | undefined>(undefined);

  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isBloggerModalOpen, setIsBloggerModalOpen] = useState(false);

  // Monetization & Rewarded Ads state
  const [monetizationSettings, setMonetizationSettings] = useState<MonetizationSettings>(getMonetizationSettings());
  const [isMonetizationOpen, setIsMonetizationOpen] = useState(false);
  const [, setUnlockedVersion] = useState(0);

  // Coins Wallet state
  const [coins, setCoins] = useState<number>(getUserCoins());
  const [isCoinsModalOpen, setIsCoinsModalOpen] = useState(false);
  const [coinsAdCountdown, setCoinsAdCountdown] = useState<number | null>(null);
  const [isWatchingCoinsAd, setIsWatchingCoinsAd] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Initial load
  useEffect(() => {
    const loadedDramas = getDramas();
    setDramas(loadedDramas);
    setFavorites(getFavorites());
    setIsAdmin(isAdminLoggedIn());
    setMonetizationSettings(getMonetizationSettings());
    setCoins(getUserCoins());
  }, []);

  // Monetization Handlers
  const handleSaveMonetizationSettings = (newSettings: MonetizationSettings) => {
    saveMonetizationSettings(newSettings);
    setMonetizationSettings(newSettings);
  };

  const handleUnlockEpisode = (dramaId: string, episodeNumber: number) => {
    unlockEpisode(dramaId, episodeNumber);
    setMonetizationSettings(getMonetizationSettings());
    setUnlockedVersion((v) => v + 1);
    showToast(`¡Capítulo ${episodeNumber} desbloqueado exitosamente!`);
  };

  // Coins Handlers
  const handleEarnCoins = (amount: number) => {
    const newTotal = addCoins(amount);
    setCoins(newTotal);
    showToast(`¡+${amount} Monedas agregadas a tu billetera! (Total: ${newTotal})`);
  };

  const handleUnlockWithCoins = (dramaId: string, episodeNumber: number, cost: number): boolean => {
    const current = getUserCoins();
    if (current < cost) {
      showToast(`Necesitas ${cost} monedas para desbloquear este capítulo. Tienes ${current}. Mira un anuncio para ganar más.`);
      setIsCoinsModalOpen(true);
      return false;
    }
    const spent = spendCoins(cost);
    if (spent) {
      const remaining = getUserCoins();
      setCoins(remaining);
      unlockEpisode(dramaId, episodeNumber);
      setMonetizationSettings(getMonetizationSettings());
      setUnlockedVersion((v) => v + 1);
      showToast(`¡Capítulo ${episodeNumber} desbloqueado con ${cost} monedas! (Saldo: ${remaining})`);
      return true;
    }
    return false;
  };

  // Watch Ad from CoinsModal (15 seconds)
  const handleWatchAdForCoins = () => {
    recordSmartlinkClick();
    setMonetizationSettings(getMonetizationSettings());
    setIsWatchingCoinsAd(true);
    let timeLeft = monetizationSettings.rewardCountdownSeconds || 15;
    setCoinsAdCountdown(timeLeft);

    const interval = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        clearInterval(interval);
        setCoinsAdCountdown(null);
        setIsWatchingCoinsAd(false);
        const reward = monetizationSettings.coinsPerAd || 2;
        handleEarnCoins(reward);
      } else {
        setCoinsAdCountdown(timeLeft);
      }
    }, 1000);
  };

  const handleSmartlinkClick = () => {
    recordSmartlinkClick();
    setMonetizationSettings(getMonetizationSettings());
  };

  const handleOpenMonetization = () => {
    if (!isAdmin) {
      showToast('Acceso restringido: Inicia sesión como administrador para configurar monetización.');
      setIsAdminModalOpen(true);
      return;
    }
    setIsMonetizationOpen(true);
  };

  // Global Smartlink handler for ALL devices entering the page
  useEffect(() => {
    if (!monetizationSettings.enabled || monetizationSettings.globalSmartlinkEnabled === false) {
      return;
    }
    const smartlinkUrl =
      monetizationSettings.adsterraSmartlinkUrl ||
      'https://asiafilm.org/4/d7b5b0245e4c479a08fb56712e7ba62d';
    if (!smartlinkUrl) return;

    const handleVisitorInteraction = (e: MouseEvent) => {
      // Don't pop if clicking inside admin modal, settings modal or admin delete buttons
      const target = e.target as HTMLElement | null;
      if (
        isAdminModalOpen ||
        isMonetizationOpen ||
        isUploadOpen ||
        target?.closest('[data-no-global-ad]') ||
        target?.closest('.admin-restricted')
      ) {
        return;
      }

      const sessionKey = 'sanshort_global_smartlink_seen';
      const lastTsKey = 'sanshort_global_smartlink_last_ts';
      const freq = monetizationSettings.globalFrequency || 'session';

      if (freq === 'session') {
        if (sessionStorage.getItem(sessionKey)) return;
      } else if (freq === 'interval') {
        const lastTs = Number(sessionStorage.getItem(lastTsKey) || '0');
        if (Date.now() - lastTs < 5 * 60 * 1000) return; // 5 minutes
      }

      // Mark triggered and record ad click stats
      sessionStorage.setItem(sessionKey, 'true');
      sessionStorage.setItem(lastTsKey, String(Date.now()));
      recordSmartlinkClick();
      setMonetizationSettings(getMonetizationSettings());

      // Open Adsterra Smartlink in a new tab synchronously on user click/touch
      try {
        window.open(smartlinkUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.error('Error launching Adsterra Smartlink:', err);
      }
    };

    document.addEventListener('click', handleVisitorInteraction, { capture: true });

    return () => {
      document.removeEventListener('click', handleVisitorInteraction, { capture: true });
    };
  }, [monetizationSettings, isAdminModalOpen, isMonetizationOpen, isUploadOpen]);

  // Sync state helper
  const refreshDramas = () => {
    const updated = getDramas();
    setDramas(updated);
    // If player is open with active drama, update the active drama object
    if (activePlayerDrama) {
      const refreshedActive = updated.find((d) => d.id === activePlayerDrama.id);
      if (refreshedActive) {
        setActivePlayerDrama(refreshedActive);
      }
    }
  };

  // Filter dramas by search query, genre, and custom uploads
  const filteredDramas = dramas.filter((d) => {
    // Search query filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      d.title.toLowerCase().includes(query) ||
      d.synopsis.toLowerCase().includes(query) ||
      d.genre.toLowerCase().includes(query) ||
      d.tags.some((t) => t.toLowerCase().includes(query)) ||
      d.episodes.some((e) => e.title.toLowerCase().includes(query));

    // Genre filter
    const matchesGenre =
      selectedGenre === 'Todos' ||
      d.genre.toLowerCase() === selectedGenre.toLowerCase();

    // Custom uploads filter
    const matchesCustom = !showCustomOnly || d.isCustom;

    return matchesSearch && matchesGenre && matchesCustom;
  });

  const customDramasCount = dramas.filter((d) => d.isCustom).length;

  // Toggle Favorite
  const handleToggleFavorite = (dramaId: string) => {
    const isNowFavorite = toggleFavorite(dramaId);
    setFavorites(getFavorites());
    showToast(isNowFavorite ? '¡Guardado en Mi Lista!' : 'Eliminado de Mi Lista');
  };

  // Open Player Modal
  const handleOpenPlayer = (drama: Drama, episodeNumber: number = 1) => {
    setActivePlayerDrama(drama);
    setActivePlayerEpisode(episodeNumber);
    setIsPlayerOpen(true);
  };

  // Open Upload Modal with Admin check
  const handleOpenUpload = (dramaId?: string) => {
    if (!isAdmin) {
      showToast('Acceso restringido: Solo el Administrador puede subir capítulos.');
      setIsAdminModalOpen(true);
      return;
    }
    setUploadTargetDramaId(dramaId);
    setIsUploadOpen(true);
  };

  // Add Episode handler (Admin checked)
  const handleAddEpisode = async (
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
  ) => {
    if (!isAdmin) {
      showToast('Acceso restringido: Inicia sesión como administrador.');
      setIsAdminModalOpen(true);
      return;
    }
    await addEpisodeToDrama(dramaId, episodeData);
    refreshDramas();
    showToast(`¡Capítulo añadido exitosamente!`);
  };

  // Create Drama handler (Admin checked)
  const handleCreateDrama = (
    dramaData: Omit<Drama, 'id' | 'createdAt' | 'updatedAt' | 'episodes' | 'episodesCount' | 'rating' | 'likesCount' | 'viewsCount'>
  ) => {
    if (!isAdmin) {
      showToast('Solo el administrador puede crear nuevas series.');
      setIsAdminModalOpen(true);
      throw new Error('Solo el administrador puede crear series.');
    }
    const created = createDrama(dramaData);
    refreshDramas();
    showToast(`¡Serie "${created.title}" creada!`);
    return created;
  };

  // Delete Drama handler (Admin checked with in-app confirmation modal)
  const handleDeleteDrama = (dramaId: string) => {
    if (!isAdmin) {
      showToast('Acceso restringido: Inicia sesión como Administrador para eliminar series.');
      setIsAdminModalOpen(true);
      return;
    }
    const targetDrama = dramas.find((d) => d.id === dramaId);
    if (!targetDrama) return;

    setPendingDelete({
      type: 'drama',
      dramaId,
      title: '¿Eliminar Mini-Drama Completo?',
      itemName: targetDrama.title,
      description: `Se eliminará la serie "${targetDrama.title}" junto con todos sus ${targetDrama.episodes.length} capítulos y archivos locales. Esta acción no se puede deshacer.`,
    });
  };

  // Delete Episode handler (Admin checked with in-app confirmation modal)
  const handleDeleteEpisode = (dramaId: string, episodeId: string) => {
    if (!isAdmin) {
      showToast('Acceso restringido: Inicia sesión como Administrador para eliminar capítulos.');
      setIsAdminModalOpen(true);
      return;
    }
    const targetDrama = dramas.find((d) => d.id === dramaId);
    const targetEp = targetDrama?.episodes.find((e) => e.id === episodeId);
    if (!targetDrama || !targetEp) return;

    setPendingDelete({
      type: 'episode',
      dramaId,
      episodeId,
      title: '¿Eliminar Capítulo?',
      itemName: `${targetEp.title} (${targetDrama.title})`,
      description: `Se eliminará permanentemente el Capítulo ${targetEp.episodeNumber} de la serie.`,
    });
  };

  // Execute deletion upon confirmation
  const handleExecuteDelete = async () => {
    if (!pendingDelete) return;

    if (pendingDelete.type === 'drama') {
      deleteDrama(pendingDelete.dramaId);
      refreshDramas();
      if (activePlayerDrama?.id === pendingDelete.dramaId) {
        setIsPlayerOpen(false);
        setActivePlayerDrama(null);
      }
      showToast(`Serie "${pendingDelete.itemName}" eliminada con éxito.`);
    } else if (pendingDelete.type === 'episode' && pendingDelete.episodeId) {
      await deleteEpisode(pendingDelete.dramaId, pendingDelete.episodeId);
      refreshDramas();
      showToast(`Capítulo eliminado con éxito.`);
    }

    setPendingDelete(null);
  };

  // Record watch history
  const handleRecordWatch = (dramaId: string, episodeNumber: number) => {
    recordWatch(dramaId, episodeNumber);
  };

  // Export JSON
  const handleExportJson = () => {
    const json = exportCatalogJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanshort_catalogo_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Respaldo descargado como archivo JSON');
  };

  // Import JSON
  const handleImportJson = (jsonString: string) => {
    if (!isAdmin) {
      showToast('Solo el administrador puede importar respaldos.');
      setIsAdminModalOpen(true);
      return false;
    }
    const ok = importCatalogJson(jsonString);
    if (ok) {
      refreshDramas();
      showToast('¡Catálogo importado correctamente!');
    }
    return ok;
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (!isAdmin) {
      showToast('Solo el administrador puede restaurar el catálogo.');
      setIsAdminModalOpen(true);
      return;
    }
    resetToDefaults();
    refreshDramas();
    setFavorites([]);
    showToast('Catálogo restaurado a datos predeterminados');
  };

  // Scroll to section
  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0D0D11] text-slate-100 selection:bg-[#E50914] selection:text-white">
      
      {/* Top Bar Header with Admin auth controls */}
      <Header
        favoritesCount={favorites.length}
        searchQuery={searchQuery}
        isAdmin={isAdmin}
        coins={coins}
        onSearchChange={setSearchQuery}
        onOpenUpload={() => handleOpenUpload()}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenStudio={() => setIsStudioOpen(true)}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
        onOpenCoins={() => setIsCoinsModalOpen(true)}
        onOpenMonetization={handleOpenMonetization}
        onNavigateSection={handleNavigateSection}
      />

      {/* Main Content Area (No ads on main page as user requested) */}
      <main className="flex-grow">
        
        {/* Spotlight Hero Banner (only when no search is active) */}
        {!searchQuery && dramas.length > 0 && (
          <HeroBanner
            dramas={dramas}
            isAdmin={isAdmin}
            isFavorite={(id) => favorites.includes(id)}
            onToggleFavorite={handleToggleFavorite}
            onPlayDrama={handleOpenPlayer}
            onOpenUploadForDrama={handleOpenUpload}
            onDeleteDrama={handleDeleteDrama}
          />
        )}

        {/* Categories / Genre Filter */}
        <GenreFilter
          selectedGenre={selectedGenre}
          onSelectGenre={setSelectedGenre}
          showCustomOnly={showCustomOnly}
          onToggleCustomOnly={() => setShowCustomOnly(!showCustomOnly)}
          customCount={customDramasCount}
        />

        {/* Main Dramas Grid with Admin deletion option */}
        <DramaGrid
          dramas={filteredDramas}
          title={
            searchQuery
              ? `Resultados para "${searchQuery}"`
              : selectedGenre === 'Todos'
              ? 'Mini-Dramas en Tendencia'
              : `Categoría: ${selectedGenre}`
          }
          favorites={favorites}
          isAdmin={isAdmin}
          onToggleFavorite={handleToggleFavorite}
          onOpenPlayer={handleOpenPlayer}
          onOpenUpload={handleOpenUpload}
          onDeleteDrama={handleDeleteDrama}
        />

        {/* Special Novelas Row (only when no search is active) */}
        {!searchQuery && dramas.length > 0 && (
          <NovelasRow
            dramas={dramas}
            onOpenPlayer={handleOpenPlayer}
            onNavigateCatalog={() => handleNavigateSection('populares')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* ================= MODALS ================= */}

      {/* 9:16 Vertical Reel Player Modal with concealed YouTube, fullscreen and admin deletion */}
      {isPlayerOpen && activePlayerDrama && (
        <PlayerModal
          drama={activePlayerDrama}
          initialEpisodeNumber={activePlayerEpisode}
          isOpen={isPlayerOpen}
          isAdmin={isAdmin}
          monetizationSettings={monetizationSettings}
          coins={coins}
          onClose={() => setIsPlayerOpen(false)}
          isFavorite={favorites.includes(activePlayerDrama.id)}
          onToggleFavorite={handleToggleFavorite}
          onRecordWatch={handleRecordWatch}
          onOpenUploadForDrama={handleOpenUpload}
          onDeleteEpisode={handleDeleteEpisode}
          onDeleteDrama={handleDeleteDrama}
          onOpenMonetization={handleOpenMonetization}
          onOpenCoinsModal={() => setIsCoinsModalOpen(true)}
          isUnlocked={(dramaId, episodeNumber) =>
            isEpisodeUnlocked(dramaId, episodeNumber, monetizationSettings.freeEpisodesCount)
          }
          onUnlockEpisode={handleUnlockEpisode}
          onUnlockWithCoins={handleUnlockWithCoins}
          onEarnCoinsFromAd={handleEarnCoins}
          onSmartlinkClick={handleSmartlinkClick}
        />
      )}

      {/* Upload Episode & Drama Modal (Admin Only) */}
      {isUploadOpen && (
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          dramas={dramas}
          selectedDramaId={uploadTargetDramaId}
          onAddEpisode={handleAddEpisode}
          onCreateDrama={handleCreateDrama}
        />
      )}

      {/* Creator Studio Modal */}
      {isStudioOpen && (
        <CreatorStudio
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          dramas={dramas}
          isAdmin={isAdmin}
          onOpenAdminLogin={() => setIsAdminModalOpen(true)}
          onOpenUpload={handleOpenUpload}
          onOpenPlayer={handleOpenPlayer}
          onDeleteDrama={handleDeleteDrama}
          onDeleteEpisode={handleDeleteEpisode}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          onOpenBloggerModal={() => setIsBloggerModalOpen(true)}
          onOpenMonetization={handleOpenMonetization}
          onResetDefaults={handleResetDefaults}
        />
      )}

      {/* Favorites Modal */}
      {isFavoritesOpen && (
        <FavoritesModal
          isOpen={isFavoritesOpen}
          onClose={() => setIsFavoritesOpen(false)}
          favorites={favorites}
          dramas={dramas}
          onToggleFavorite={handleToggleFavorite}
          onOpenPlayer={handleOpenPlayer}
        />
      )}

      {/* Blogger Export Modal */}
      {isBloggerModalOpen && (
        <BloggerExportModal
          isOpen={isBloggerModalOpen}
          onClose={() => setIsBloggerModalOpen(false)}
          dramas={dramas}
        />
      )}

      {/* Admin Login & Security Modal */}
      {isAdminModalOpen && (
        <AdminLoginModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          isAdmin={isAdmin}
          onAdminStatusChange={setIsAdmin}
          onSuccessMessage={showToast}
          onOpenMonetization={handleOpenMonetization}
        />
      )}

      {/* Adsterra Smartlinks & Rewarded Ads Monetization Settings Modal */}
      {isMonetizationOpen && (
        <MonetizationSettingsModal
          isOpen={isMonetizationOpen}
          onClose={() => setIsMonetizationOpen(false)}
          settings={monetizationSettings}
          onSaveSettings={handleSaveMonetizationSettings}
          onSuccessMessage={showToast}
        />
      )}

      {/* Coins Wallet Modal (Earn coins watching 15s Adsterra Smartlink) */}
      {isCoinsModalOpen && (
        <CoinsModal
          isOpen={isCoinsModalOpen}
          onClose={() => {
            setIsCoinsModalOpen(false);
            setCoinsAdCountdown(null);
            setIsWatchingCoinsAd(false);
          }}
          coins={coins}
          monetizationSettings={monetizationSettings}
          onWatchAdForCoins={handleWatchAdForCoins}
          isWatchingAd={isWatchingCoinsAd}
          adCountdown={coinsAdCountdown}
        />
      )}

      {/* In-App Confirmation Modal for Deleting Drama or Episode */}
      {pendingDelete && (
        <ConfirmDeleteModal
          isOpen={!!pendingDelete}
          onClose={() => setPendingDelete(null)}
          onConfirm={handleExecuteDelete}
          title={pendingDelete.title}
          description={pendingDelete.description}
          itemName={pendingDelete.itemName}
        />
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16161E] border border-[#E50914] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700]"></span>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
