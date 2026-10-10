import React, { useState } from 'react';
import { Film, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="bg-black/90 border-t border-slate-800/80 mt-16 py-12 text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Column 1: Brand Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E50914] via-[#FF2E93] to-[#FFD700] flex items-center justify-center font-black text-white text-base">
              S
            </div>
            <span className="text-xl font-black text-white">
              San<span className="text-[#E50914]">Short</span>
            </span>
          </div>
          <p className="text-slate-500 leading-relaxed text-xs">
            Tu plataforma para disfrutar y subir capítulos de mini-dramas, novelas cortas y tramas de venganza en formato vertical de alta intensidad.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-white font-bold text-sm mb-3">Categorías Populares</h4>
          <ul className="space-y-2 text-slate-400 text-xs">
            <li>
              <a href="#populares" className="hover:text-white transition-colors">CEO y Multimillonarios Ocultos</a>
            </li>
            <li>
              <a href="#populares" className="hover:text-white transition-colors">Venganza de la Esposa</a>
            </li>
            <li>
              <a href="#populares" className="hover:text-white transition-colors">Reencarnación Suprema</a>
            </li>
            <li>
              <a href="#populares" className="hover:text-white transition-colors">Romance de Alta Sociedad</a>
            </li>
          </ul>
        </div>

        {/* Column 3: Legal & Support */}
        <div>
          <h4 className="text-white font-bold text-sm mb-3">Información y Creadores</h4>
          <ul className="space-y-2 text-slate-400 text-xs">
            <li>
              <span className="hover:text-white cursor-pointer transition-colors">Guía de Formato Vertical 9:16</span>
            </li>
            <li>
              <span className="hover:text-white cursor-pointer transition-colors">Términos de Servicio para Creadores</span>
            </li>
            <li>
              <span className="hover:text-white cursor-pointer transition-colors">Política de Privacidad</span>
            </li>
            <li>
              <span className="hover:text-white cursor-pointer transition-colors">Compatibilidad con Blogger</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Newsletter */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm">Nuevos Estrenos Diarios</h4>
          <p className="text-xs text-slate-500">
            Recibe avisos directos cuando se suban nuevos capítulos a la plataforma.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo electrónico..."
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#E50914]"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#E50914] to-[#FF2E93] hover:from-red-600 hover:to-pink-600 text-white font-bold py-2.5 rounded-xl text-xs transition-opacity shadow"
            >
              {subscribed ? '¡Suscrito con Éxito!' : 'Suscribirme a Novedades'}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-900 text-center text-slate-600 text-xs">
        <p>© 2026 SanShort. Todos los derechos reservados. Plataforma de Mini-Dramas y Mini-Novelas Verticales.</p>
      </div>
    </footer>
  );
};
