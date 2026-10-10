import React, { useState } from 'react';
import { X, DollarSign, ExternalLink, ShieldCheck, Check, Sparkles, TrendingUp, Lock, RefreshCw, AlertCircle, Coins } from 'lucide-react';
import { MonetizationSettings } from '../types/drama';

interface MonetizationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: MonetizationSettings;
  onSaveSettings: (settings: MonetizationSettings) => void;
  onSuccessMessage: (msg: string) => void;
}

export const MonetizationSettingsModal: React.FC<MonetizationSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onSuccessMessage,
}) => {
  const [enabled, setEnabled] = useState(settings.enabled);
  const [adsterraSmartlinkUrl, setAdsterraSmartlinkUrl] = useState(settings.adsterraSmartlinkUrl || 'https://asiafilm.org/4/d7b5b0245e4c479a08fb56712e7ba62d');
  const [secondarySmartlinkUrl, setSecondarySmartlinkUrl] = useState(settings.secondarySmartlinkUrl || '');
  const [freeEpisodesCount, setFreeEpisodesCount] = useState(settings.freeEpisodesCount || 3);
  const [rewardCountdownSeconds, setRewardCountdownSeconds] = useState(settings.rewardCountdownSeconds || 15);
  const [coinsPerAd, setCoinsPerAd] = useState(settings.coinsPerAd || 2);
  const [coinsToUnlockEpisode, setCoinsToUnlockEpisode] = useState(settings.coinsToUnlockEpisode || 5);
  const [globalSmartlinkEnabled, setGlobalSmartlinkEnabled] = useState(settings.globalSmartlinkEnabled === true);
  const [globalFrequency, setGlobalFrequency] = useState<'session' | 'interval' | 'every_click'>(settings.globalFrequency || 'session');
  const [bannerAdEnabled, setBannerAdEnabled] = useState(settings.bannerAdEnabled === true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: MonetizationSettings = {
      ...settings,
      enabled,
      adsterraSmartlinkUrl: adsterraSmartlinkUrl.trim() || 'https://asiafilm.org/4/d7b5b0245e4c479a08fb56712e7ba62d',
      secondarySmartlinkUrl: secondarySmartlinkUrl.trim(),
      freeEpisodesCount: Math.max(0, Number(freeEpisodesCount)),
      rewardCountdownSeconds: Math.max(1, Number(rewardCountdownSeconds)),
      coinsPerAd: Math.max(1, Number(coinsPerAd)),
      coinsToUnlockEpisode: Math.max(1, Number(coinsToUnlockEpisode)),
      globalSmartlinkEnabled,
      globalFrequency,
      bannerAdEnabled,
    };

    onSaveSettings(updated);
    setSavedSuccess(true);
    onSuccessMessage('¡Configuración de Monetización, Monedas y Smartlink guardada exitosamente!');
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#16161E] rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-2xl max-h-[92vh] flex flex-col my-auto text-left">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-800 pb-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <DollarSign className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white">
                Monetización & Smartlinks de Adsterra
              </h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full">
                Rewarded Ads
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Configura tus enlaces directos de Adsterra para monetizar la visualización de capítulos
            </p>
          </div>
        </div>

        {/* Stats Preview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Clics en Smartlink
            </span>
            <span className="text-lg font-black text-amber-400 tabular-nums">
              {(settings.clicksCount || 0).toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Caps Desbloqueados
            </span>
            <span className="text-lg font-black text-emerald-400 tabular-nums">
              {(settings.unlockedEpisodesCount || 0).toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Estado Rewarded
            </span>
            <span className={`text-xs font-black flex items-center gap-1 mt-1 ${enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
              <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
              <span>{enabled ? 'Monetización Activa' : 'Desactivada'}</span>
            </span>
          </div>
        </div>

        {/* Saved Success Alert */}
        {savedSuccess && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>¡Configuración guardada exitosamente!</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4 flex-grow overflow-y-auto pr-1 no-scrollbar">
          
          {/* Toggle Monetization */}
          <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">
                Activar Rewarded Ads (Anuncios Bonificados)
              </span>
              <span className="text-[11px] text-slate-400">
                Bloquea los capítulos posteriores para que los espectadores vean un anuncio o smartlink para desbloquearlos.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E50914]"></div>
            </label>
          </div>

          {/* Adsterra Smartlink URL input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>URL del Smartlink de Adsterra (Direct Link)</span>
              </label>
              {adsterraSmartlinkUrl && (
                <a
                  href={adsterraSmartlinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>Probar enlace</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                required={enabled}
                value={adsterraSmartlinkUrl}
                onChange={(e) => setAdsterraSmartlinkUrl(e.target.value)}
                placeholder="https://asiafilm.org/... o tu enlace directo de Adsterra"
                className="flex-grow bg-slate-900 border border-slate-700 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (adsterraSmartlinkUrl) {
                    window.open(adsterraSmartlinkUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                disabled={!adsterraSmartlinkUrl}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1 shrink-0 transition-colors"
                title="Abrir enlace en nueva pestaña para probar"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Probar</span>
              </button>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[11px] text-slate-400">
                Enlace configurado: <code className="text-amber-400 font-mono text-[10px] break-all">{adsterraSmartlinkUrl}</code>
              </span>
              <button
                type="button"
                onClick={() => setAdsterraSmartlinkUrl('https://asiafilm.org/4/d7b5b0245e4c479a08fb56712e7ba62d')}
                className="text-[10px] text-amber-400 hover:underline shrink-0 font-semibold ml-2"
              >
                Restaurar Smartlink Asiafilm
              </button>
            </div>
          </div>

          {/* Global Popunder / On-Click for all devices */}
          <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Activar en todos los dispositivos que entren (Popunder / On-Click)
                </span>
                <span className="text-[11px] text-slate-400">
                  Abre tu Smartlink de Adsterra automáticamente en una nueva pestaña cuando cualquier visitante interactúa con la página desde su móvil, tablet o PC.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
                <input
                  type="checkbox"
                  checked={globalSmartlinkEnabled}
                  onChange={(e) => setGlobalSmartlinkEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {globalSmartlinkEnabled && (
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] text-slate-300 font-semibold">
                  Frecuencia de apertura en los dispositivos:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setGlobalFrequency('session')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                      globalFrequency === 'session'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    1 vez por sesión (Recomendado)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGlobalFrequency('interval')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                      globalFrequency === 'interval'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Cada 5 min
                  </button>
                  <button
                    type="button"
                    onClick={() => setGlobalFrequency('every_click')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                      globalFrequency === 'every_click'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Cada clic
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Banner Ad Bar Toggle */}
          <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">
                Barra de Anuncios y Patrocinador en la cabecera
              </span>
              <span className="text-[11px] text-slate-400">
                Muestra una barra destacada visible para todos los visitantes para apoyar la web con el Smartlink.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
              <input
                type="checkbox"
                checked={bannerAdEnabled}
                onChange={(e) => setBannerAdEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Secondary Smartlink (Optional Popunder / Backup link) */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <span>Smartlink Secundario / Respaldo (Opcional)</span>
            </label>
            <input
              type="url"
              value={secondarySmartlinkUrl}
              onChange={(e) => setSecondarySmartlinkUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-900 border border-slate-700 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
            />
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Enlace de rotación opcional para campañas secundarias o respaldo.
            </span>
          </div>

          {/* Settings Grid: Free Episodes & Countdown Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#FF2E93]" />
                  <span>Capítulos Gratuitos Iniciales</span>
                </label>
              </div>
              <input
                type="number"
                min="0"
                max="50"
                value={freeEpisodesCount}
                onChange={(e) => setFreeEpisodesCount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-xs text-white px-3.5 py-2 rounded-xl focus:outline-none focus:border-amber-500"
              />
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] text-slate-400">Preajustes:</span>
                {[0, 1, 2, 3, 5].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setFreeEpisodesCount(count)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors ${
                      freeEpisodesCount === count
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {count === 0 ? '0 (Todo bloqueado)' : `${count} gratis`}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Ej: Si configuras <strong>3</strong>, los episodios 1, 2 y 3 serán gratis; a partir del <strong>4</strong> se pedirá Monedas o Anuncio.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                <span>Tiempo en el anuncio (Segundos)</span>
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={rewardCountdownSeconds}
                onChange={(e) => setRewardCountdownSeconds(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-xs text-white px-3.5 py-2 rounded-xl focus:outline-none focus:border-amber-500"
              />
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] text-slate-400">Segundos:</span>
                {[5, 10, 15, 20, 30].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setRewardCountdownSeconds(sec)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors ${
                      rewardCountdownSeconds === sec
                        ? 'bg-sky-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Tiempo que el usuario debe permanecer en el anuncio para recibir las monedas (por defecto: 15s).
              </span>
            </div>
          </div>

          {/* Sistema de Monedas (Coins Settings) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-900/90 rounded-2xl border border-amber-500/30">
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Monedas por cada anuncio visto</span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={coinsPerAd}
                onChange={(e) => setCoinsPerAd(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2 rounded-xl focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Por defecto: <strong>2 monedas</strong> generadas por anuncio de 15 segundos.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Monedas para desbloquear cada capítulo</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={coinsToUnlockEpisode}
                onChange={(e) => setCoinsToUnlockEpisode(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2 rounded-xl focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Por defecto: <strong>5 monedas</strong> necesarias para desbloquear cada capítulo.
              </span>
            </div>
          </div>

          {/* Adsterra Step-by-Step Instructions */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-[11px] space-y-1.5">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              ¿Cómo obtener tu Smartlink en Adsterra?
            </span>
            <ol className="list-decimal list-inside text-slate-300 space-y-0.5 pl-1 leading-relaxed">
              <li>Inicia sesión en tu cuenta de <strong className="text-white">Adsterra (Publishers)</strong>.</li>
              <li>Ve a la pestaña lateral <strong className="text-amber-300">Direct Links</strong> (Smartlink).</li>
              <li>Haz clic en <strong className="text-white">"Add Direct Link"</strong> y selecciona tu categoría (Mainstream / Erotic).</li>
              <li>Copia la URL directa que Adsterra te genera (ej. <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded text-[10px]">https://...</code>).</li>
              <li>Pégala arriba y haz clic en <strong>"Guardar Configuración"</strong>.</li>
            </ol>
          </div>

          {/* Explanatory Banner */}
          <div className="p-3 bg-amber-950/20 border border-amber-500/25 rounded-2xl text-[11px] text-amber-200/90 leading-relaxed">
            <span className="font-bold block mb-0.5 flex items-center gap-1 text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              ¿Cómo funciona el Rewarded Ad en SanShort?
            </span>
            Cuando un espectador llega a un capítulo bloqueado, verá una tarjeta cinemática donde puede hacer clic en <em>"Ver Anuncio / Desbloquear Gratis"</em>. Al pulsar, se abre tu Smartlink de Adsterra en una nueva pestaña y se desbloquea el capítulo inmediatamente.
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-xs sm:text-sm active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar Configuración de Monetización</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
