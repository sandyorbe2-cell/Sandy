import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#16161E] rounded-3xl border border-red-500/40 p-6 shadow-2xl relative text-left">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors"
          aria-label="Cancelar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0 shadow-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white leading-tight">
              {title}
            </h3>
            <span className="text-[11px] text-red-400 font-bold uppercase tracking-wider">
              Acción irreversible
            </span>
          </div>
        </div>

        {/* Item Box */}
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 my-3">
          <span className="text-xs text-slate-400 block mb-0.5">Elemento a eliminar:</span>
          <span className="text-sm font-bold text-white block truncate">
            {itemName}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Sí, Eliminar</span>
          </button>
        </div>

      </div>
    </div>
  );
};
