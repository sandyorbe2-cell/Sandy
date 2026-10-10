import React, { useState } from 'react';
import { X, Coins, Sparkles, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MonetizationSettings } from '../types/drama';

interface CoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  monetizationSettings: MonetizationSettings;
  onWatchAdForCoins: () => void;
  isWatchingAd: boolean;
  adCountdown: number | null;
}

export const CoinsModal: React.FC<CoinsModalProps> = ({
  isOpen,
  onClose,
  coins,
  monetizationSettings,
  onWatchAdForCoins,
  isWatchingAd,
  adCountdown,
}) => {
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const seconds = monetizationSettings.rewardCountdownSeconds || 15;
  const coinsReward = monetizationSettings.coinsPerAd || 2;
  const costPerEpisode = monetizationSettings.coinsToUnlockEpisode || 5;
  const smartlinkUrl =
    monetizationSettings.adsterraSmartlinkUrl ||
    'https://asiafilm.org/4/d7b5b0245e4c479a08fb56712e7ba62d';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#16161E] rounded-3xl border border-amber-500/40 p-6 sm:p-7 shadow-2xl flex flex-col text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors"
          aria-label="Cerrar modal de monedas"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-800/80">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/25">
            <Coins className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>Billetera de Monedas</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full">
                Gratis
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Consigue monedas gratis viendo anuncios y desbloquea tus capítulos
            </p>
          </div>
        </div>

        {/* Coin Balance Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 flex items-center justify-between mb-5">
          <div>
            <span className="text-[11px] uppercase font-bold text-amber-300/90 tracking-wider block">
              Tu Saldo Actual
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-3xl font-black text-amber-400 tabular-nums">
                {coins}
              </span>
              <span className="text-sm font-bold text-slate-300">
                {coins === 1 ? 'Moneda' : 'Monedas'}
              </span>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <span className="block font-semibold text-slate-300">Desbloqueo</span>
            <span className="text-amber-400 font-bold">{costPerEpisode} monedas</span> / cap
          </div>
        </div>

        {/* How it works info */}
        <div className="space-y-2 mb-6 text-xs text-slate-300 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>¿Cómo conseguir más monedas?</span>
          </div>
          <ul className="space-y-1.5 pl-6 list-disc text-slate-400 text-[11px] leading-relaxed">
            <li>
              Abre el anuncio del patrocinador con el Smartlink.
            </li>
            <li>
              Permanece en el anuncio durante <strong className="text-amber-300">{seconds} segundos</strong>.
            </li>
            <li>
              Recibes automáticamente <strong className="text-amber-300">+{coinsReward} monedas</strong> en cada anuncio completado.
            </li>
            <li>
              Con <strong className="text-amber-300">{costPerEpisode} monedas</strong> desbloqueas cualquier capítulo bloqueado para siempre.
            </li>
          </ul>
        </div>

        {/* Action Button: Watch Ad */}
        {!isWatchingAd ? (
          <div className="space-y-3">
            <a
              href={smartlinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onWatchAdForCoins}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition-all text-sm active:scale-95 transform hover:scale-[1.02]"
            >
              <Coins className="w-5 h-5 fill-current" />
              <span>Ver Anuncio ({seconds}s) y Ganar +{coinsReward} Monedas</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>

            <p className="text-center text-[10px] text-slate-500">
              El anuncio se abre en una pestaña segura y no interrumpe la página principal.
            </p>
          </div>
        ) : (
          /* Active Countdown Screen */
          <div className="p-4 bg-slate-900 border border-amber-500/40 rounded-2xl text-center space-y-3 animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span>Viendo anuncio del patrocinador...</span>
            </div>

            <div className="text-4xl font-black text-white font-mono tabular-nums">
              {adCountdown}s
            </div>

            <p className="text-[11px] text-slate-300">
              Mantén el anuncio abierto durante los {seconds} segundos para recibir tus +{coinsReward} monedas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
