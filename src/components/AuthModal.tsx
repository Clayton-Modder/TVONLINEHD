import { useState, FormEvent } from 'react';
import { X, User, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthResponse } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        onSuccess(data.token, data.user);
        onClose();
      } else {
        setError(data.message || 'Ocorreu um erro');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
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
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {isLogin ? 'Entre para acessar seus favoritos' : 'Cadastre-se para salvar sua lista'}
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Nome de usuário
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Senha
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    isLogin ? 'Entrar' : 'Cadastrar'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-slate-400 text-sm hover:text-white transition-colors"
                >
                  {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
