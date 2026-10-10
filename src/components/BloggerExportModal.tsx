import React, { useState } from 'react';
import { X, Copy, Check, FileCode, ExternalLink, Sparkles } from 'lucide-react';
import { Drama } from '../types/drama';

interface BloggerExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dramas: Drama[];
}

export const BloggerExportModal: React.FC<BloggerExportModalProps> = ({
  isOpen,
  onClose,
  dramas,
}) => {
  const [copied, setCopied] = useState(false);
  const [exportType, setExportType] = useState<'embed' | 'blogger_post' | 'json'>('blogger_post');

  if (!isOpen) return null;

  // Generate clean Blogger post HTML snippet
  const generateBloggerSnippet = () => {
    if (exportType === 'json') {
      return JSON.stringify(dramas, null, 2);
    }

    if (exportType === 'embed') {
      return `<!-- SanShort Vertical Mini-Drama Player Embed -->
<div style="position: relative; width: 100%; max-width: 450px; aspect-ratio: 9/16; margin: 0 auto; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
  <iframe src="${window.location.origin}" style="width: 100%; height: 100%; border: none;" allow="autoplay; fullscreen" loading="lazy"></iframe>
</div>`;
    }

    // Full Blogger post layout
    const dramaListHtml = dramas
      .map(
        (d) => `
    <!-- Mini Drama: ${d.title} -->
    <div style="background: #16161E; border-radius: 16px; overflow: hidden; margin-bottom: 24px; border: 1px solid #27273a; color: #fff; font-family: sans-serif;">
      <div style="display: flex; flex-wrap: wrap;">
        <div style="width: 120px; min-width: 120px; aspect-ratio: 2/3;">
          <img src="${d.poster}" alt="${d.title}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="padding: 16px; flex: 1; min-width: 200px;">
          <span style="color: #FF2E93; font-size: 11px; font-weight: bold; text-transform: uppercase;">${d.genre} · ${d.status}</span>
          <h3 style="margin: 4px 0 8px; font-size: 18px; color: #fff;">${d.title}</h3>
          <p style="font-size: 12px; color: #a1a1aa; line-height: 1.4; margin-bottom: 12px;">${d.synopsis}</p>
          <div style="font-size: 12px; font-weight: bold; color: #FFD700;">★ ${d.rating} · ${d.episodes.length} Capítulos Disponibles</div>
        </div>
      </div>
    </div>`
      )
      .join('\n');

    return `<!-- BLOGGER POST COMPATIBILITY: Mini-Dramas SanShort -->
<div class="sanshort-drama-catalog" style="max-width: 900px; margin: 0 auto; padding: 16px; background: #0D0D11; border-radius: 24px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #fff; font-size: 24px; font-weight: 800; font-family: sans-serif;">Mini-Dramas y Mini-Novelas en Español</h2>
    <p style="color: #94a3b8; font-size: 13px;">Episodios rápidos en formato vertical estilo ReelShort</p>
  </div>
${dramaListHtml}
</div>`;
  };

  const snippet = generateBloggerSnippet();

  const handleCopy = () => {
    navigator.clipboard?.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#16161E] rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-2xl relative max-h-[88vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Exportar Código para Blogger / Web
              </h3>
              <p className="text-xs text-slate-400">
                Pega este código en una entrada o gadget HTML de tu blog en Blogger
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

        {/* Format Selector */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setExportType('blogger_post')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              exportType === 'blogger_post'
                ? 'bg-[#E50914] text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Entrada / Post de Blogger (HTML)
          </button>
          <button
            onClick={() => setExportType('embed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              exportType === 'embed'
                ? 'bg-[#E50914] text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Reproductor Embebido (Iframe)
          </button>
          <button
            onClick={() => setExportType('json')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              exportType === 'json'
                ? 'bg-[#E50914] text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Datos en Bruto (JSON)
          </button>
        </div>

        {/* Code Viewbox */}
        <div className="flex-grow overflow-hidden flex flex-col bg-slate-950 rounded-2xl border border-slate-800 p-3">
          <textarea
            readOnly
            value={snippet}
            className="w-full h-64 bg-transparent text-slate-300 font-mono text-xs focus:outline-none resize-none no-scrollbar"
          />
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 mt-4">
          <span className="text-xs text-slate-500">
            {copied ? '¡Código copiado al portapapeles!' : 'Haz clic en copiar para pegar en Blogger'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 bg-gradient-to-r from-[#E50914] to-[#FF2E93] hover:from-red-600 hover:to-pink-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
