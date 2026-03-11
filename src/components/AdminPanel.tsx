import { useState, useEffect, FormEvent } from 'react';
import { Shield, Lock, Users, Tv, Plus, Trash2, LogOut, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Channel } from '../constants';
import { User } from '../types';

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'users' | 'raw'>('channels');
  
  // Admin Data
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [siteConfig, setSiteConfig] = useState<any>(null);
  
  // New Channel Form
  const [newChannel, setNewChannel] = useState({
    title: '',
    subtitle: '',
    category: '',
    thumbnail: '',
    url: '',
    isLive: true
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAdmin(true);
      fetchAdminData();
    }
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode })
      });
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsAdmin(true);
        fetchAdminData();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminData = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const [dataRes, usersRes] = await Promise.all([
        fetch('/api/admin/data', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (dataRes.ok && usersRes.ok) {
        const data = await dataRes.json();
        const usersData = await usersRes.json();
        setChannels(data.channels || []);
        setCategories(data.categories || ["Todos"]);
        setSiteConfig(data.siteConfig || { title: "TV Online HD", subtitle: "Os melhores canais ao vivo" });
        setUsers(usersData || []);
      } else if (dataRes.status === 403) {
        handleLogout();
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setAccessCode('');
  };

  const handleAddChannel = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const id = Math.random().toString(36).substr(2, 9);
    const updatedChannels = [...channels, { ...newChannel, id }];
    
    try {
      const response = await fetch('/api/admin/channels', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ channels: updatedChannels })
      });
      
      if (response.ok) {
        setChannels(updatedChannels);
        setNewChannel({ title: '', subtitle: '', category: '', thumbnail: '', url: '', isLive: true });
      }
    } catch (err) {
      console.error('Error adding channel:', err);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`/api/admin/channels/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setChannels(channels.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Error deleting channel:', err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-slate-400 text-sm mt-2">Insira o código de acesso para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Código de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-slate-800 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-4 rounded-2xl border border-red-500/20"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Verificando...' : 'Acessar Painel'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white">Admin Dashboard</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Sistema de Gerenciamento</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all mr-2"
          >
            Voltar ao Site
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 w-fit">
          <button 
            onClick={() => setActiveTab('channels')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'channels' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <Tv className="w-4 h-4" />
            Canais
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <Users className="w-4 h-4" />
            Usuários
          </button>
          <button 
            onClick={() => setActiveTab('raw')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'raw' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <Save className="w-4 h-4" />
            Dados Brutos
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'channels' && (
            <motion.div 
              key="channels"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Add Channel Form */}
              <div className="lg:col-span-1">
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sticky top-24">
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-red-500" />
                    Novo Canal
                  </h2>
                  <form onSubmit={handleAddChannel} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nome do Canal</label>
                      <input 
                        type="text" 
                        value={newChannel.title}
                        onChange={e => setNewChannel({...newChannel, title: e.target.value})}
                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        placeholder="Ex: Globo RJ"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Subtítulo / Qualidade</label>
                      <input 
                        type="text" 
                        value={newChannel.subtitle}
                        onChange={e => setNewChannel({...newChannel, subtitle: e.target.value})}
                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        placeholder="Ex: Full HD"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Categoria</label>
                      <select 
                        value={newChannel.category}
                        onChange={e => setNewChannel({...newChannel, category: e.target.value})}
                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        required
                      >
                        <option value="">Selecionar...</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">URL do Logo (Thumbnail)</label>
                      <input 
                        type="url" 
                        value={newChannel.thumbnail}
                        onChange={e => setNewChannel({...newChannel, thumbnail: e.target.value})}
                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        placeholder="https://..."
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">URL do Stream (HLS/Embed)</label>
                      <input 
                        type="url" 
                        value={newChannel.url}
                        onChange={e => setNewChannel({...newChannel, url: e.target.value})}
                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        placeholder="https://.../index.m3u8"
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all mt-2"
                    >
                      Adicionar Canal
                    </button>
                  </form>
                </div>
              </div>

              {/* Channels List */}
              <div className="lg:col-span-2">
                <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Canal</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {channels.map(channel => (
                        <tr key={channel.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={channel.thumbnail} alt="" className="w-10 h-10 rounded-lg object-contain bg-black p-1" />
                              <div>
                                <div className="text-sm font-bold text-white">{channel.title}</div>
                                <div className="text-xs text-slate-500">{channel.subtitle}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-800 rounded-md text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {channel.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDeleteChannel(channel.id)}
                              className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Favoritos</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pastas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.profileImage} alt="" className="w-8 h-8 rounded-full bg-slate-800" />
                          <div className="text-sm font-bold text-white">{user.username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-mono">{user.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{user.favorites.length}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{user.folders.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'raw' && (
            <motion.div 
              key="raw"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Tv className="w-4 h-4 text-red-500" />
                  canais.json
                </h3>
                <pre className="bg-black/50 p-6 rounded-2xl text-xs font-mono text-emerald-400 overflow-auto max-h-[400px]">
                  {JSON.stringify({ siteConfig, categories, channels }, null, 2)}
                </pre>
              </div>
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-red-500" />
                  users.json
                </h3>
                <pre className="bg-black/50 p-6 rounded-2xl text-xs font-mono text-emerald-400 overflow-auto max-h-[400px]">
                  {JSON.stringify(users, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
