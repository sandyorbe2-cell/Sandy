import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Key, LogOut, Check, AlertCircle } from 'lucide-react';
import { loginAdmin, logoutAdmin, updateAdminPin } from '../services/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onAdminStatusChange: (status: boolean) => void;
  onSuccessMessage?: (msg: string) => void;
  onOpenMonetization?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onAdminStatusChange,
  onSuccessMessage,
  onOpenMonetization,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [showChangePin, setShowChangePin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = loginAdmin(pinInput);
    if (success) {
      onAdminStatusChange(true);
      setSuccessMsg('¡Sesión de Administrador iniciada correctamente!');
      onSuccessMessage?.('Modo Administrador activado: Ahora puedes subir y eliminar capítulos.');
      setPinInput('');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } else {
      setErrorMsg('PIN de administrador incorrecto. El PIN por defecto es: 1234');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    onAdminStatusChange(false);
    onSuccessMessage?.('Sesión de Administrador cerrada.');
    onClose();
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = updateAdminPin(currentPinInput, newPinInput);
    if (success) {
      setSuccessMsg('¡Tu nueva clave de administrador ha sido guardada!');
      setCurrentPinInput('');
      setNewPinInput('');
      setShowChangePin(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg('PIN actual incorrecto o el nuevo PIN tiene menos de 4 caracteres.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#16161E] rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#E50914] to-[#FF2E93] flex items-center justify-center text-white shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              {isAdmin ? 'Panel de Administrador' : 'Acceso de Administrador'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAdmin
                ? 'Tienes permisos para subir y eliminar series y capítulos'
                : 'Ingresa tu clave de administrador para gestionar contenido'}
            </p>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login State */}
        {!isAdmin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#E50914]" />
                <span>PIN / Contraseña de Administrador</span>
              </label>
              <input
                type="password"
                required
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Ingresa tu PIN (por defecto: 1234)"
                className="w-full bg-slate-900 border border-slate-700 text-sm text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#E50914]"
              />
              <span className="text-[11px] text-slate-500 mt-1.5 block">
                * Clave predeterminada inicial: <strong className="text-slate-300">1234</strong> (la puedes cambiar cuando inicies sesión).
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#E50914] to-[#FF2E93] hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#E50914]/25 transition-all text-xs sm:text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verificar y Activar Modo Administrador</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="font-bold">Modo Administrador Activo</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">sandyorbe2</span>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p>✓ Subir nuevos capítulos y crear series.</p>
              <p>✓ Eliminar capítulos individuales desde el reproductor.</p>
              <p>✓ Eliminar series completas y gestionar catálogo.</p>
            </div>

            {!showChangePin ? (
              <div className="flex flex-col gap-2 pt-2">
                {onOpenMonetization && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenMonetization();
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-transform shadow-lg shadow-amber-500/20 active:scale-98"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Configurar Smartlinks Adsterra & Rewarded Ads</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowChangePin(true)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <Key className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>Cambiar Clave / PIN de Administrador</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-red-950/60 hover:bg-red-900/60 text-red-200 font-bold text-xs rounded-xl border border-red-800 flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión de Administrador</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePin} className="space-y-3 p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-white block">
                  Cambiar Clave de Administrador:
                </span>
                <div>
                  <input
                    type="password"
                    required
                    placeholder="PIN Actual (ej. 1234)"
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-2 rounded-xl focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    required
                    placeholder="Nuevo PIN (mínimo 4 caracteres)"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-2 rounded-xl focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#E50914] text-white text-xs font-bold rounded-xl"
                  >
                    Guardar Nuevo PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChangePin(false)}
                    className="px-3 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
