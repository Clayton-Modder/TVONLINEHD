import { X, Trash2, Cast, Info, Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [cdn, setCdn] = useState('Default');
  const [clearing, setClearing] = useState(false);

  const handleClearCache = () => {
    setClearing(true);
    setTimeout(() => {
      localStorage.clear();
      setClearing(false);
      alert('Cache limpo com sucesso!');
    }, 1000);
  };

  const cdns = ['Default', 'CDN Global', 'CDN América Latina', 'CDN Europa'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Configurações
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* CDN Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Mudar CDN
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {cdns.map((option) => (
                    <button
                      key={option}
                      onClick={() => setCdn(option)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                        cdn === option 
                          ? 'bg-red-500/10 border-red-500 text-red-500' 
                          : 'bg-slate-800/50 border-white/5 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-sm">{option}</span>
                      {cdn === option && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chromecast Link */}
              <a 
                href="https://play.google.com/store/apps/details?id=com.instantbits.cast.webvideo&hl=pt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-white/5 hover:bg-slate-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Cast className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                  <div>
                    <p className="text-sm font-medium">Chromecast</p>
                    <p className="text-xs text-slate-500">Baixar Web Video Caster</p>
                  </div>
                </div>
                <div className="bg-slate-700 p-2 rounded-lg group-hover:bg-red-500 transition-colors">
                  <Globe className="w-4 h-4" />
                </div>
              </a>

              {/* Clear Cache */}
              <button 
                onClick={handleClearCache}
                disabled={clearing}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-slate-800 hover:bg-red-500/10 hover:text-red-500 border border-white/5 rounded-2xl transition-all group"
              >
                <Trash2 className={`w-5 h-5 ${clearing ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
                <span className="font-medium">{clearing ? 'Limpando...' : 'Limpar Cache'}</span>
              </button>

              {/* Version Info */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-slate-500">
                <div className="flex items-center gap-2 text-xs">
                  <Info className="w-4 h-4" />
                  <span>Versão do Site</span>
                </div>
                <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded">v1.0.4-stable</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
