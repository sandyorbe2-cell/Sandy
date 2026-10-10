import React, { useState } from 'react';
import { Search, Bookmark, PlusCircle, LayoutDashboard, Menu, X, ShieldCheck, Lock, Sparkles, Coins } from 'lucide-react';

interface HeaderProps {
  favoritesCount: number;
  searchQuery: string;
  isAdmin: boolean;
  coins?: number;
  onSearchChange: (query: string) => void;
  onOpenUpload: () => void;
  onOpenFavorites: () => void;
  onOpenStudio: () => void;
  onOpenAdminLogin: () => void;
  onOpenCoins?: () => void;
  onOpenMonetization?: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  favoritesCount,
  searchQuery,
  isAdmin,
  coins = 0,
  onSearchChange,
  onOpenUpload,
  onOpenFavorites,
  onOpenStudio,
  onOpenAdminLogin,
  onOpenCoins,
  onOpenMonetization,
  onNavigateSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0D0D11]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element brand wordmark */}
        <button
          onClick={() => onNavigateSection('hero')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E50914] via-[#FF2E93] to-[#FFD700] flex items-center justify-center font-black text-lg text-white shadow-lg shadow-[#E50914]/25 transform group-hover:scale-105 transition-transform duration-200">
            S
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white whitespace-nowrap">
            San<span className="text-[#E50914]">Short</span>
          </span>
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigateSection('populares')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Inicio
          </button>
          <button
            onClick={() => onNavigateSection('populares')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Tendencias
          </button>
          <button
            onClick={() => onNavigateSection('mininovelas')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Mini-Novelas
          </button>
          <button
            onClick={onOpenFavorites}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Bookmark className="w-4 h-4 text-[#FFD700]" />
            <span>Mi Lista</span>
            {favoritesCount > 0 && (
              <span className="text-xs bg-[#E50914] text-white px-1.5 py-0.2 rounded-full font-bold">
                {favoritesCount}
              </span>
            )}
          </button>
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 text-slate-400"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Estudio</span>
          </button>
        </nav>

        {/* Zone 3: Search & Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Desktop Search input */}
          <div className="relative hidden lg:block w-48 xl:w-56">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar drama o capítulo..."
              className="w-full bg-slate-900/90 text-xs text-slate-100 placeholder-slate-500 pl-9 pr-3 py-2 rounded-xl border border-slate-700/60 focus:outline-none focus:border-[#E50914] transition-colors"
            />
          </div>

          {/* Coins Wallet Badge */}
          {onOpenCoins && (
            <button
              onClick={onOpenCoins}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40 transition-all shadow-sm active:scale-95"
              title="Tu saldo de monedas. Haz clic para conseguir más viendo anuncios de 15 segundos"
            >
              <Coins className="w-4 h-4 text-amber-400 fill-current" />
              <span className="tabular-nums font-black text-amber-300">{coins}</span>
              <span className="hidden sm:inline text-[11px] font-bold text-amber-400/90">Monedas</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-extrabold hidden md:inline">
                + Conseguir
              </span>
            </button>
          )}

          {/* Admin Mode Toggle / Status button */}
          <button
            onClick={onOpenAdminLogin}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              isAdmin
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
            title={isAdmin ? 'Modo Administrador Activo' : 'Iniciar sesión como Administrador'}
          >
            {isAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Admin</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Acceso Admin</span>
              </>
            )}
          </button>

          {/* Adsterra Smartlinks & Rewarded Ads quick config button for Admin */}
          {isAdmin && onOpenMonetization && (
            <button
              onClick={onOpenMonetization}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors shadow-sm"
              title="Configurar Smartlinks de Adsterra y Rewarded Ads"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Adsterra Smartlinks</span>
            </button>
          )}

          {/* Mobile search toggle button */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white bg-slate-800/60 rounded-xl"
            aria-label="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Mi Lista quick mobile icon */}
          <button
            onClick={onOpenFavorites}
            className="md:hidden relative p-2 text-slate-300 hover:text-[#FFD700] bg-slate-800/60 rounded-xl"
            aria-label="Favoritos"
          >
            <Bookmark className="w-4 h-4" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E50914] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Primary CTA: Subir Capítulo (Solo visible en modo Administrador) */}
          {isAdmin && (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-[#E50914] to-[#FF2E93] hover:from-red-600 hover:to-pink-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-[#E50914]/20 active:scale-95 transition-all whitespace-nowrap shrink-0"
              title="Subir nuevo capítulo (Modo Administrador Activo)"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Subir Capítulo</span>
            </button>
          )}

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white bg-slate-800/60 rounded-xl"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile search bar dropdown */}
      {mobileSearchOpen && (
        <div className="lg:hidden px-4 pb-3 pt-1 border-t border-slate-800/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por título, venganza, CEO..."
              className="w-full bg-slate-900 text-xs text-slate-100 placeholder-slate-500 pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-[#E50914]"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile nav menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D0D11] border-b border-slate-800 px-4 py-3 space-y-2 text-sm font-medium">
          <button
            onClick={() => {
              onNavigateSection('populares');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
          >
            Tendencias y Populares
          </button>
          <button
            onClick={() => {
              onNavigateSection('mininovelas');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
          >
            Mini-Novelas Exclusivas
          </button>
          {onOpenCoins && (
            <button
              onClick={() => {
                onOpenCoins();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-amber-300 hover:bg-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400 fill-current" />
                <span className="font-bold">Monedas (Desbloquear caps)</span>
              </div>
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-black">
                {coins} Monedas
              </span>
            </button>
          )}
          <button
            onClick={() => {
              onOpenFavorites();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 flex items-center justify-between"
          >
            <span>Mi Lista Guardada</span>
            <span className="text-xs bg-slate-800 text-[#FFD700] px-2 py-0.5 rounded-full font-bold">
              {favoritesCount}
            </span>
          </button>
          <button
            onClick={() => {
              onOpenStudio();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 flex items-center gap-2 text-[#FF2E93]"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Estudio Creador</span>
          </button>
          {isAdmin && onOpenMonetization && (
            <button
              onClick={() => {
                onOpenMonetization();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-amber-300 hover:bg-slate-800 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Smartlinks Adsterra & Rewarded Ads</span>
            </button>
          )}
          <button
            onClick={() => {
              onOpenAdminLogin();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 flex items-center gap-2 text-emerald-400"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAdmin ? 'Modo Administrador (Activo)' : 'Iniciar Sesión Admin'}</span>
          </button>
        </div>
      )}
    </header>
  );
};
